// Only run against a separate source copy containing the explicit QA-only provider fixture.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {initialize,AccessClient} from './access-client.mjs';
import {fictionalPdf} from './fictional-pdf.mjs';
const base=process.env.TEST_BASE_URL;
assert.ok(base&&['localhost','127.0.0.1'].includes(new URL(base).hostname));
const origin=JSON.parse(await readFile('../qa-origin.json','utf8'));
assert.equal(resolve(origin.qa),resolve('..'));assert.notEqual(resolve(origin.source),resolve('..'));assert.equal(new URL(base).port,String(origin.port));
assert.ok((await readFile('lib/gemini-provider.server.ts','utf8')).includes('QA_ONLY_MOCK_PROVIDER'),'Refusing to run multi-request tests against a real provider.');
assert.equal(process.env.GEMINI_QA_MOCK,'1','Explicit QA mock opt-in required.');
const {client}=await initialize(base,'M3 Gemini QA (fictional)');
let state=(await client.state()).state;const original=structuredClone(state);
let caseId;
async function action(action,payload){const response=await client.request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload,caseId,revision:state.revision})});const body=await response.json();assert.equal(response.status,200,JSON.stringify(body));state=body.state;return body;}
caseId=(await action('create',{companyName:'M3 mocked Gemini QA (fictional)',website:'https://m3-qa.example',sector:'Software',geography:'Indonesia',investmentStage:'Seed',owner:'M3 QA',thesis:'Fictional thesis'})).createdId;
const bytes=fictionalPdf();const form=new FormData();form.set('caseId',caseId);form.set('revision',String(state.revision));form.set('source','Fictional startup QA fixture');form.set('type','Pitch Deck');form.set('file',new File([bytes],'fictional-m3.pdf',{type:'application/pdf'}));
let response=await client.request('/api/documents',{method:'POST',body:form});assert.equal(response.status,200);state=(await response.json()).state;
const docId=state.cases.find(c=>c.id===caseId).docs[0].id;
await action('analysis',{name:'Historical rules-v1 before Gemini'});
const legacy=structuredClone(state.cases.find(c=>c.id===caseId).runs[0]);
const request=()=>({caseId,name:'Due Diligence',documentIds:[docId],requestId:crypto.randomUUID(),revision:state.revision});
async function generate(input,expected=200,actor=client){const r=await actor.request('/api/analysis/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));if(d.state)state=d.state;return d;}
const first=request();const success=await generate(first);const current=()=>state.cases.find(c=>c.id===caseId);
assert.equal(current().runs[0].simulated,false);assert.ok(current().runs[0].gemini.modelVersion.startsWith('qa-mock'));
assert.equal(current().runs[0].evidence.length,0);assert.equal(current().runs[0].gemini.input.documents[0].documentId,docId);
assert.equal(current().runs[0].findings[0].documentIds[0],docId);assert.equal(current().runs[0].gemini.input.caseContext.thesis,'Fictional thesis');
assert.ok(!JSON.stringify(current().runs[0]).includes('"bytes":'));assert.ok(!JSON.stringify(current().runs[0]).includes('qa-mock-secret'));
const saved=structuredClone(current().runs[0]),revision=state.revision;
await generate(first);assert.equal(state.revision,revision);assert.equal(current().runs.filter(r=>r.id===success.runId).length,1);
await action('review',{runId:saved.id,outcome:'Disagree',rationale:'Fictional QA reviewer requests independent customer evidence.'});
assert.equal(current().reviews[0].runId,saved.id);assert.deepEqual(current().runs[0],saved);
for(const [mode,code,status] of [['bad-json','INVALID_RESPONSE',502],['bad-reference','INVALID_SOURCES',502],['quota','QUOTA_EXCEEDED',429],['timeout','TIMEOUT',504]]){
  await action('edit',{...current(),notes:`QA_MODE=${mode}`});const before=structuredClone(state),input=request();
  const failed=await generate(input,status);assert.equal(failed.code,code);assert.deepEqual((await client.state()).state,before,'Failure must not persist a partial run');
  await generate(input,status);assert.deepEqual((await client.state()).state,before);
}
await action('edit',{...current(),notes:'QA_MODE=slow'});
const parallel=request();
const outcomes=await Promise.all([client.request('/api/analysis/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parallel)}),client.request('/api/analysis/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parallel)})]);
assert.ok(outcomes.some(r=>r.status===200));assert.ok(outcomes.every(r=>[200,409].includes(r.status)));
state=(await client.state()).state;assert.equal(current().runs.filter(r=>r.id===`GEMINI-${parallel.requestId}`).length,1);
const stale=request();await action('edit',{...current(),notes:'Concurrent context'});const staleResult=await generate(stale,409);assert.equal(staleResult.code,'REVISION_CONFLICT');
await generate(request(),401,new AccessClient(base));
const other=await initialize(base,'M3 isolated owner QA');await generate(request(),404,other.client);
state=(await client.state()).state;
assert.deepEqual(current().runs.find(r=>r.id===legacy.id),legacy);assert.deepEqual(current().runs.find(r=>r.id===saved.id),saved);
for(const c of original.cases)assert.deepEqual(state.cases.find(x=>x.id===c.id),c);
response=await client.request('/api/documents?id='+docId);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
const report={passed:true,provider:'QA MOCK ONLY',caseId,checks:['real HTTP/D1/R2 pipeline with mock provider','PDF analysis without manual evidence','source and input provenance','saved result and human review','failed/duplicate requests without partial runs','atomic R2 claim under concurrent HTTP requests','stale revision rejection','historical rules-v1 compatibility','unchanged original PDF bytes','separate owners']};
await mkdir('outputs',{recursive:true});await writeFile('outputs/gemini-mock-workflow.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
