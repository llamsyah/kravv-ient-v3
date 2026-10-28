// Offline workerd regression: all outbound requests terminate in a local test handler.
// No real credentials, Google requests, business storage, or dependency installation.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';

const result={executiveSummary:'Fictional QA.',businessOverview:'Fictional software.',findings:[{observation:'A fictional pilot is reported.',interpretation:'Early traction.',uncertainty:'Retention unknown.',counterargument:'Pilot may not renew.',documentIds:['qa-pdf'],evidenceIds:[]}],risks:[],missingInformation:['Retention.'],diligenceQuestions:[]};
const entry=`
import {callGemini} from './lib/gemini-provider.server';
import {createGeminiDiagnostics} from './lib/gemini-diagnostics.server';
export default {async fetch(){
 const diagnostics=[],trace=createGeminiDiagnostics(undefined,{sink:e=>diagnostics.push(e)});
 const pdfs={version:'case-pdf-input-v1',caseId:'qa-case',workspaceRevision:0,totalBytes:4,documents:[{documentId:'qa-pdf',originalFilename:'fictional.pdf',mimeType:'application/pdf',sizeBytes:4,source:{description:'QA',documentType:'Pitch Deck',uploadedAt:'2026-10-26',uploadedBy:'QA'},storageEtag:'qa-etag',bytes:new Uint8Array([37,80,68,70])}]};
 const provenance={workspaceRevision:0,company:{id:'qa-company',name:'Fictional QA',website:'https://qa.invalid',sector:'Software',geography:'Indonesia'},caseContext:{name:'Fictional'},documents:[],evidenceIds:[]};
 try {const generated=await callGemini({pdfs,provenance,evidence:[]},{apiKey:'workers-test-secret-not-real',model:'gemini-qa-test',timeoutMs:2000},undefined,trace);return Response.json({ok:true,modelVersion:generated.modelVersion,diagnostics})}
 catch(e){return Response.json({ok:false,code:e.code,message:e.message,diagnostics},{status:e.status||500})}
}};`;
const bundle=await build({stdin:{contents:entry,resolveDir:fileURLToPath(new URL('../',import.meta.url)),loader:'ts'},bundle:true,write:false,platform:'neutral',format:'esm',target:'es2022',external:['node:buffer']});
let phase='none',status=302,requests=[],destinationHits=0;
const worker=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],outboundService:async request=>{
 const url=new URL(request.url);
 if(url.hostname!=='generativelanguage.googleapis.com'){destinationHits++;return new Response('Redirect destination must never be reached',{status:403});}
 assert.equal(request.headers.get('x-goog-api-key'),'workers-test-secret-not-real');
 const method=request.method;requests.push(method);
 if(method==='POST'){
  const body=await request.json();
  for(const parameter of ['temperature','topP','topK','top_p','top_k']){
   assert.equal(Object.hasOwn(body.generationConfig,parameter),false,`Incompatible sampling parameter on Workers: ${parameter}`);
   assert.equal(Object.hasOwn(body,parameter),false,`Sampling parameter on request root: ${parameter}`);
  }
 }
 if((phase==='metadata'&&method==='GET')||(phase==='generation'&&method==='POST'))return new Response(status===304?null:'private-provider-body',{status,headers:{Location:'https://redirect-destination.invalid/never-follow'}});
 if(phase==='error-json'&&method==='POST')return Response.json({error:{status:status===400?'INVALID_ARGUMENT':status===401?'UNAUTHENTICATED':status===429?'RESOURCE_EXHAUSTED':status===503?'UNAVAILABLE':'PERMISSION_DENIED',message:'Unknown name: private-provider-body workers-test-secret-not-real',details:[{'@type':'type.googleapis.com/google.rpc.BadRequest',fieldViolations:[{field:'generation_config.response_json_schema',description:'Unknown field: private-provider-body workers-test-secret-not-real'}]}]}},{status});
 if(method==='GET')return Response.json({supportedGenerationMethods:['generateContent']});
 return Response.json({modelVersion:'offline-workers-fixture',candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result)}]}}]});
}});
try{
 for(const selectedPhase of ['metadata','generation'])for(const code of [300,301,302,303,304,305,306,307,308,399]){
  phase=selectedPhase;status=code;requests=[];
  const response=await worker.dispatchFetch('http://qa.invalid/check'),body=await response.json();
  assert.equal(response.status,502,JSON.stringify({selectedPhase,code,body}));
  assert.equal(body.code,'PROVIDER_REDIRECT');
  assert.ok(!body.message.includes('private-provider-body')&&!body.message.includes('workers-test-secret-not-real')&&!body.message.includes('redirect-destination.invalid'));
  assert.deepEqual(requests,phase==='metadata'?['GET']:['GET','POST']);
  assert.equal(destinationHits,0,'No request or credential may reach a redirect destination');
 }
 phase='error-json';
 for(const [code,applicationStatus,classification]of [[400,502,'PROVIDER_ERROR'],[401,503,'CREDENTIALS_REJECTED'],[403,503,'CREDENTIALS_REJECTED'],[429,429,'QUOTA_EXCEEDED'],[503,502,'PROVIDER_ERROR']]){
  status=code;requests=[];const response=await worker.dispatchFetch('http://qa.invalid/check'),body=await response.json();
  assert.equal(response.status,applicationStatus);assert.equal(body.code,classification);const detail=body.diagnostics.find(e=>e.phase==='provider_error_diagnostic');assert.equal(detail.errorBodyOutcome,'parsed');assert.equal(detail.providerHttpStatus,code);assert.equal(detail.providerError.message,'Unknown request field.');assert.equal(detail.providerError.fieldViolations[0].field,'generation_config.response_json_schema');
  for(const secret of ['workers-test-secret-not-real','private-provider-body'])assert.ok(!JSON.stringify(body).includes(secret));assert.deepEqual(requests,['GET','POST']);assert.equal(destinationHits,0);
 }
 phase='none';requests=[];
 const response=await worker.dispatchFetch('http://qa.invalid/check');
 assert.equal(response.status,200);assert.equal((await response.json()).modelVersion,'offline-workers-fixture');
 assert.deepEqual(requests,['GET','POST']);assert.equal(destinationHits,0);
 console.log('Passed OFFLINE WORKERD: 20 redirects rejected, 5 bounded/sanitized non-2xx JSON errors preserve mappings, and valid HTTP200 fixture; incompatible sampling parameters absent, no credential forwarding. Zero Google network requests.');
}finally{await worker.dispose();}
