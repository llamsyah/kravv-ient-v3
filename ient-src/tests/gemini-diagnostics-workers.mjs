// Native workerd + QA observer; every outbound request ends in a local fixture.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
const root=fileURLToPath(new URL('../',import.meta.url));
const entry=`
import {callGemini,readGeminiConfig} from 'qa-observer';
import {createGeminiDiagnostics} from './lib/gemini-diagnostics.server';
export default {async fetch(){
 const logs=[],trace=createGeminiDiagnostics(undefined,{sink:e=>logs.push(e)});
 const pdfs={version:'case-pdf-input-v1',caseId:'fictional',workspaceRevision:0,totalBytes:4,documents:[{documentId:'qa-doc',originalFilename:'fictional.pdf',mimeType:'application/pdf',sizeBytes:4,source:{description:'Fictional',documentType:'Pitch Deck',uploadedAt:'2026-10-26',uploadedBy:'QA'},storageEtag:'fake',bytes:new Uint8Array([37,80,68,70])}]};
 const input={pdfs,provenance:{workspaceRevision:0,company:{id:'fake',name:'Fictional',website:'https://qa.invalid',sector:'Software',geography:'Indonesia'},caseContext:{},documents:[],evidenceIds:[]},evidence:[]};
 const configured=readGeminiConfig({GEMINI_API_KEY:'fake-worker-key-not-real'});
 const signals=[];let abortEvents=0;
 try{await callGemini(input,{...configured,timeoutMs:1000},async(u,o)=>{signals.push(o.signal);o.signal.addEventListener('abort',()=>abortEvents++);return fetch(u,o)},trace);return Response.json({unexpectedSuccess:true})}
 catch(e){return Response.json({code:e.code,status:e.status,configuredMs:configured.timeoutMs,probeMs:1000,signalAborted:signals.every(s=>s.aborted),sameSignal:signals.every(s=>s===signals[0]),abortEvents,logs},{status:e.status||500})}
}};`;
const bundle=await build({stdin:{contents:entry,resolveDir:root,loader:'ts'},bundle:true,write:false,platform:'neutral',format:'esm',target:'es2022',external:['node:buffer'],plugins:[{name:'qa-fixture',setup(b){
  b.onResolve({filter:/^qa-observer$/},()=>({path:'observer',namespace:'qa'}));
  b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:readFileSync(new URL('./fixtures/gemini-provider.observer.ts.fixture',import.meta.url),'utf8'),loader:'ts',resolveDir:root+'/lib'}));
  b.onResolve({filter:/^\.\/gemini-provider\.actual\.server$/},()=>({path:root+'/lib/gemini-provider.server.ts'}));
}}]});
const results=[];
for(const phase of ['metadata','headers','body','error-body']) {
  let pending=[],streams=[],dispatches=[];
  const worker=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],outboundService:async request=>{
    assert.equal(new URL(request.url).hostname,'generativelanguage.googleapis.com');assert.equal(request.headers.get('x-goog-api-key'),'fake-worker-key-not-real');dispatches.push(request.method);
    if(request.method==='GET'&&phase!=='metadata')return Response.json({supportedGenerationMethods:['generateContent']});
    if(phase==='body'||phase==='error-body')return new Response(new ReadableStream({start(c){streams.push(c);c.enqueue(new TextEncoder().encode('{'))}}),{status:phase==='body'?200:400});
    return new Promise(resolve=>pending.push(resolve));
  }});
  let timer;
  try {
    const response=await Promise.race([worker.dispatchFetch('http://offline.invalid/probe'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Offline Workers probe watchdog')),5000);})]);
    const body=await response.json(),expectedStatus=phase==='error-body'?502:504;
    assert.equal(response.status,expectedStatus);assert.equal(body.code,phase==='error-body'?'PROVIDER_ERROR':'TIMEOUT');assert.equal(body.configuredMs,90000);assert.equal(body.probeMs,1000);assert.equal(body.sameSignal,true);assert.equal(body.signalAborted,true);
    assert.deepEqual(dispatches,phase==='metadata'?['GET']:['GET','POST']);
    const interrupted=phase==='metadata'?'metadata_headers':phase==='headers'?'generation_headers':'generation_body';
    if(phase!=='error-body')assert.ok(body.logs.some(e=>e.phase===interrupted&&e.event==='timeout'));
    else assert.ok(body.logs.some(e=>e.phase==='provider_error_body'&&e.event==='timeout'&&e.providerHttpStatus===400&&e.applicationHttpStatus===502));
    if(phase==='metadata'||phase==='headers')assert.ok(body.logs.some(e=>e.phase===(phase==='metadata'?'qa_metadata_headers':'qa_generation_headers')&&e.event==='timeout'&&e.headersReceived===false));
    if(phase==='body'||phase==='error-body') {
      const header=body.logs.find(e=>e.phase==='qa_generation_headers'&&e.event==='completed');
      assert.equal(header.providerHttpStatus,phase==='body'?200:400);assert.equal(header.headersReceived,true);assert.equal(header.bodyComplete,false);
      assert.ok(body.logs.some(e=>e.phase==='qa_response_processing'&&e.event==='completed'&&e.sequence>header.sequence));
      const final=body.logs.find(e=>e.phase==='provider_result');assert.equal(final.providerHttpStatus,header.providerHttpStatus);assert.equal(final.applicationHttpStatus,expectedStatus);assert.equal(final.bodyComplete,false);
    }
    assert.ok(body.logs.every(e=>e.clock==='monotonic'&&Number.isFinite(e.elapsedMs)));
    const serialized=JSON.stringify(body.logs);for(const value of ['fake-worker-key-not-real','fictional.pdf','systemInstruction','inlineData','JVBERg=='])assert.ok(!serialized.includes(value));
    results.push({phase,applicationHttpStatus:response.status,passed:true});
  } finally {
    clearTimeout(timer);for(const resolve of pending)resolve(new Response('Offline cleanup',{status:503}));pending=[];
    for(const c of streams)try{c.close();}catch{ /* Already canceled. */ } streams=[];
    await worker.dispose();
  }
}
console.log(JSON.stringify({nativeWorkers:results,realGenerationRequests:0,realMetadataRequests:0},null,2));
