// Offline only: fictional error bodies, fake shared deadline, no real network.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {getEventListeners} from 'node:events';
const require=createRequire(import.meta.url),ts=require('typescript');
const blockedFetch=()=>{throw Error('Offline transport required');};
function clock(){let time=0,id=0;const timers=new Map(),delays=[];return{timers,delays,get now(){return time;},setTimeout(fn,ms){delays.push(ms);timers.set(++id,{fn,at:time+ms});return id;},clearTimeout(id){timers.delete(id);},advance(ms){time+=ms;for(const [id,t]of[...timers])if(t.at<=time){timers.delete(id);t.fn();}}};}
function load(path,deps={},c=clock()){
 const loaded={exports:{}},code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','exports','module','setTimeout','clearTimeout','fetch',code)(n=>deps[n]??require(n),loaded.exports,loaded,c.setTimeout.bind(c),c.clearTimeout.bind(c),blockedFetch);return loaded.exports;
}
const diagnostics=load('../lib/gemini-diagnostics.server.ts'),analysis=load('../lib/gemini-analysis.ts');
const fakeKey='AIza_PRIVATE_OFFLINE_KEY',privateData='PRIVATE_COMPANY_PROMPT_AND_GENERATED_TEXT',pdfText='%PDF-PRIVATE_BYTES',base64='JVBERi1QUklWQVRFX0JZVEVT';
const valid=()=>({executiveSummary:'Fictional only',businessOverview:'Fictional',findings:[{observation:'Fictional',interpretation:'Fictional',uncertainty:'Unknown',counterargument:'Unknown',documentIds:['qa-doc'],evidenceIds:[]}],risks:[],missingInformation:[],diligenceQuestions:[]});
const googleError=()=>({error:{code:400,status:'INVALID_ARGUMENT',message:`Invalid JSON payload received. Unknown name responseJsonSchema. ${fakeKey} ${privateData} ${pdfText} ${base64}\n\r\t\u001b[31m`,details:[
 {'@type':'type.googleapis.com/google.rpc.BadRequest',fieldViolations:[{field:'generation_config.response_json_schema',description:`Unknown name: ${fakeKey} ${privateData}`},{field:'contents[0].parts[1].inline_data.mime_type',description:'Invalid value.'},{field:'generationConfig.'+privateData,description:privateData}]},
 {'@type':'type.googleapis.com/google.rpc.DebugInfo',stackEntries:[privateData],detail:fakeKey},
 ]}});
const until=async fn=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setImmediate(r));}assert.fail('Expected offline phase not reached');};
const settled=p=>p.then(value=>({value}),error=>({error}));
const logs=[],scenarios=[];
function harness(status=400,mode='json',phase='generation'){
 const c=clock(),events=[],trace=diagnostics.createGeminiDiagnostics(undefined,{now:()=>c.now,sink:e=>{events.push(e);logs.push(e);}});
 const provider=load('../lib/gemini-provider.server.ts',{'./gemini-analysis':analysis,'./gemini-diagnostics.server':diagnostics},c);
 const input={pdfs:{documents:[{documentId:'qa-doc',originalFilename:'PRIVATE.pdf',bytes:new TextEncoder().encode(pdfText)}]},provenance:{company:{name:privateData},caseContext:{name:privateData},documents:[]},evidence:[]};
 const config=provider.readGeminiConfig({GEMINI_API_KEY:fakeKey});assert.equal(config.timeoutMs,90000);
 const counts={metadata:0,generation:0,pulls:0,cancels:0},signals=[];let streamController;
 const transport=async(_url,o)=>{
  assert.equal(o.redirect,'manual');signals.push(o.signal);
  if(o.method==='POST')counts.generation++;else counts.metadata++;
  if(o.method!=='POST'&&phase!=='metadata')return Response.json({supportedGenerationMethods:['generateContent']});
  if(mode==='success')return Response.json({modelVersion:'fictional-model',candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(valid())}]}}]});
  if(mode==='json')return Response.json(googleError(),{status});
  if(mode==='malformed')return new Response(privateData,{status});
  if(mode==='empty')return new Response(null,{status});
  if(mode==='exact') {const text=JSON.stringify(googleError());return new Response(text+' '.repeat(provider.GEMINI_ERROR_LIMIT-Buffer.byteLength(text)),{status});}
  if(mode==='read-failure')return new Response(new ReadableStream({start(c){c.error(Error(privateData));}}),{status});
  return new Response(new ReadableStream({start(c){streamController=c;},pull(c){
    counts.pulls++;
    if(mode==='oversized')c.enqueue(new Uint8Array(provider.GEMINI_ERROR_LIMIT+1));
    if(mode==='empty-chunks')c.enqueue(new Uint8Array());
  },cancel(){counts.cancels++;if(mode==='stall'||mode==='oversized'||mode==='empty-chunks')return new Promise(()=>{});}}),{status});
 };
 const run=()=>provider.callGemini(input,config,transport,trace);
 return{c,events,trace,provider,run,counts,signals,get controller(){return streamController;}};
}
const event=(h,phase)=>h.events.find(e=>e.phase===phase&&e.event!=='start');
function expectFailure(out,code,status){assert.equal(out.error?.code,code);assert.equal(out.error?.status,status);assert.ok(!Object.hasOwn(out.error,'providerError'));for(const secret of [fakeKey,privateData,pdfText,base64])assert.ok(!out.error.message.includes(secret));}

for(const phase of ['metadata','generation'])for(const [status,code,app]of [[400,'PROVIDER_ERROR',502],[401,'CREDENTIALS_REJECTED',503],[403,'CREDENTIALS_REJECTED',503],[429,'QUOTA_EXCEEDED',429],[503,'PROVIDER_ERROR',502]]){
 const h=harness(status,'json',phase),out=await settled(h.run());expectFailure(out,code,app);
 const diagnostic=event(h,'provider_error_diagnostic');assert.equal(diagnostic.errorBodyOutcome,'parsed');assert.equal(diagnostic.providerHttpStatus,status);assert.equal(diagnostic.applicationHttpStatus,app);assert.equal(diagnostic.bodyComplete,true);
 assert.equal(diagnostic.providerError.status,'INVALID_ARGUMENT');assert.equal(diagnostic.providerError.message,'Unknown request field.');assert.equal(diagnostic.providerError.fieldViolations[0].field,'generation_config.response_json_schema');assert.equal(diagnostic.providerError.fieldViolations[0].description,'Unknown request field.');assert.equal(diagnostic.providerError.fieldViolations[2].field,'[redacted]');
 assert.equal(h.counts.generation,phase==='metadata'?0:1);assert.deepEqual(h.c.delays,[90000]);assert.equal(h.c.timers.size,0);assert.ok(h.signals.every(s=>s===h.signals[0]));assert.equal(getEventListeners(h.signals.at(-1),'abort').length,0);
 scenarios.push(phase+' HTTP'+status+' mapping / safe fields');
}
// Recognized Google status/message variants; only canonical text survives.
for(const [status,message,expected]of [['UNAUTHENTICATED','API key not valid: '+fakeKey,'Authentication or permission rejected.'],['PERMISSION_DENIED','Permission denied for '+privateData,'Authentication or permission rejected.'],['RESOURCE_EXHAUSTED','Quota exceeded for '+privateData,'Quota or rate limit exceeded.'],['UNAVAILABLE','Service unavailable: '+privateData,'Provider unavailable.']]){
 const safe=diagnostics.googleErrorDiagnostic({error:{status,message}});assert.equal(safe.status,status);assert.equal(safe.message,expected);
}
for(const [mode,outcome,bodyComplete]of [['malformed','invalid_json',true],['oversized','limit_exceeded',false],['empty-chunks','limit_exceeded',false],['empty','empty',false],['read-failure','read_failed',false],['exact','parsed',true]]){
 const h=harness(400,mode);expectFailure(await settled(h.run()),'PROVIDER_ERROR',502);const diagnostic=event(h,'provider_error_diagnostic');assert.equal(diagnostic.errorBodyOutcome,outcome);assert.equal(diagnostic.bodyComplete,bodyComplete);assert.equal(h.c.timers.size,0);assert.ok(h.counts.pulls<=129);assert.ok(h.counts.cancels<=1);scenarios.push(mode+' bounded fallback');
}
// Noncooperative read/cancel cannot overrun the existing provider deadline. No
// new timer is created, and the known HTTP status wins over diagnostic timeout.
for(const [status,code,app]of [[400,'PROVIDER_ERROR',502],[401,'CREDENTIALS_REJECTED',503],[403,'CREDENTIALS_REJECTED',503],[429,'QUOTA_EXCEEDED',429],[503,'PROVIDER_ERROR',502]]){
 const h=harness(status,'stall'),pending=settled(h.run());await until(()=>h.events.some(e=>e.phase==='provider_error_body'));h.c.advance(90000);expectFailure(await pending,code,app);
 assert.equal(event(h,'provider_error_body').event,'timeout');assert.equal(event(h,'provider_error_diagnostic').errorBodyOutcome,'aborted');assert.equal(event(h,'provider_result').event,'failed');assert.equal(event(h,'provider_result').signalAborted,true);assert.equal(event(h,'provider_deadline').applicationHttpStatus,app);assert.deepEqual(h.c.delays,[90000]);assert.equal(h.c.timers.size,0);assert.equal(h.counts.cancels,1);assert.equal(getEventListeners(h.signals.at(-1),'abort').length,0);scenarios.push('stalled HTTP'+status+' / shared abort / original classification');
}
{
 const h=harness(400,'external-abort'),pending=settled(h.run());await until(()=>h.controller);h.controller.error(new DOMException(privateData,'AbortError'));expectFailure(await pending,'PROVIDER_ERROR',502);assert.equal(event(h,'provider_error_body').event,'aborted');assert.equal(event(h,'provider_result').signalAborted,false);scenarios.push('external body abort preserves HTTP400');
}
// Sanitizer enforces limits again at the sink, even if a caller bypasses the
// Google-envelope parser. Arbitrary strings and dynamic map keys never pass.
{
 const events=[],trace=diagnostics.createGeminiDiagnostics(undefined,{sink:e=>events.push(e)});
 trace.record('provider_error_diagnostic','completed',{providerError:{status:fakeKey,message:privateData,fieldViolations:Array.from({length:100},()=>({field:'generation_config.'+fakeKey,description:fakeKey}))},errorBodyOutcome:privateData});
 assert.equal(events[0].providerError.status,undefined);assert.equal(events[0].providerError.message,'Provider message redacted.');assert.equal(events[0].providerError.fieldViolations.length,8);assert.ok(events[0].providerError.fieldViolations.every(v=>v.field==='[redacted]'&&v.description==='Provider message redacted.'));assert.equal(events[0].errorBodyOutcome,undefined);
 const raw=googleError();raw.error.details=Array.from({length:100},()=>raw.error.details[0]);const safe=diagnostics.googleErrorDiagnostic(raw);assert.equal(safe.fieldViolations.length,8);
 assert.equal(diagnostics.googleErrorDiagnostic({error:{message:'x'.repeat(100000)+' '+fakeKey}}).message,'Provider message redacted.');scenarios.push('double projection / truncation / 8 details and violations');
}
{
 const h=harness(200,'success');const result=await h.run();assert.deepEqual(result.result,valid());assert.equal(event(h,'provider_error_body'),undefined);assert.equal(event(h,'provider_result').event,'completed');assert.equal(h.c.timers.size,0);scenarios.push('HTTP200 output unchanged');
}
// Public API still returns only the original static application error fields.
{
 const h=harness(),route=load('../app/api/analysis/gemini/route.ts',{'@/lib/gemini-run.server':{runGeminiAnalysis:h.run},'@/lib/gemini-analysis':analysis,'@/lib/document-input.server':{PdfInputError:class extends Error{}}});
 const response=await route.POST(new Request('http://qa.invalid/api/analysis/gemini',{method:'POST',body:'{}'})),body=await response.json();assert.equal(response.status,502);assert.deepEqual(Object.keys(body).sort(),['code','error']);assert.equal(body.code,'PROVIDER_ERROR');assert.ok(!JSON.stringify(body).includes('INVALID_ARGUMENT'));scenarios.push('no provider diagnostic in browser response');
}
for(const secret of [fakeKey,privateData,pdfText,base64,'PRIVATE.pdf','stackEntries','systemInstruction','x-goog-api-key','\u001b'])assert.ok(!JSON.stringify(logs).includes(secret),secret);
console.log(JSON.stringify({passed:scenarios.length,scenarios,realGenerationRequests:0,realMetadataRequests:0,errorBodyLimitBytes:16384,maxReadCalls:128,maxFieldViolations:8,noSensitiveLogFields:true},null,2));
