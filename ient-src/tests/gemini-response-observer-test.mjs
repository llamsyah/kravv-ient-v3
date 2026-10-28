// Offline QA-client observer tests; no send callback makes a network request.
import assert from 'node:assert/strict';
import {observeGeminiResponse,createGeminiDiagnostics} from './gemini-response-observer.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((ok,fail)=>{resolve=ok;reject=fail;});return{promise,resolve,reject};};
const logs=[],trace=()=>createGeminiDiagnostics(crypto.randomUUID(),{sink:e=>logs.push(e)});
const tick=()=>new Promise(r=>setImmediate(r));
for(const status of [200,400,503]) {
  let stream,reads=0;
  const response=new Response(new ReadableStream({start(c){stream=c;}}),{status});
  const controller=new AbortController(),error=new DOMException('PRIVATE_OBSERVER_ABORT','AbortError');
  controller.signal.addEventListener('abort',()=>stream.error(error),{once:true});
  const t=trace(),pending=observeGeminiResponse(()=>{reads++;return response;},undefined,t).catch(e=>e);
  await tick();const header=logs.find(e=>e.attemptId===t.attemptId&&e.phase==='qa_application_headers'&&e.event==='completed');
  assert.equal(header.applicationHttpStatus,status);assert.equal(header.providerHttpStatus,undefined);assert.equal(header.headersReceived,true);assert.equal(header.bodyComplete,false);
  assert.ok(logs.some(e=>e.attemptId===t.attemptId&&e.phase==='qa_application_body'&&e.event==='start'));
  controller.abort();assert.equal(await pending,error);assert.equal(reads,1);
  const end=logs.find(e=>e.attemptId===t.attemptId&&e.phase==='qa_application_body'&&e.event==='aborted');assert.equal(end.applicationHttpStatus,status);assert.equal(end.bodyComplete,false);assert.ok(end.sequence>header.sequence);
}
// Header wait abort/timeout is separate from an already-received response body.
for(const name of ['AbortError','TimeoutError']) {
  const gate=deferred(),error=new DOMException('PRIVATE_HEADER_DETAIL',name),t=trace();
  const pending=observeGeminiResponse(()=>gate.promise,undefined,t).catch(e=>e);gate.reject(error);assert.equal(await pending,error);
  assert.ok(logs.some(e=>e.attemptId===t.attemptId&&e.phase==='qa_application_headers'&&e.event===(name==='AbortError'?'aborted':'timeout')&&e.applicationHttpStatus===undefined));
  assert.ok(!logs.some(e=>e.attemptId===t.attemptId&&e.phase==='qa_application_body'));
}
for(const [status,body] of [[200,{privateOutput:'PRIVATE_RESPONSE_DATA'}],[503,{code:'PROVIDER_ERROR',error:'PRIVATE_ERROR_DATA'}]]) {
  const response=Response.json(body,{status}),t=trace(),result=await observeGeminiResponse(()=>response,undefined,t);
  assert.equal(result.response,response);assert.deepEqual(result.body,body);
  const completed=logs.find(e=>e.attemptId===t.attemptId&&e.phase==='qa_application_body'&&e.event==='completed');assert.equal(completed.bodyComplete,true);assert.equal(completed.applicationHttpStatus,status);
}
const serialized=JSON.stringify(logs);for(const secret of ['PRIVATE_OBSERVER_ABORT','PRIVATE_HEADER_DETAIL','PRIVATE_RESPONSE_DATA','PRIVATE_ERROR_DATA'])assert.ok(!serialized.includes(secret));
console.log('Passed 7 OFFLINE QA-client scenarios: HTTP200/400/503 stalled body retains headers, header abort/timeout, successful JSON and sanitized error JSON; same response/error, one read, no new timers or requests.');
