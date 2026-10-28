// In-memory provider and persistence tests: never loads real credentials or accesses application storage.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url), ts = require('typescript');
function load(relative, dependencies = {}) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const loaded = {exports: {}};
  new Function('require','exports','module',code)(name => dependencies[name] ?? require(name), loaded.exports, loaded);
  return loaded.exports;
}
const contract = load('../lib/gemini-analysis.ts');
const model = load('../lib/model.ts');
const rawDiagnostics = load('../lib/gemini-diagnostics.server.ts');
const diagnostics = {...rawDiagnostics, createGeminiDiagnostics: id => rawDiagnostics.createGeminiDiagnostics(id, {sink: () => {}})};
const provider = load('../lib/gemini-provider.server.ts', {'./gemini-analysis': contract, './gemini-diagnostics.server': diagnostics});
let db, journals, calls, mode, failSave, loseSaveResponse;
const environment = {GEMINI_API_KEY: 'unit-test-secret-never-real', GEMINI_MODEL: 'gemini-qa-test'};
const pdfBytes = new TextEncoder().encode('%PDF-1.4\nFictional only\n%%EOF\n');
const output = () => ({executiveSummary:'Fictional documents require human diligence.',businessOverview:'Fictional industrial software company.',findings:[{observation:'The PDF reports a pilot.',interpretation:'Pilot evidence is preliminary.',uncertainty:'No independent customer references.',counterargument:'A pilot may not convert.',documentIds:['doc-qa'],evidenceIds:[]}],risks:[{description:'Pilot conversion risk.',uncertainty:'Renewal history missing.',documentIds:['doc-qa']}],missingInformation:['Retention is not documented.'],diligenceQuestions:[{question:'Can pilot conversion be corroborated?',documentIds:['doc-qa']}]});
function reset() {
  mode='ok';calls=0;failSave=false;loseSaveResponse=false;journals=new Map();environment.GEMINI_API_KEY='unit-test-secret-never-real';
  const c={id:'case-qa',companyId:'company-qa',name:'Fictional case',stage:'Sourced',investmentStage:'Seed',owner:'QA',thesis:'Fictional thesis',strategy:'Fictional strategy',roundSize:'Unknown',checkSize:'Unknown',valuation:'Unknown',source:'QA',lead:'Unknown',notes:'Original context',createdAt:'2026-10-26T00:00:00Z',docs:[],evidence:[],runs:[],questions:[],reviews:[],recommendations:[],decisions:[],activity:[]};
  c.runs.push(model.analyze(c,'Historical rules-v1'));
  db={revision:0,role:'Analyst',companies:[{id:'company-qa',name:'Fictional QA',website:'https://qa.example',sector:'Software',geography:'Indonesia'}],cases:[c]};
}
const storage = {
  identity:async()=>({userId:'qa-owner',displayName:'QA operator'}),
  readState:async owner=>{assert.equal(owner,'qa-owner');return structuredClone(db);},
  saveState:async(owner,state,revision)=>{
    assert.equal(owner,'qa-owner');if(revision!==db.revision)throw Error('CONFLICT');if(failSave)throw Error('Storage interruption');
    state.revision=revision+1;db=structuredClone(state);if(loseSaveResponse)throw Error('Response lost after commit');return structuredClone(db);
  },
  bucket:()=>({
    get:async key=>{const text=journals.get(key);return text===undefined?null:{size:Buffer.byteLength(text),json:async()=>JSON.parse(text)};},
    put:async(key,value,options)=>{if(options?.onlyIf?.get('If-None-Match')==='*'&&journals.has(key))return null;journals.set(key,String(value));return {etag:'qa-etag'};},
  }),
};
async function prepareCasePdfInput({caseId,documentIds}) {
  assert.equal(caseId,'case-qa');assert.deepEqual(documentIds,['doc-qa']);
  return {version:'case-pdf-input-v1',caseId,workspaceRevision:db.revision,totalBytes:pdfBytes.length,documents:[{documentId:'doc-qa',originalFilename:'fictional.pdf',mimeType:'application/pdf',sizeBytes:pdfBytes.length,source:{description:'Fictional founder',documentType:'Pitch Deck',uploadedAt:'2026-10-26',uploadedBy:'QA'},bytes:pdfBytes,storageEtag:'source-version-qa'}]};
}
async function transport(url, options) {
  assert.equal(options.redirect,'manual','Both provider requests must use Workers-compatible manual redirect handling');
  assert.ok(url.startsWith('https://generativelanguage.googleapis.com/v1beta/models/'));
  assert.equal(options.headers['x-goog-api-key'],'unit-test-secret-never-real');assert.ok(!url.includes(environment.GEMINI_API_KEY));
  if(options.method!=='POST')return Response.json({supportedGenerationMethods:['generateContent']});
  calls++;
  const request=JSON.parse(options.body);
  for(const parameter of ['temperature','topP','topK','top_p','top_k']){
    assert.equal(Object.hasOwn(request.generationConfig,parameter),false,`Incompatible Gemini 3 sampling parameter transmitted: ${parameter}`);
    assert.equal(Object.hasOwn(request,parameter),false,`Sampling parameter misplaced on the request root: ${parameter}`);
  }
  assert.equal(request.generationConfig.responseMimeType,'application/json');assert.ok(request.generationConfig.responseJsonSchema);
  assert.ok(Buffer.byteLength(options.body)<provider.GEMINI_REQUEST_LIMIT);assert.ok(!options.body.includes(environment.GEMINI_API_KEY));
  const binary=request.contents[0].parts.find(p=>p.inlineData).inlineData;
  assert.equal(binary.mimeType,'application/pdf');assert.deepEqual(new Uint8Array(Buffer.from(binary.data,'base64')),pdfBytes);
  if(mode==='quota')return new Response('private provider details must not escape',{status:429});
  if(mode==='provider-error')return new Response('private provider details must not escape',{status:500});
  if(mode==='detailed-400')return Response.json({error:{status:'INVALID_ARGUMENT',message:'PRIVATE_PROVIDER_DETAILS '+environment.GEMINI_API_KEY,details:[{'@type':'type.googleapis.com/google.rpc.BadRequest',fieldViolations:[{field:'generation_config.response_json_schema',description:'PRIVATE_PROVIDER_DETAILS'}]}]}},{status:400});
  if(mode==='timeout')return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));
  if(mode==='invalid-json')return new Response('not valid envelope JSON');
  if(mode==='invalid-envelope-null')return Response.json(null);
  if(mode==='oversized-response')return new Response('x'.repeat(provider.GEMINI_RESPONSE_LIMIT+1));
  if(mode==='conflict'){db.cases[0].notes='Updated concurrently';db.revision++;}
  if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,15));
  const result=output();
  if(mode==='invalid-source')result.findings[0].documentIds=['not-provided'];
  if(mode==='invalid-shape')delete result.executiveSummary;
  const text=mode==='invalid-analysis-json'?'{incomplete':JSON.stringify(result);
  return Response.json({modelVersion:'qa-generated-model',candidates:[{finishReason:mode==='incomplete'?'MAX_TOKENS':'STOP',content:{parts:[{text}]}}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:200,totalTokenCount:300}});
}
const runner = load('../lib/gemini-run.server.ts', {
  './gemini-diagnostics.server': diagnostics,
  'cloudflare:workers':{env:environment},'./storage':storage,'./document-input.server':{prepareCasePdfInput},'./gemini-analysis':contract,'./model':model,
  './gemini-provider.server':{readGeminiConfig:env=>({...provider.readGeminiConfig(env),timeoutMs:mode==='timeout'?5:2000}),callGemini:(input,config,_transport,trace)=>provider.callGemini(input,config,transport,trace)},
});
const request = revision => ({caseId:'case-qa',name:'Due Diligence',documentIds:['doc-qa'],requestId:crypto.randomUUID(),revision});
const expectError = (fn,code) => assert.rejects(fn,error=>{assert.equal(error.code,code);return true;});
reset();const before=structuredClone(db);const req=request(0);const success=await runner.runGeminiAnalysis(req);
assert.equal(success.reused,false);assert.equal(calls,1);assert.equal(db.cases[0].runs.length,2);
const realRun=structuredClone(db.cases[0].runs[0]);assert.equal(realRun.simulated,false);assert.equal(realRun.gemini.modelVersion,'qa-generated-model');
assert.equal(realRun.gemini.input.caseContext.notes,'Original context');assert.equal(realRun.gemini.input.documents[0].storageEtag,'source-version-qa');
assert.equal(realRun.gemini.input.caseContext.analysisContext,'Due Diligence');
assert.equal(realRun.gemini.promptVersion,contract.GEMINI_PROMPT_VERSION);assert.equal(realRun.evidence.length,0);
assert.deepEqual(db.cases[0].runs[1],before.cases[0].runs[0]);assert.deepEqual(db.cases[0].decisions,before.cases[0].decisions);
assert.ok(!JSON.stringify(db).includes('"bytes":'));assert.ok(!JSON.stringify(db).includes(environment.GEMINI_API_KEY));
await runner.runGeminiAnalysis(req);assert.equal(calls,1);assert.equal(db.cases[0].runs.length,2);
await expectError(()=>runner.runGeminiAnalysis({...req,name:'Different context'}),'REQUEST_REUSED');
reset();environment.GEMINI_API_KEY='';await expectError(()=>runner.runGeminiAnalysis(request(0)),'MISSING_API_KEY');assert.equal(calls,0);assert.equal(db.cases[0].runs.length,1);
for(const [kind,code] of [['invalid-json','INVALID_RESPONSE'],['invalid-envelope-null','INVALID_RESPONSE'],['oversized-response','INVALID_RESPONSE'],['invalid-analysis-json','INVALID_RESPONSE'],['invalid-shape','INVALID_RESPONSE'],['invalid-source','INVALID_SOURCES'],['incomplete','INCOMPLETE_RESPONSE'],['quota','QUOTA_EXCEEDED'],['provider-error','PROVIDER_ERROR'],['detailed-400','PROVIDER_ERROR'],['timeout','TIMEOUT']]){
  reset();mode=kind;const id=request(0);await expectError(()=>runner.runGeminiAnalysis(id),code);assert.equal(calls,1);assert.equal(db.cases[0].runs.length,1);assert.equal(db.revision,0);
  await expectError(()=>runner.runGeminiAnalysis(id),code);assert.equal(calls,1,'Failed requests must not repeat the provider call');
  assert.ok([...journals.values()].every(text=>!text.includes('PRIVATE_PROVIDER_DETAILS')&&!text.includes('INVALID_ARGUMENT')),'Server-only provider details must not enter the journal');
}
reset();mode='conflict';const conflicting=request(0);await expectError(()=>runner.runGeminiAnalysis(conflicting),'REVISION_CONFLICT');
assert.equal(calls,1);assert.equal(db.cases[0].runs.length,1);assert.equal(db.cases[0].notes,'Updated concurrently');
await runner.runGeminiAnalysis({...conflicting,revision:db.revision});assert.equal(calls,1);assert.equal(db.cases[0].notes,'Updated concurrently');assert.equal(db.cases[0].runs[0].gemini.input.caseContext.notes,'Original context');
reset();mode='slow';const parallel=request(0);const results=await Promise.allSettled([runner.runGeminiAnalysis(parallel),runner.runGeminiAnalysis(parallel)]);
assert.ok(results.some(r=>r.status==='fulfilled'));assert.equal(calls,1);assert.equal(db.cases[0].runs.length,2);assert.equal(db.cases[0].activity.length,1);
reset();failSave=true;const retry=request(0);await expectError(()=>runner.runGeminiAnalysis(retry),'SAVE_UNCERTAIN');assert.equal(db.cases[0].runs.length,1);
failSave=false;await runner.runGeminiAnalysis(retry);assert.equal(calls,1);assert.equal(db.cases[0].runs.length,2);
reset();loseSaveResponse=true;await runner.runGeminiAnalysis(request(0));assert.equal(calls,1);assert.equal(db.cases[0].runs.length,2);
assert.ok([...journals.values()].every(text=>!text.includes(environment.GEMINI_API_KEY)&&!text.includes('"bytes":')));
console.log('Passed MOCKED: native PDF request/schema, no-key, invalid/incomplete JSON, invalid sources, quota, timeout, provider failure, historical compatibility, revision conflict/resume, atomic duplicate claims, failed/uncertain saves, no credential or PDF persistence. No live provider request was made.');
