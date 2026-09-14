// Local-only acceptance test. Creates one explicitly fictional case; existing cases are not edited.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://localhost:5173';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'This fixture-writing test requires a local server.');
const login=await fetch(base+'/local-login',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:base},body:new URLSearchParams({fullName:'Analysis Workflow Test',email:'analysis-workflow-test@example.invalid'})});
assert.equal(login.status,303);
const cookie=login.headers.getSetCookie().find(value=>value.startsWith('__kravv_local_identity=')).split(';')[0];
const headers={cookie,'Content-Type':'application/json'};
const get=()=>fetch(base+'/api/workspace',{headers:{cookie}}).then(r=>r.json());
let state=(await get()).state;
const before=structuredClone(state),originalRole=state.role;
let caseId;
async function action(action,payload,id=caseId,expected=200){const r=await fetch(base+'/api/workspace',{method:'POST',headers,body:JSON.stringify({action,payload,caseId:id,revision:state.revision})});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));if(r.ok)state=d.state;return d;}
const current=()=>state.cases.find(c=>c.id===caseId);
caseId=(await action('create',{companyName:'Core Workflow Validation (fictional)',website:'https://core-validation.example',sector:'Industrial software',geography:'Singapore',investmentStage:'Seed',owner:'PoC validation',thesis:'Fictional thesis: recurring industrial deployments.'})).createdId;
await action('analysis',{name:'Initial Screening'});
const emptyRun=structuredClone(current().runs[0]);assert.equal(emptyRun.assessment,'Insufficient evidence');assert.equal(emptyRun.evidence.length,0);
await action('edit',{...current(),strategy:'Fictional industrial strategy',roundSize:'USD 2m · fictional',checkSize:'USD 250k · fictional',valuation:'Unknown',source:'Local acceptance test',lead:'Unknown',notes:'Fictional test case, created only to verify the PoC workflow.'});
const sourceIds=[];
for(const [name,text] of [['pitch.txt','FICTIONAL: ARR USD 100,000. Active customers 12.'],['ledger.txt','FICTIONAL: ARR USD 100,000. Active customers 9.']]){
  const body=new FormData();body.set('file',new File([text],name));body.set('caseId',caseId);body.set('revision',String(state.revision));body.set('source','Fictional acceptance fixture');body.set('type',name==='pitch.txt'?'Pitch Deck':'Financial Model');
  const r=await fetch(base+'/api/documents',{method:'POST',headers:{cookie},body});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));state=d.state;const doc=current().docs.at(-1);sourceIds.push(doc.id);
  const download=await fetch(base+'/api/documents?id='+doc.id,{headers:{cookie}});assert.equal(await download.text(),text);
}
for(const [label,value,status,sourceIndex] of [['ARR','USD 100,000','Supported',1],['Active customers','12 (deck) / 9 (ledger)','Conflicting',1],['Customer concentration','Unknown','Unknown',0],['Expansion plans','Three new deployments claimed','Reported',0]]){
  await action('evidence',{label,value,status,kind:'Company claim',documentId:sourceIds[sourceIndex],locator:'Fictional excerpt · line 1',excerpt:`${label}: ${value}`,source:''});
}
await action('analysis',{name:'Due Diligence'});const reviewedRun=structuredClone(current().runs[0]);
await action('review',{runId:reviewedRun.id,outcome:'Disagree',rationale:'Fictional reviewer requests customer reconciliation.'});
const review=structuredClone(current().reviews[0]);
await action('question',{text:`What explains customer totals? Suggested from run ${reviewedRun.id}.`,category:'Traction',priority:'Normal',owner:'PoC validation',trigger:current().evidence[1].id});
await action('questionStatus',{id:current().questions[0].id,status:'Answered',resolution:'Fictional response received; definitions still require review.'});
await action('resolveEvidence',{id:current().evidence[3].id,status:'Verified',resolution:'Fictional manual verification for regression testing.'});
await action('analysis',{name:'Pre-IC'});
assert.deepEqual(current().runs.find(r=>r.id===reviewedRun.id),reviewedRun);
assert.deepEqual(current().runs.find(r=>r.id===emptyRun.id),emptyRun);
assert.deepEqual(current().reviews[0],review);
assert.equal(current().runs[0].evidence[3].status,'Verified');assert.equal(reviewedRun.evidence[3].status,'Reported');
await action('recommendation',{outcome:'Request More Diligence',rationale:'Fictional recommendation: resolve customer definitions.'});
await action('role',{role:'Analyst'});
await action('decision',{outcome:'Pass',rationale:'Must not save',participants:'Test'},caseId,400);
await action('role',{role:'Partner'});
await action('decision',{outcome:'Monitor',rationale:'Fictional partner decision while diligence remains open.',participants:'PoC validation partner'});
await action('role',{role:originalRole});
state=(await get()).state;
assert.equal(current().runs.length,3);assert.equal(current().reviews.length,1);assert.equal(current().decisions[0].outcome,'Monitor');assert.equal(current().questions[0].status,'Answered');
for(const c of before.cases)assert.deepEqual(state.cases.find(x=>x.id===c.id),c,'Existing case changed');
for(const co of before.companies)assert.deepEqual(state.companies.find(x=>x.id===co.id),co,'Existing company changed');
const report={passed:true,caseId,checkedAt:new Date().toISOString(),preservedExistingCases:before.cases.length,checks:['create and enrich context','upload and exact source download','four evidence statuses','empty-evidence analysis','three separate runs','historical snapshot immutability','run-linked disagreement','diligence and response','recommendation','Analyst decision denied','Partner decision saved','activity and reload','existing records unchanged']};
await mkdir('outputs',{recursive:true});
await writeFile('outputs/core-workflow-api-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
