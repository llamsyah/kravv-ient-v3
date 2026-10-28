// Offline only: actual adapter/orchestrator, virtual shared clock, in-memory data.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const forbiddenNetwork = () => {throw Error('Offline test forbids network');};
function clock() {
  let now = 0, id = 0; const timers = new Map(), delays = [];
  return {timers, delays, get now() {return now;}, setTimeout(fn, delay) {delays.push(delay); timers.set(++id, {fn, at: now + delay}); return id;}, clearTimeout(i) {timers.delete(i);}, advance(ms) {now += ms; for (const [i,t] of [...timers]) if (t.at <= now) {timers.delete(i); t.fn();}}};
}
function load(path, dependencies = {}, c = clock()) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const loaded = {exports: {}};
  new Function('require','module','exports','setTimeout','clearTimeout','fetch',code)(n => dependencies[n] ?? require(n), loaded, loaded.exports, c.setTimeout.bind(c), c.clearTimeout.bind(c), forbiddenNetwork);
  return loaded.exports;
}
const diagnostics = load('../lib/gemini-diagnostics.server.ts'), contract = load('../lib/gemini-analysis.ts'), model = load('../lib/model.ts');
const deferred = () => {let resolve; const promise = new Promise(r => {resolve = r;}); return {promise, resolve};};
const settled = p => p.then(value => ({value}), error => ({error}));
const until = async fn => {for (let i=0;i<100;i++) {if (fn()) return; await new Promise(r => setImmediate(r));} assert.fail('Expected offline phase was not reached');};
const fakeKey = 'PRIVATE_FAKE_KEY', privateData = 'PRIVATE_FICTIONAL_COMPANY', privateResponse = 'PRIVATE_PROVIDER_BODY';
const valid = () => ({executiveSummary: privateData, businessOverview:'Fictional software.', findings:[{observation:'Fictional pilot.',interpretation:'Early.',uncertainty:'Unknown.',counterargument:'May fail.',documentIds:['qa-doc'],evidenceIds:[]}], risks:[],missingInformation:[],diligenceQuestions:[]});
const meta = () => Response.json({supportedGenerationMethods:['generateContent']});
const envelope = (value = valid()) => Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]});
const abortError = () => new DOMException('PRIVATE_ABORT_DETAIL', 'AbortError');
const waitAbort = signal => new Promise((_,reject) => {if (signal.aborted) reject(abortError()); else signal.addEventListener('abort', () => reject(abortError()), {once:true});});
const reports = [], allLogs = [];
function harness(mode = 'ok', options = {}) {
  const c = clock(), logs = [], sink = e => {logs.push(e); allLogs.push(e);};
  const diag = {...diagnostics, createGeminiDiagnostics: id => diagnostics.createGeminiDiagnostics(id, {now:() => c.now, sink})};
  const provider = load('../lib/gemini-provider.server.ts', {'./gemini-analysis':contract, './gemini-diagnostics.server':diag}, c);
  const company = {id:'qa-company',name:privateData,website:'https://qa.invalid',sector:'Software',geography:'Indonesia'};
  const investmentCase = {id:'qa-case',companyId:company.id,name:privateData,stage:'Sourced',investmentStage:'Seed',owner:'QA',thesis:'Fictional',strategy:'',roundSize:'',checkSize:'',valuation:'',source:'',lead:'',notes:'',createdAt:'2026-10-26',docs:[],evidence:[],runs:[],questions:[],reviews:[],recommendations:[],decisions:[],activity:[]};
  investmentCase.runs.push(model.analyze(investmentCase, 'Historical rules-v1'));
  investmentCase.reviews.push({id:'old-review',runId:investmentCase.runs[0].id,outcome:'Agree',rationale:'Fictional historical review.',author:'QA',createdAt:'2026-10-26'});
  let state = {revision:0,role:'Analyst',companies:[company],cases:[investmentCase]};
  const initial = structuredClone(state), journals = new Map(), signals = [], counts = {metadata:0,generation:0};
  const gate = deferred(), saveGate = deferred(), prepGate = deferred();
  const pdfs = {version:'case-pdf-input-v1',caseId:'qa-case',workspaceRevision:0,totalBytes:4,documents:[{documentId:'qa-doc',originalFilename:'PRIVATE_PDF_NAME.pdf',mimeType:'application/pdf',sizeBytes:4,source:{description:privateData,documentType:'Pitch Deck',uploadedAt:'2026-10-26',uploadedBy:'QA'},storageEtag:'PRIVATE_ETAG',bytes:new Uint8Array([37,80,68,70])}]};
  const input = {pdfs,provenance:{workspaceRevision:0,company,caseContext:{name:privateData},documents:[],evidenceIds:[]},evidence:[]};
  async function transport(url, o) {
    assert.ok(String(url).startsWith('https://generativelanguage.googleapis.com/v1beta/models/'));
    assert.equal(o.redirect,'manual'); assert.equal(o.headers['x-goog-api-key'],fakeKey); signals.push(o.signal);
    if (o.method !== 'POST') {
      counts.metadata++;
      if (mode === 'metadata-wait') return waitAbort(o.signal);
      if (mode === 'slow-metadata') return gate.promise;
      if (mode !== 'metadata-body') return meta();
    } else {
      counts.generation++;
      if (mode === 'headers-wait') return waitAbort(o.signal);
      if (mode === 'noncooperative') return gate.promise;
      if (mode === 'external-abort') throw abortError();
      if (mode === 'http400' || mode === 'http503') return new Response(privateResponse,{status:mode==='http400'?400:503});
      if (mode === 'invalid-json') return new Response(privateResponse);
      if (mode === 'invalid-source') {const out=valid(); out.findings[0].documentIds=['not-supplied']; return envelope(out);}
      if (!['body-wait','abort-body','qa-body-wait','qa-error-stall'].includes(mode)) return envelope();
    }
    return new Response(new ReadableStream({start(controller) {
      controller.enqueue(new TextEncoder().encode('{'));
      o.signal.addEventListener('abort', () => controller.error(abortError()), {once:true});
      if (mode === 'abort-body') gate.promise.then(() => controller.error(abortError()));
    }}), {status:mode==='qa-error-stall'?400:200});
  }
  let observedProvider = provider;
  if (options.observer) observedProvider = load('./fixtures/gemini-provider.observer.ts.fixture', {'./gemini-provider.actual.server':provider,'./gemini-diagnostics.server':diag}, c);
  const storage = {identity:async()=>({userId:'fictional-owner',displayName:'QA'}),readState:async()=>structuredClone(state),saveState:async(_owner,s,revision)=>{
    assert.equal(revision,state.revision); if(options.deferSave) await saveGate.promise;
    s.revision=revision+1; state=structuredClone(s); return structuredClone(state);
  },bucket:()=>({get:async key=>journals.has(key)?{size:Buffer.byteLength(journals.get(key)),json:async()=>JSON.parse(journals.get(key))}:null,put:async(key,value,o)=>{
    if(o?.onlyIf?.get('If-None-Match')==='*'&&journals.has(key))return null;
    const j=JSON.parse(value); if(options.failFinalJournal&&j.status==='saved')throw Error(privateData);
    if(options.failFailureJournal&&j.status==='failed')throw Error(privateData);
    journals.set(key,String(value)); return {etag:'fictional'};
  }})};
  const service = load('../lib/gemini-run.server.ts', {'cloudflare:workers':{env:{GEMINI_API_KEY:fakeKey}},'./storage':storage,'./document-input.server':{prepareCasePdfInput:async()=>{if(options.deferPrep) await prepGate.promise;return {...pdfs,workspaceRevision:state.revision};}},'./gemini-provider.server':{readGeminiConfig:provider.readGeminiConfig,callGemini:(i,cfg,_transport,trace)=>observedProvider.callGemini(i,cfg,transport,trace)},'./gemini-analysis':contract,'./model':model,'./gemini-diagnostics.server':diag}, c);
  return {c,logs,provider,service,input,transport,signals,counts,journals,initial,gate,saveGate,prepGate,get state(){return state;},request:()=>({caseId:'qa-case',name:'Fictional analysis',documentIds:['qa-doc'],requestId:crypto.randomUUID(),revision:state.revision})};
}
const has = (h,phase,event) => h.logs.find(e=>e.phase===phase&&e.event===event);
const failure = (out,code,status) => {assert.equal(out.error?.code,code);assert.equal(out.error?.status,status);};
const pass = name => {reports.push(name);};

// Shared production deadline, slow metadata, delayed headers, timeout before headers.
for (const mode of ['slow-metadata','metadata-wait','headers-wait','metadata-body','body-wait','qa-body-wait']) {
  const h=harness(mode,{observer:mode==='qa-body-wait'}),req=h.request(),pending=settled(h.service.runGeminiAnalysis(req));
  if(mode==='slow-metadata') {await until(()=>has(h,'metadata_headers','start')); h.c.advance(89000); h.gate.resolve(meta());}
  const phase = mode==='metadata-wait'?'metadata_headers':mode==='metadata-body'?'metadata_body':mode==='headers-wait'||mode==='slow-metadata'?'generation_headers':'generation_body';
  if(mode==='slow-metadata') {
    // Let the successful fixture complete; its elapsed metadata span must retain 89s.
    assert.ok((await pending).value); assert.equal(has(h,'metadata_headers','completed').phaseMs,89000);
    assert.deepEqual(h.c.delays,[90000]); assert.equal(h.signals[0],h.signals[1]); pass('slow metadata uses original shared budget'); continue;
  }
  await until(()=>has(h,phase,'start')); h.c.advance(90000);
  failure(await pending,'TIMEOUT',504); assert.ok(has(h,phase,'timeout')); assert.equal(has(h,'provider_deadline','timeout').elapsedMs,90000);
  const result=has(h,'provider_result','timeout'); assert.equal(result.applicationHttpStatus,504);
  if(phase.endsWith('_body')) {assert.equal(result.providerHttpStatus,200);assert.equal(result.headersReceived,true);assert.equal(result.bodyComplete,false);} else {assert.equal(result.headersReceived,false);assert.equal(result.providerHttpStatus,undefined);}
  assert.ok(h.signals.every(s=>s.aborted)); assert.deepEqual(h.c.delays,[90000]);assert.equal(h.c.timers.size,0);
  assert.deepEqual(h.state,h.initial); const counts={...h.counts};failure(await settled(h.service.runGeminiAnalysis(req)),'TIMEOUT',504);assert.deepEqual(h.counts,counts);
  assert.equal([...h.journals.values()].map(JSON.parse)[0].status,'failed');
  if(mode==='qa-body-wait') {const header=has(h,'qa_generation_headers','completed');assert.equal(header.providerHttpStatus,200);assert.ok(header.sequence<has(h,'generation_body','timeout').sequence);assert.equal(header.bodyComplete,false);}
  pass(mode+' / timeout replay');
}
// Explicitly prove the remaining 1s budget is not reset after metadata.
{
  const h=harness('slow-metadata');
  const p=settled(h.provider.callGemini(h.input,h.provider.readGeminiConfig({GEMINI_API_KEY:fakeKey}),async(u,o)=>o.method==='POST'?waitAbort(o.signal):h.transport(u,o)));
  await until(()=>has(h,'metadata_headers','start'));h.c.advance(89000);h.gate.resolve(meta());await until(()=>has(h,'generation_headers','start'));h.c.advance(1000);
  failure(await p,'TIMEOUT',504);assert.equal(has(h,'generation_headers','timeout').phaseMs,1000);assert.deepEqual(h.c.delays,[90000]);pass('89s metadata leaves 1s generation');
}
for (const [mode,code,status] of [['abort-body','PROVIDER_UNAVAILABLE',502],['external-abort','PROVIDER_UNAVAILABLE',502],['http400','PROVIDER_ERROR',502],['http503','PROVIDER_ERROR',502],['invalid-json','INVALID_RESPONSE',502],['invalid-source','INVALID_SOURCES',502]]) {
  const h=harness(mode),p=settled(h.service.runGeminiAnalysis(h.request()));
  if(mode==='abort-body'){await until(()=>has(h,'generation_body','start'));h.gate.resolve();}
  failure(await p,code,status);const result=has(h,'provider_result',['abort-body','external-abort'].includes(mode)?'aborted':'failed');assert.equal(result.errorCode,code);assert.equal(result.applicationHttpStatus,status);assert.equal(h.c.timers.size,0);
  assert.deepEqual(h.state,h.initial);
  if(mode.startsWith('http')) {assert.equal(result.providerHttpStatus,Number(mode.slice(4)));assert.equal(result.bodyComplete,true);assert.ok(has(h,'provider_error_body','completed'));assert.equal(has(h,'provider_error_diagnostic','failed').errorBodyOutcome,'invalid_json');}
  if(mode==='abort-body') {assert.ok(has(h,'generation_body','aborted'));assert.equal(result.providerHttpStatus,200);assert.equal(result.bodyComplete,false);assert.equal(result.signalAborted,false);}
  if(mode==='invalid-source') {assert.ok(has(h,'structured_validate','failed'));assert.equal(result.bodyComplete,true);}
  pass(mode);
}
// Adapter error parsing shares the deadline; QA headers remain independent and
// the already-known HTTP400 mapping survives a diagnostic read timeout.
{
  const h=harness('qa-error-stall',{observer:true}),req=h.request(),pending=settled(h.service.runGeminiAnalysis(req));
  await until(()=>has(h,'provider_error_body','start'));assert.equal(has(h,'qa_generation_headers','completed').providerHttpStatus,400);
  h.c.advance(90000);failure(await pending,'PROVIDER_ERROR',502);
  assert.ok(has(h,'qa_response_processing','completed'));assert.equal(has(h,'provider_deadline','timeout').applicationHttpStatus,502);assert.ok(has(h,'provider_error_body','timeout'));assert.equal(has(h,'generation_body','start'),undefined);
  failure(await settled(h.service.runGeminiAnalysis(req)),'PROVIDER_ERROR',502);assert.equal(h.counts.generation,1);pass('QA headers / diagnostic timeout / original HTTP400 mapping / replay');
}
// A transport ignoring abort still leaves a terminal timeout phase even while pending.
{
  const h=harness('noncooperative'),p=settled(h.service.runGeminiAnalysis(h.request()));await until(()=>has(h,'generation_headers','start'));h.c.advance(90000);
  assert.ok(has(h,'generation_headers','timeout'));assert.equal(has(h,'analysis_result','failed'),undefined);
  h.gate.resolve(Promise.reject(abortError()));failure(await p,'TIMEOUT',504);pass('noncooperative transport leaves interrupted phase');
}
for (const options of [{},{observer:true},{deferPrep:true},{deferSave:true},{failFinalJournal:true}]) {
  const h=harness('ok',options),req=h.request(),p=settled(h.service.runGeminiAnalysis(req));
  if(options.deferPrep||options.deferSave) {
    await until(()=>has(h,options.deferPrep?'pdf_prepare':'workspace_save','start'));assert.equal(h.c.timers.size,0);h.c.advance(90001);(options.deferPrep?h.prepGate:h.saveGate).resolve();
  }
  assert.ok((await p).value);for(const phase of ['structured_parse','structured_validate','service_validate','journal_ready','workspace_save'])assert.ok(has(h,phase,'completed'));
  assert.ok(has(h,'journal_saved',options.failFinalJournal?'failed':'completed'));assert.equal(has(h,'analysis_result','completed').applicationHttpStatus,200);
  assert.equal(h.state.cases[0].runs.length,2);assert.deepEqual(h.state.cases[0].runs[1],h.initial.cases[0].runs[0]);assert.deepEqual(h.state.cases[0].reviews,h.initial.cases[0].reviews);
  const saved=structuredClone(h.state);await h.service.runGeminiAnalysis(req);assert.equal(h.counts.generation,1);assert.deepEqual(h.state,saved);assert.equal(h.c.timers.size,0);pass('saved Run / replay / '+JSON.stringify(options));
}
{
  const h=harness('headers-wait',{failFailureJournal:true}),req=h.request(),p=settled(h.service.runGeminiAnalysis(req));await until(()=>has(h,'generation_headers','start'));h.c.advance(90000);failure(await p,'TIMEOUT',504);
  assert.ok(has(h,'journal_failed','failed'));failure(await settled(h.service.runGeminiAnalysis(req)),'REQUEST_IN_PROGRESS',409);assert.equal(h.counts.generation,1);pass('failed journal write preserves started claim');
}
// Observer returns the exact response/error and refuses a second generation.
{
  const c=clock(),logs=[],trace=diagnostics.createGeminiDiagnostics(undefined,{sink:e=>logs.push(e)}),url='https://generativelanguage.googleapis.com/v1beta/models/gemini-qa:generateContent';
  const response=new Response(new ReadableStream()),error=new Error(privateResponse);
  const observer=load('./fixtures/gemini-provider.observer.ts.fixture',{'./gemini-provider.actual.server':{callGemini:(_i,_c,transport)=>transport(url,{method:'POST'}),readGeminiConfig:()=>({})},'./gemini-diagnostics.server':diagnostics},c);
  assert.equal(await observer.callGemini({}, {}, async()=>response,trace),response);assert.equal(response.bodyUsed,false);
  await assert.rejects(()=>observer.callGemini({}, {},async()=>{assert.fail('Second dispatch');},trace));
  const errorObserver=load('./fixtures/gemini-provider.observer.ts.fixture',{'./gemini-provider.actual.server':{callGemini:(_i,_c,transport)=>transport(url,{}),readGeminiConfig:()=>({})},'./gemini-diagnostics.server':diagnostics},c);
  await assert.rejects(()=>errorObserver.callGemini({}, {}, async()=>{throw error;},trace),e=>e===error);pass('QA response/error identity and one-generation guard');
}
// Fixed-field serialization, safe IDs, monotonic clamping, throwing sinks.
{
  const logs=[];let time=10;const trace=diagnostics.createGeminiDiagnostics(privateData,{now:()=>time,sink:e=>logs.push(e)});
  const span=trace.begin('generation_headers',{headersReceived:false,apiKey:fakeKey});time=5;span.end('failed',{errorCode:privateResponse,providerHttpStatus:999,body:privateData});
  trace.record(privateData,privateResponse,{...diagnostics.diagnosticFailure({code:privateData,message:privateData,status:999}),headers:fakeKey});
  assert.ok(logs.every(e=>e.elapsedMs===0&&e.correlationId!==privateData&&e.attemptId!==privateData));assert.equal(logs[1].errorCode,undefined);assert.equal(logs[1].providerHttpStatus,undefined);assert.equal(logs[2].phase,'unknown');
  const h=harness();const broken=diagnostics.createGeminiDiagnostics(undefined,{now:()=>{throw Error(privateData);},sink:()=>{throw Error(fakeKey);}});
  assert.ok(await h.provider.callGemini(h.input,h.provider.readGeminiConfig({GEMINI_API_KEY:fakeKey}),h.transport,broken));pass('sanitization / monotonic clock / throwing sink');
}
const allowed=new Set(['kind','correlationId','attemptId','sequence','phase','event','elapsedMs','phaseMs','clock','providerHttpStatus','applicationHttpStatus','headersReceived','bodyComplete','signalAborted','errorCode','errorBodyOutcome','providerError']);
for(const event of allLogs)for(const key of Object.keys(event))assert.ok(allowed.has(key),key);
const serialized=JSON.stringify(allLogs);
for(const secret of [fakeKey,privateData,privateResponse,'PRIVATE_PDF_NAME','PRIVATE_ETAG','PRIVATE_ABORT_DETAIL','JVBERg==','x-goog-api-key','systemInstruction'])assert.ok(!serialized.includes(secret),secret);
assert.ok(allLogs.every(e=>Number.isFinite(e.elapsedMs)&&e.elapsedMs>=0));
console.log(JSON.stringify({passed:reports.length,scenarios:reports,realGenerationRequests:0,realMetadataRequests:0,security:'fixed fields; no credentials, document content, company data, prompts or outputs'},null,2));
