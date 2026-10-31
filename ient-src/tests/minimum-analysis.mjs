// Entirely offline. Optional recorded response stays outside the repository.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {fictionalPdf} from './fictional-pdf.mjs';
const require=createRequire(import.meta.url),ts=require('typescript');
const forbiddenFetch=()=>{throw Error('Network forbidden in minimum analysis tests');};
function clock(){let time=0,id=0;const timers=new Map(),delays=[];return{timers,delays,get now(){return time;},setTimeout(fn,ms){delays.push(ms);timers.set(++id,{fn,at:time+ms});return id;},clearTimeout(id){timers.delete(id);},advance(ms){time+=ms;for(const [id,t]of[...timers])if(t.at<=time){timers.delete(id);t.fn();}}};}
function load(path,deps={},c=clock(),transport=forbiddenFetch){const loaded={exports:{}};const code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports','module','fetch','setTimeout','clearTimeout',code)(n=>deps[n]??require(n),loaded.exports,loaded,transport,c.setTimeout.bind(c),c.clearTimeout.bind(c));return loaded.exports;}
const analysis=load('../lib/gemini-analysis.ts'),model=load('../lib/model.ts'),fixtures=load('../lib/fixtures.ts',{'./model':model}),docContract=load('../lib/document-input.ts'),rawDiagnostics=load('../lib/gemini-diagnostics.server.ts');
const contextContract=load('../lib/investment-context.ts');
const prompts=load('../lib/minimum-analysis-prompt.ts'),minimum=load('../lib/minimum-analysis.ts');
const recorded=process.env.MINIMUM_QA_RESPONSE_FILE;
const envelope=recorded?JSON.parse(readFileSync(recorded,'utf8')):{modelVersion:'gemini-3.5-flash-lite',candidates:[{finishReason:'STOP',content:{parts:[{text:'Executive Summary\nFictional startup.\nFindings\nReported ARR USD 100000 and 12 customers.\nRisks\nRetention unknown.\nDiligence Questions\nVerify customer renewals.'}]}}]};
assert.equal(envelope.candidates[0].finishReason,'STOP');
const originalText=envelope.candidates[0].content.parts.filter(p=>!p.thought).map(p=>p.text||'').join(''),pdf=fictionalPdf(),reports=[];
const sameText=run=>assert.equal(run.assessment,originalText);
function harness(mode='success',language='id-ID'){
 const c=clock(),logs=[],diagnostics={...rawDiagnostics,createGeminiDiagnostics:id=>rawDiagnostics.createGeminiDiagnostics(id,{now:()=>c.now,sink:e=>logs.push(e)})};
 const provider=load('../lib/gemini-provider.server.ts',{'./gemini-analysis':analysis,'./gemini-diagnostics.server':diagnostics},c);
 let db=fixtures.seed();db.cases[0].docs.push({id:'pdf-local-qa',name:'fictional.pdf',type:'Pitch Deck',source:'Fictional QA',size:pdf.length,createdAt:'2026-10-26',author:'QA',processing:'Uploaded'});
 const files=new Map([['pdf-local-qa',pdf]]);for(let i=2;i<=5;i++){const id='pdf-qa-'+i,bytes=fictionalPdf(['Fictional source '+i,'Different PDF contents '+i]);files.set(id,bytes);db.cases[0].docs.push({id,name:'fictional-'+i+'.pdf',type:'Financials',source:'Fictional QA '+i,size:bytes.length,createdAt:'2026-10-27',author:'QA',processing:'Uploaded'});}
 const initial=structuredClone(db),journals=new Map(),counts={transport:0,saves:0},requests=[];
 const flags={authenticated:true,owner:'qa-owner',available:true,validPdf:true,saveFails:false,loseSave:false,finalJournalFails:false,readyJournalFails:false,failedJournalFails:false};
 const environment={GEMINI_API_KEY:'offline-secret-never-real',GEMINI_MODEL:'gemini-3.8-flash'};
 const storage={identity:async()=>{if(!flags.authenticated)throw Error('AUTH_REQUIRED');return{userId:flags.owner,displayName:'QA'};},readState:async owner=>owner==='qa-owner'?structuredClone(db):{...structuredClone(db),cases:[]},saveState:async(owner,s,revision)=>{
  assert.equal(owner,'qa-owner');if(revision!==db.revision)throw Error('CONFLICT');if(flags.saveFails)throw Error('Fictional save failure');s.revision=revision+1;db=structuredClone(s);counts.saves++;if(flags.loseSave)throw Error('Lost commit response');return structuredClone(db);
 },bucket:()=>({get:async key=>{
  if(key.endsWith('.json')){const value=journals.get(key);return value===undefined?null:{size:Buffer.byteLength(value),json:async()=>JSON.parse(value)};}
  const id=key.replace('qa-owner/',''),original=files.get(id);if(!key.startsWith('qa-owner/')||!original||!flags.available)return null;
  const bytes=flags.validPdf?original:new TextEncoder().encode('x'.repeat(original.length));return{size:bytes.length,etag:flags.etag||'fictional-source-version',body:new Response(bytes).body};
 },put:async(key,value,options)=>{
  if(options?.onlyIf?.get('If-None-Match')==='*'&&journals.has(key))return null;
  const j=JSON.parse(value);if((j.status==='saved'&&flags.finalJournalFails)||(j.status==='generated'&&flags.readyJournalFails)||(j.status==='failed'&&flags.failedJournalFails))throw Error('Fictional journal failure');journals.set(key,String(value));return{etag:'fictional-journal'};
 }})};
 const docs=load('../lib/document-input.server.ts',{'./storage':storage,'./document-input':docContract},c);
 async function transport(url,o){counts.transport++;assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');assert.equal(o.redirect,'manual');assert.equal(o.method,'POST');assert.equal(o.headers['x-goog-api-key'],environment.GEMINI_API_KEY);
  const request=JSON.parse(o.body);assert.deepEqual(Object.keys(request).sort(),['contents','generationConfig']);assert.deepEqual(request.generationConfig,{maxOutputTokens:8192});assert.equal(request.contents[0].role,'user');requests.push(request);const parts=request.contents[0].parts;assert.equal(parts[0].text,minimum.MULTI_PDF_CONTEXT);assert.equal(parts.at(-1).text,prompts.getMinimumAnalysisPrompt(language).instruction);assert.ok(parts.length>=5&&parts.length<=13);assert.deepEqual(JSON.parse(parts.at(-2).text).snapshot,contextContract.buildInvestmentContext(db.companies.find(co=>co.id===db.cases[0].companyId),db.cases[0],'Due Diligence'));const ids=[];for(let i=1;i<parts.length-2;i+=2){const label=JSON.parse(parts[i].text),id=label.documentId;ids.push(id);assert.equal(label.sourceLabel,'SOURCE-'+((i+1)/2));assert.equal(label.originalFilename,db.cases[0].docs.find(d=>d.id===id).name);assert.equal(parts[i+1].inlineData.mimeType,'application/pdf');assert.deepEqual(new Uint8Array(Buffer.from(parts[i+1].inlineData.data,'base64')),files.get(id));}assert.equal(new Set(ids).size,ids.length);assert.ok(Buffer.byteLength(o.body)<=provider.GEMINI_REQUEST_LIMIT);assert.ok(!o.body.includes(environment.GEMINI_API_KEY));
  if(mode==='provider400')return Response.json({error:{status:'INVALID_ARGUMENT',message:'Invalid argument offline-secret-never-real'}},{status:400});
  if(mode==='timeout')return new Promise((_,reject)=>o.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));
  if(mode==='invalid-json')return new Response('not-json');
  if(mode==='incomplete')return Response.json({candidates:[{finishReason:'MAX_TOKENS'}]});
  if(mode==='invalid-text')return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:{invalid:true}}]}}]});
  if(mode==='revision-race')db.revision++;
  return Response.json(mode==='usage'?{...envelope,usageMetadata:{promptTokenCount:123,candidatesTokenCount:45,totalTokenCount:168}}:mode==='invalid-usage'?{...envelope,usageMetadata:{promptTokenCount:-1,candidatesTokenCount:'private-text',totalTokenCount:Infinity}}:envelope);
 }
 const route=load('../app/api/analysis/minimum/route.ts',{'cloudflare:workers':{env:environment},'@/lib/storage':storage,'@/lib/model':model,'@/lib/document-input.server':docs,'@/lib/gemini-provider.server':provider,'@/lib/gemini-analysis':analysis,'@/lib/gemini-diagnostics.server':diagnostics,'@/lib/minimum-analysis-prompt':prompts,'@/lib/document-input':docContract,'@/lib/minimum-analysis':minimum,'@/lib/investment-context':contextContract},c,transport);
 const workspace=load('../app/api/workspace/route.ts',{'@/lib/storage':{...storage,failure:e=>Response.json({error:e.message},{status:500})},'@/lib/model':model},c);
 const input=()=>({caseId:db.cases[0].id,name:'Due Diligence',documentIds:['pdf-local-qa'],requestId:crypto.randomUUID(),revision:db.revision,...(language!=='id-ID'?{locale:language}:{})});
 const post=async(data,expected=200,headers={})=>{const response=await route.POST(new Request('http://127.0.0.1:5199/api/analysis/minimum',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:typeof data==='string'?data:JSON.stringify(data)}));const body=await response.json();assert.ok((Array.isArray(expected)?expected:[expected]).includes(response.status),JSON.stringify({expected,status:response.status,code:body.code,error:body.error}));assert.equal(response.headers.get('Cache-Control'),'private, no-store');return body;};
 return{post,input,flags,counts,c,journals,environment,initial,logs,workspace,requests,files,get db(){return db;}};
}
export {harness,contextContract,prompts,minimum};
let renderState;
{
 const h=harness(),input=h.input(),success=await h.post(input);assert.equal(h.counts.transport,1);assert.equal(h.environment.GEMINI_MODEL,'gemini-3.8-flash');
 const run=h.db.cases[0].runs[0];sameText(run);assert.equal(run.simulated,false);assert.deepEqual(run.findings,[]);assert.deepEqual(run.evidence,[]);assert.equal(run.gemini,undefined);assert.ok(run.version.startsWith('gemini-text:gemini-3.5-flash-lite:'));assert.equal(run.name,input.name);
 assert.deepEqual(h.db.cases[0].runs[1],h.initial.cases[0].runs[0]);assert.deepEqual(h.db.cases[0].evidence,h.initial.cases[0].evidence);
 const journal=[...h.journals.values()].map(JSON.parse)[0];assert.equal(journal.status,'saved');assert.deepEqual(journal.envelope,envelope);assert.equal(journal.provenance.documents[0].storageEtag,'fictional-source-version');assert.equal(journal.provenance.language,'id-ID');assert.equal(journal.provenance.promptVersion,'minimum-pdf-text-v3');assert.equal(journal.provenance.instruction,prompts.getMinimumAnalysisPrompt().instruction);assert.equal(run.version,'gemini-text:gemini-3.5-flash-lite:minimum-pdf-text-v3');assert.ok(!JSON.stringify(journal).includes('offline-secret-never-real'));
 await h.post(input);assert.equal(h.counts.transport,1);assert.equal(h.counts.saves,1);
 assert.equal((await h.post({...input,name:'Other context'},409)).code,'REQUEST_REUSED');assert.equal((await h.post({...input,documentIds:['different-pdf']},409)).code,'REQUEST_REUSED');assert.equal((await h.post({...input,caseId:h.db.cases[1].id},409)).code,'REQUEST_REUSED');assert.equal(h.counts.transport,1);
 const review=await h.workspace.POST(new Request('http://127.0.0.1:5199/api/workspace',{method:'POST',body:JSON.stringify({action:'review',revision:h.db.revision,caseId:input.caseId,payload:{runId:success.runId,outcome:'Agree',rationale:'Offline human review of captured provider text.'}})}));assert.equal(review.status,200);assert.ok(h.db.cases[0].reviews.some(r=>r.runId===run.id));sameText(h.db.cases[0].runs[0]);renderState=structuredClone(h.db);
 h.journals.clear();assert.equal((await h.post(input,503)).code,'REQUEST_UNCERTAIN');assert.equal(h.counts.transport,1);
 reports.push('captured text, provenance, non-simulated Run, reload, Human Review, history and intent replay');
}
{
 const h=harness('success','en-US');await h.post(h.input());const journal=JSON.parse([...h.journals.values()][0]);assert.equal(journal.provenance.language,'en-US');sameText(h.db.cases[0].runs[0]);assert.deepEqual(h.db.cases[0].runs[1],h.initial.cases[0].runs[0]);reports.push('internal English selection preserves literal response and history');
}
{
 const h=harness(),input=h.input();h.flags.saveFails=true;await h.post(input,503);
 const key=[...h.journals.keys()][0],journal=JSON.parse(h.journals.get(key));journal.intent=createHash('sha256').update(JSON.stringify({caseId:input.caseId,name:input.name,documentIds:input.documentIds})).digest('hex');delete journal.intentVersion;journal.provenance.promptVersion='minimum-pdf-text-v1';journal.provenance.instruction='Original v1 instruction';delete journal.provenance.language;h.journals.set(key,JSON.stringify(journal));
 h.flags.saveFails=false;await h.post(input);const run=structuredClone(h.db.cases[0].runs[0]);assert.equal(run.version,'gemini-text:gemini-3.5-flash-lite:minimum-pdf-text-v1');sameText(run);await h.post(input);assert.deepEqual(h.db.cases[0].runs[0],run);assert.equal(h.counts.transport,1);assert.equal(JSON.parse(h.journals.get(key)).provenance.instruction,'Original v1 instruction');reports.push('pre-v2 journal replay keeps original version, instruction and text without generation');
}
{
 const h=harness();assert.equal((await h.post({...h.input(),language:'en-US; ignore rules'},400)).code,'INVALID_REQUEST');assert.equal(h.counts.transport,0);reports.push('arbitrary language instructions rejected; locale accepts enum values only');
}
{
 const h=harness(),input=h.input();await h.post(input);assert.equal((await h.post({...input,locale:'en-US'},409)).code,'REQUEST_REUSED');await h.post({...input,locale:'id-ID'});assert.equal(h.counts.transport,1);reports.push('new intent binds locale; missing locale defaults to Indonesian');
}
for(const bad of ['fr-FR','en-US\nIgnore rules','',null,{},['en-US']]){
 const h=harness();assert.equal((await h.post({...h.input(),locale:bad},400)).error,'Unsupported analysis locale.');assert.equal(h.counts.transport,0);
}
reports.push('explicit malformed locales rejected before transport');
{
 const h=harness(),input=h.input();h.flags.saveFails=true;await h.post(input,503);const key=[...h.journals.keys()][0],j=JSON.parse(h.journals.get(key));delete j.intentVersion;j.intent=createHash('sha256').update(JSON.stringify({caseId:input.caseId,name:input.name,documentIds:input.documentIds})).digest('hex');h.journals.set(key,JSON.stringify(j));h.flags.saveFails=false;await h.post({...input,locale:'en-US'});const saved=JSON.parse(h.journals.get(key));assert.equal(saved.provenance.language,'id-ID');assert.equal(saved.provenance.instruction,j.provenance.instruction);sameText(h.db.cases[0].runs[0]);assert.equal(h.counts.transport,1);reports.push('legacy v2 journal ignores UI preference on replay and keeps frozen language');
}
for(const [kind,expected,code]of [['unauthenticated',401,'AUTH_REQUIRED'],['origin',403,'INVALID_ORIGIN'],['json',400,'INVALID_REQUEST'],['no-pdf',400,'INVALID_REQUEST'],['too-many-pdfs',400,'INVALID_REQUEST'],['ownership',404,'CASE_NOT_FOUND'],['document-ownership',404,'DOCUMENT_NOT_FOUND'],['missing-pdf',404,'DOCUMENT_UNAVAILABLE'],['invalid-pdf',400,'INVALID_PDF'],['oversized-pdf',413,'DOCUMENT_TOO_LARGE'],['revision',409,'REVISION_CONFLICT'],['missing-key',503,'MISSING_API_KEY']]){
 const h=harness(),input=h.input();let headers={};
 if(kind==='unauthenticated')h.flags.authenticated=false;if(kind==='origin')headers={Origin:'https://untrusted.invalid'};if(kind==='no-pdf')input.documentIds=[];if(kind==='too-many-pdfs')input.documentIds=Array(6).fill('pdf-local-qa');if(kind==='ownership')h.flags.owner='other-owner';if(kind==='document-ownership')input.documentIds=['foreign-pdf'];if(kind==='missing-pdf')h.flags.available=false;if(kind==='invalid-pdf')h.flags.validPdf=false;if(kind==='oversized-pdf')h.db.cases[0].docs.find(d=>d.id==='pdf-local-qa').size=10*1024*1024+1;if(kind==='revision')input.revision++;if(kind==='missing-key')h.environment.GEMINI_API_KEY='';
 assert.equal((await h.post(kind==='json'?'{':input,expected,headers)).code,code);assert.equal(h.counts.transport,0);assert.deepEqual(h.db.cases[0].runs,h.initial.cases[0].runs);reports.push(kind+' rejected before transport');
}
for(const [mode,code,status]of [['provider400','PROVIDER_ERROR',502],['invalid-json','INVALID_RESPONSE',502],['incomplete','INCOMPLETE_RESPONSE',502],['invalid-text','INVALID_RESPONSE',502]]){
 const h=harness(mode),input=h.input();assert.equal((await h.post(input,status)).code,code);assert.equal((await h.post(input,status)).code,code);assert.equal(h.counts.transport,1);assert.deepEqual(h.db.cases[0].runs,h.initial.cases[0].runs);reports.push(mode+' cached failure without generation retry');
}
{
 const h=harness('timeout'),input=h.input(),pending=h.post(input,504);while(h.counts.transport===0)await new Promise(r=>setImmediate(r));h.c.advance(90000);assert.equal((await pending).code,'TIMEOUT');assert.equal((await h.post(input,504)).code,'TIMEOUT');assert.deepEqual(h.c.delays,[90000]);assert.equal(h.counts.transport,1);reports.push('shared deadline and failed request replay');
}
{
 const h=harness(),input=h.input();h.flags.saveFails=true;assert.equal((await h.post(input,503)).code,'SAVE_UNCERTAIN');assert.equal([...h.journals.values()].map(JSON.parse)[0].status,'generated');h.flags.saveFails=false;await h.post(input);assert.equal(h.counts.transport,1);sameText(h.db.cases[0].runs[0]);reports.push('save recovery reuses captured response');
}
{
 const h=harness('revision-race'),input=h.input();assert.equal((await h.post(input,409)).code,'REVISION_CONFLICT');await h.post({...input,revision:h.db.revision});assert.equal(h.counts.transport,1);reports.push('revision conflict preserves response');
}
for(const flag of ['loseSave','finalJournalFails']){
 const h=harness();h.flags[flag]=true;await h.post(h.input());assert.equal(h.db.cases[0].runs.length,h.initial.cases[0].runs.length+1);sameText(h.db.cases[0].runs[0]);reports.push(flag+' cannot mask a committed Run');
}
{
 const h=harness();h.flags.readyJournalFails=true;const input=h.input();assert.equal((await h.post(input,503)).code,'REQUEST_UNCERTAIN');assert.equal((await h.post(input,503)).code,'REQUEST_UNCERTAIN');assert.equal(h.counts.transport,1);assert.deepEqual(h.db.cases[0].runs,h.initial.cases[0].runs);reports.push('response retention failure blocks duplicate generation');
}
{
 const h=harness('provider400');h.flags.failedJournalFails=true;const input=h.input();assert.equal((await h.post(input,502)).code,'PROVIDER_ERROR');assert.equal((await h.post(input,409)).code,'REQUEST_IN_PROGRESS');assert.equal(h.counts.transport,1);reports.push('failed journal write leaves protective started claim');
}
for(const corrupt of ['{','x'.repeat(512*1024+1)]){
 const h=harness(),input=h.input();h.journals.set('qa-owner/minimum-analysis/'+input.requestId+'.json',corrupt);assert.equal((await h.post(input,503)).code,'REQUEST_UNCERTAIN');assert.equal(h.counts.transport,0);reports.push('unreadable journal cannot start a generation');
}
{
 const h=harness(),input=h.input();const outcomes=await Promise.all([h.post(input,[200,409]),h.post(input,[200,409])]);assert.ok(outcomes.some(o=>o.runId));assert.equal(h.counts.transport,1);reports.push('atomic concurrent claim');
}
{
 const h=harness();await h.post(h.input());await h.post(h.input());assert.equal(h.counts.transport,2);assert.equal(h.db.cases[0].runs.length,h.initial.cases[0].runs.length+2);reports.push('independent IDs work without QA lifetime cap');
}
for(const ids of [['pdf-local-qa'],['pdf-qa-2','pdf-local-qa'],['pdf-local-qa','pdf-qa-2','pdf-qa-3','pdf-qa-4','pdf-qa-5']]){
 const h=harness(),input={...h.input(),documentIds:ids},result=await h.post(input),run=structuredClone(h.db.cases[0].runs[0]),frozen=run.minimum;
 assert.equal(h.counts.transport,1);assert.deepEqual(frozen.documents.map(d=>d.documentId),ids);assert.deepEqual(frozen.documents.map(d=>d.order),ids.map((_,i)=>i+1));assert.equal(frozen.locale,'id-ID');assert.equal(frozen.promptVersion,prompts.MINIMUM_PROMPT_VERSION);assert.equal(frozen.requestId,input.requestId);for(const doc of frozen.documents){assert.equal(doc.storageEtag,'fictional-source-version');assert.equal(doc.sizeBytes,h.files.get(doc.documentId).length);assert.ok(!('bytes'in doc));}
 assert.deepEqual(h.requests[0].contents[0].parts.filter(p=>p.inlineData).length,ids.length);const j=JSON.parse([...h.journals.values()][0]);assert.equal(j.intentVersion,contextContract.INVESTMENT_CONTEXT_VERSION);assert.ok(!JSON.stringify(j).includes(Buffer.from(pdf).toString('base64')));
 h.flags.available=false;h.db.cases[0].docs=[];await h.post(input);await h.post({action:'save',caseId:input.caseId,requestId:input.requestId,revision:h.db.revision});assert.equal(h.counts.transport,1);assert.deepEqual(h.db.cases[0].runs.find(r=>r.id===result.runId),run);assert.equal(h.counts.saves,1);
 reports.push(ids.length+' PDF(s) once in one payload; saved ordered provenance and replay independent of current documents');
}
for(const [ids,code,status]of [[['pdf-local-qa','pdf-local-qa'],'DUPLICATE_DOCUMENT',400],[['pdf-local-qa','foreign-pdf'],'DOCUMENT_NOT_FOUND',404],[['pdf-local-qa','missing-id'],'DOCUMENT_NOT_FOUND',404]]){
 const h=harness();assert.equal((await h.post({...h.input(),documentIds:ids},status)).code,code);assert.equal(h.counts.transport,0);
}reports.push('duplicate/missing/foreign selection rejected before generation');
{
 const h=harness();h.db.cases[0].docs.find(d=>d.id==='pdf-local-qa').size=7*1024*1024;h.db.cases[0].docs.find(d=>d.id==='pdf-qa-2').size=6*1024*1024;assert.equal((await h.post({...h.input(),documentIds:['pdf-local-qa','pdf-qa-2']},413)).code,'INPUT_TOO_LARGE');assert.equal(h.counts.transport,0);reports.push('combined 12 MiB limit enforced before provider');
}
{
 const h=harness(),a=h.input();await h.post(a);const first=JSON.parse([...h.journals.values()][0]);await h.post({...h.input(),documentIds:['pdf-local-qa','pdf-qa-2']});const second=JSON.parse([...h.journals.values()][1]);assert.notEqual(first.intent,second.intent);assert.equal(h.counts.transport,2);assert.equal((await h.post({...a,documentIds:['pdf-qa-2','pdf-local-qa']},409)).code,'REQUEST_REUSED');assert.equal(h.counts.transport,2);reports.push('changed document set/order binds a distinct intent; same ID cannot change selection');
}
{
 const h=harness();await h.post(h.input());const first=JSON.parse([...h.journals.values()][0]);h.flags.etag='changed-source-version';await h.post(h.input());const second=JSON.parse([...h.journals.values()][1]);assert.notEqual(first.intent,second.intent);assert.equal(h.db.cases[0].runs[0].minimum.documents[0].storageEtag,'changed-source-version');reports.push('ETag change on a fresh request changes frozen intent and provenance');
}
{
 const h=harness();h.flags.saveFails=true;const input=h.input();await h.post(input,503);const key=[...h.journals.keys()][0],j=JSON.parse(h.journals.get(key));j.intentVersion='locale-v1';j.intent=createHash('sha256').update(JSON.stringify({caseId:input.caseId,name:input.name,documentIds:input.documentIds,locale:'id-ID'})).digest('hex');h.journals.set(key,JSON.stringify(j));h.flags.saveFails=false;await h.post(input);assert.equal(h.db.cases[0].runs[0].minimum,undefined);assert.equal(h.counts.transport,1);reports.push('historical locale-v1 journal recovers without backfilling Run or generation');
}
{
 const h=harness();await h.post(h.input());assert.deepEqual(JSON.parse(JSON.stringify(h.db.cases[0].runs[0].minimum.usage)),{});assert.equal(h.db.cases[0].runs[0].minimum.inputVersion,minimum.MINIMUM_INPUT_VERSION);reports.push('missing usage remains unknown, not fabricated');
}

for(const mode of ['usage','invalid-usage']){const h=harness(mode);await h.post(h.input());assert.deepEqual(JSON.parse(JSON.stringify(h.db.cases[0].runs[0].minimum.usage)),mode==='usage'?{promptTokens:123,outputTokens:45,totalTokens:168}:{});}reports.push('allowlisted numeric usage only, hostile/invalid values omitted');
{
 const h=harness(),first={...h.input(),documentIds:['pdf-local-qa','pdf-qa-2']};await h.post(first);const j1=JSON.parse([...h.journals.values()][0]);assert.equal((await h.post({...first,documentIds:[...first.documentIds].reverse()},409)).code,'REQUEST_REUSED');await h.post({...h.input(),documentIds:[...first.documentIds].reverse()});const j2=JSON.parse([...h.journals.values()][1]);assert.notEqual(j1.intent,j2.intent);assert.equal(h.counts.transport,2);reports.push('ordered selection binds distinct source labels, intent and request');
}
{
 const h=harness();for(const [id,size]of [['pdf-local-qa',10*1024*1024],['pdf-qa-2',2*1024*1024]]){const bytes=new Uint8Array(size).fill(32);bytes.set(new TextEncoder().encode('%PDF-1.4\n'));bytes.set(new TextEncoder().encode('%%EOF\n'),size-6);h.files.set(id,bytes);h.db.cases[0].docs.find(d=>d.id===id).size=size;}await h.post({...h.input(),documentIds:['pdf-local-qa','pdf-qa-2']});assert.equal(h.counts.transport,1);assert.equal(h.db.cases[0].runs[0].minimum.documents.reduce((sum,d)=>sum+d.sizeBytes,0),12*1024*1024);reports.push('10 MiB per-file and exact 12 MiB combined boundary fits unchanged 20 MB payload limit');
}
for(const [ids,code]of [[[],'Select between 1 and 5 documents from one investment case.'],[['x'],'A selected document was not found in this investment case. Reload the document list.'],[['pdf-local-qa','pdf-local-qa'],'Select each PDF only once.']]){const h=harness();assert.equal(docContract.pdfSelectionStatus(h.db.cases[0].docs,ids).error,code);}reports.push('client feedback rejects empty, missing and duplicate selections');
const {build}=require('esbuild');const bundle=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {LocaleProvider} from './app/localization';import AnalysisWorkspace from './app/analysis-workspace';export function render(state,index=0){const c=state.cases[0],noop=()=>{};return renderToStaticMarkup(React.createElement(LocaleProvider,{initialLocale:'en-US'},React.createElement(AnalysisWorkspace,{c,run:c.runs[index],busy:false,showReadiness:false,onReadiness:noop,onSelectRun:noop,onRun:async()=>false,onGemini:async()=>({saved:false}),onEvidence:noop,onReview:noop,onQuestion:noop,onTab:noop})));}`,loader:'tsx',resolveDir:fileURLToPath(new URL('../',import.meta.url))},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-dom/server']});
const rendered={exports:{}};new Function('require','exports','module',bundle.outputFiles[0].text)(require,rendered.exports,rendered);
const html=rendered.exports.render(renderState),escaped=originalText.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');assert.ok(html.includes('Full original report'));assert.ok(html.includes(escaped.match(/[A-Za-z]{4,}/)?.[0]||''));assert.ok(html.includes('Gemini · PDF text')&&html.includes('Review analysis')&&html.includes('Offline human review'));assert.ok(!html.includes('There is no factual basis')&&!html.includes('Key findings'));assert.ok(!rendered.exports.render(renderState,1).includes('Original Gemini PDF analysis'));reports.push('actual text rendered safely, review visible, legacy renderer retained');
console.log(JSON.stringify({passed:reports.length,scenarios:reports,capturedRealResponseUsed:Boolean(recorded),analysisSha256:createHash('sha256').update(originalText).digest('hex'),realGenerationRequests:0,realMetadataRequests:0},null,2));
