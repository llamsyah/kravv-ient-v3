// One opt-in live generation request, only against an explicitly separate QA source copy.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {initialize} from './access-client.mjs';
import {fictionalPdf} from './fictional-pdf.mjs';
import {observeGeminiResponse} from './gemini-response-observer.mjs';
assert.equal(process.env.GEMINI_LIVE_TEST,'1','Explicit live-test opt-in required.');
const origin=JSON.parse(await readFile('../qa-origin.json','utf8'));
assert.equal(resolve(origin.qa),resolve('..'));assert.notEqual(resolve(origin.source),resolve('..'));
assert.ok(!(await readFile('lib/gemini-provider.server.ts','utf8')).includes('QA_ONLY_MOCK_PROVIDER'),'Restore the real adapter first.');
const base=process.env.TEST_BASE_URL;assert.ok(base&&['127.0.0.1','localhost'].includes(new URL(base).hostname));assert.equal(new URL(base).port,String(origin.port));
const {client}=await initialize(base,'M3 live QA (fictional)');
let state=(await client.state()).state;
let response=await client.request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',revision:state.revision,payload:{companyName:'M3 live fictional industrial SaaS',website:'https://fictional-live.example',sector:'Industrial software',geography:'Indonesia',investmentStage:'Seed',owner:'Fictional QA',thesis:'Evaluate the documented pilot traction; all data is fictional.'}})});
assert.equal(response.status,200);const created=await response.json();state=created.state;const caseId=created.createdId;
const form=new FormData();form.set('caseId',caseId);form.set('revision',String(state.revision));form.set('source','Fictional startup QA document');form.set('type','Pitch Deck');form.set('file',new File([fictionalPdf()],'fictional-live.pdf',{type:'application/pdf'}));
response=await client.request('/api/documents',{method:'POST',body:form});assert.equal(response.status,200);state=(await response.json()).state;
const current=state.cases.find(c=>c.id===caseId),requestId=crypto.randomUUID();assert.equal(current.evidence.length,0);
// Exactly one analysis POST. The adapter performs a model metadata GET, then at most one generateContent POST.
const observed=await observeGeminiResponse(()=>client.request('/api/analysis/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId,name:'Controlled live PDF analysis',documentIds:[current.docs[0].id],requestId,revision:state.revision})}),requestId);
response=observed.response;
const body=observed.body;
let report;
if(response.ok){
 const run=body.state.cases.find(c=>c.id===caseId).runs.find(r=>r.id===body.runId);
 assert.equal(run.simulated,false);assert.equal(run.gemini.requestId,requestId);assert.ok(run.gemini.result.executiveSummary);
 assert.equal(run.gemini.input.documents[0].documentId,current.docs[0].id);
 const reloaded=(await client.state()).state.cases.find(c=>c.id===caseId).runs.find(r=>r.id===run.id);assert.deepEqual(reloaded,run);
 report={attempted:true,succeeded:true,caseId,runId:run.id,model:run.gemini.model,modelVersion:run.gemini.modelVersion,usage:run.gemini.usage,provider:'REAL GEMINI API',note:'One generation request succeeded. Exact project rate limits and billing tier are not inferred from this response.'};
}else{
 assert.equal((await client.state()).state.cases.find(c=>c.id===caseId).runs.length,0);
 report={attempted:true,succeeded:false,caseId,status:response.status,code:body.code,error:body.error,provider:'REAL GEMINI API ATTEMPT',note:'No automatic retry or fallback model call was performed.'};
}
await mkdir('outputs',{recursive:true});await writeFile('outputs/gemini-live-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(!report.succeeded)process.exitCode=1;
