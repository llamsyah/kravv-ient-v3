// Only an isolated QA copy with the explicit transport fixture may run this.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {initialize,AccessClient} from './access-client.mjs';
import {fictionalPdf} from './fictional-pdf.mjs';
const base=process.env.TEST_BASE_URL;assert.ok(base&&['127.0.0.1','localhost'].includes(new URL(base).hostname));assert.equal(process.env.MINIMUM_QA_TEST,'1');
const marker=JSON.parse(await readFile('../qa-origin.json','utf8'));assert.equal(resolve(marker.qa),resolve('..'));assert.notEqual(resolve(marker.source),resolve('..'));assert.equal(new URL(base).port,String(marker.port));
assert.ok((await readFile('app/api/analysis/minimum/route.ts','utf8')).includes('minimumQaTransport'),'Refusing to call an unmocked provider');
const capture=JSON.parse(await readFile(process.env.MINIMUM_QA_RESPONSE_FILE,'utf8')),text=capture.candidates[0].content.parts.filter(p=>!p.thought).map(p=>p.text||'').join(''),hash=t=>createHash('sha256').update(t).digest('hex');
const {client}=await initialize(base,'Promoted minimum flow — fictional QA');let state=(await client.state()).state;const initial=structuredClone(state);let caseId;
async function action(action,payload){const r=await client.request('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload,caseId,revision:state.revision})});const d=await r.json();assert.equal(r.status,200,d.error);state=d.state;return d;}
caseId=(await action('create',{companyName:'Minimum route offline QA',website:'https://fictional.example',sector:'Software',geography:'Indonesia',investmentStage:'Seed',owner:'QA',thesis:'Fictional PDF only'})).createdId;
const pdf=fictionalPdf(),form=new FormData();form.set('caseId',caseId);form.set('revision',String(state.revision));form.set('source','Fictional PDF');form.set('type','Pitch Deck');form.set('file',new File([pdf],'fictional.pdf',{type:'application/pdf'}));
let response=await client.request('/api/documents',{method:'POST',body:form});assert.equal(response.status,200);state=(await response.json()).state;const docId=state.cases.find(c=>c.id===caseId).docs[0].id;
const request=()=>({caseId,name:'Initial Screening',documentIds:[docId],requestId:crypto.randomUUID(),revision:state.revision});
async function generate(input,expected=200,actor=client,extraHeaders={}){const r=await actor.request('/api/analysis/minimum',{method:'POST',headers:{'Content-Type':'application/json',...extraHeaders},body:JSON.stringify(input)});const raw=await r.text();let d;try{d=JSON.parse(raw);}catch{d={error:r.statusText};}assert.equal(r.status,expected,d.error);if(d.state)state=d.state;return d;}
const first=request();await generate(first,401,new AccessClient(base));await generate(first,403,client,{Origin:'https://untrusted.invalid'});await generate({...first,documentIds:[]},400);await generate({...first,documentIds:[docId,docId]},400);
const other=await initialize(base,'Other minimum QA owner');await generate(first,404,other.client);
const success=await generate(first),current=()=>state.cases.find(c=>c.id===caseId),run=structuredClone(current().runs.find(r=>r.id===success.runId));
assert.equal(run.simulated,false);assert.equal(run.assessment,text);assert.deepEqual(run.findings,[]);assert.deepEqual(run.evidence,[]);assert.equal(run.gemini,undefined);assert.ok(run.version.startsWith('gemini-text:gemini-3.5-flash-lite:'));
const revision=state.revision;assert.equal((await generate(first)).reused,true);assert.equal(state.revision,revision);assert.equal(current().runs.filter(r=>r.id===run.id).length,1);
assert.equal((await generate({...first,name:'Different context'},409)).code,'REQUEST_REUSED');assert.equal((await generate({...first,documentIds:['foreign-doc']},409)).code,'REQUEST_REUSED');
await action('review',{runId:run.id,outcome:'Agree',rationale:'Human review of the same captured real Gemini response; all case data is fictional.'});
state=(await client.state()).state;assert.deepEqual(current().runs.find(r=>r.id===run.id),run);assert.ok(current().reviews.some(r=>r.runId===run.id));
const save=await generate({action:'save',caseId,requestId:first.requestId,revision:state.revision});assert.equal(save.reused,true);
await generate(request());assert.equal(current().runs.filter(r=>r.simulated===false).length,2);
const realRuns=structuredClone(current().runs);await action('analysis',{name:'Historical rules-v1 regression'});assert.equal(current().runs[0].version,'rules-v1');assert.equal(current().runs[0].simulated,true);for(const r of realRuns)assert.deepEqual(current().runs.find(x=>x.id===r.id),r);
for(const c of initial.cases)assert.deepEqual(state.cases.find(x=>x.id===c.id),c);
response=await client.request('/api/documents?id='+encodeURIComponent(docId));assert.equal(response.status,200);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),pdf);
const report={passed:true,transport:'recorded response fixture; no Google network',capturedResponseSha256:hash(text),checks:['authentication and origin','case/document ownership','exactly one PDF','real response saved with simulated:false','no fabricated structured fields','same-ID replay and mismatched intent','independent request IDs','reload and Human Review','rules-v1 and historical records','unchanged PDF download'],expectedInterceptedProviderCalls:2,realGenerationRequests:0,realMetadataRequests:0};await mkdir('outputs',{recursive:true});await writeFile('outputs/minimum-workflow.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
