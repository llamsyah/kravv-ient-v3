import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {readFile,writeFile,unlink,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {AccessClient,initialize} from './access-client.mjs';

const base=process.env.TEST_BASE_URL||'http://localhost:5173';
const probePath=resolve('.sites-runtime/access-gate/qa-restart.json');
const sessionName='__kravv_access_session',deviceName='__kravv_access_device';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

if(process.argv.includes('--verify-restart')) {
  const probe=JSON.parse(await readFile(probePath,'utf8'));
  const client=new AccessClient(base,probe.cookies);
  const state=await client.state();
  assert.equal(state.user.workspaceId,probe.workspaceId);
  assert.equal(hash(state.state),probe.stateHash);
  await unlink(probePath);
  console.log('Passed: actual server restart restores signed session, owner and complete saved workspace.');
  process.exit(0);
}

const anonymous=new AccessClient(base);
// Native browser form regression: no-referrer used to turn even local POST
// navigations into Origin: null. Fix the served policy, not the origin guard.
const navigationHeaders={'Sec-Fetch-Site':'same-origin','Sec-Fetch-Mode':'navigate','Sec-Fetch-Dest':'document','Sec-Fetch-User':'?1'};
for(const page of ['/access','/access/initialize','/access/login','/access/recover','/access/signout','/access/legacy']) {
  const rendered=await anonymous.request(page);
  assert.equal(rendered.status,200);
  assert.equal(rendered.headers.get('referrer-policy'),'same-origin',page+' must preserve the origin of native local form submissions');
}
for(const origin of ['null','http://example.invalid','http://localhost:5999','http://127.0.0.1:5999']) {
  const rejected=await anonymous.post('/access/initialize',{operator:'Rejected browser QA',phrase:'Fictional browser phrase',confirmation:'Fictional browser phrase'},{...navigationHeaders,Origin:origin});
  assert.equal(rejected.status,403,'Untrusted origin must remain rejected: '+origin);
  assert.equal(rejected.headers.getSetCookie().length,0);
}
const nativeForm=new AccessClient(base);
const nativePhrase='Fictional native form '+Date.now();
const nativeResponse=await nativeForm.post('/access/initialize',{operator:'Native form QA',phrase:nativePhrase,confirmation:nativePhrase},{...navigationHeaders,Referer:base+'/access/initialize'});
assert.equal(nativeResponse.status,201,'Same-origin native initialization must reach the recovery-key page');
assert.equal(nativeResponse.headers.get('referrer-policy'),'same-origin');
assert.match(await nativeResponse.text(),/Keep your Recovery Key/);
assert.equal((await nativeForm.post('/access/continue',{saved:'yes'},{...navigationHeaders,Referer:base+'/access/initialize'})).status,303);
assert.equal((await nativeForm.post('/access/signout',{},navigationHeaders)).status,303);
assert.equal((await anonymous.request('/access/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,400);
for(const path of ['/api/workspace','/api/documents?id=missing'])assert.equal((await anonymous.request(path)).status,401);
let response=await anonymous.request('/');assert.ok([303,307].includes(response.status));assert.equal(response.headers.get('location'),'/access');
response=await anonymous.request('/access');assert.equal(response.status,200);assert.match(await response.text(),/KRAVV Access Gate/);
response=await anonymous.post('/access/initialize',{operator:'QA',phrase:'too short',confirmation:'too short'});assert.equal(response.status,400);
response=await anonymous.post('/access/initialize',{operator:'QA',phrase:'A sufficient phrase',confirmation:'Different phrase'});assert.equal(response.status,400);
response=await anonymous.post('/access/initialize',{operator:'QA',phrase:'A sufficient phrase',confirmation:'A sufficient phrase'},{Origin:'http://example.invalid'});assert.equal(response.status,403);
response=await anonymous.post('/access/login',{workspaceId:'KVI-AAAA-BBBB',phrase:'Fictional test phrase'},{'Sec-Fetch-Site':'cross-site'});assert.equal(response.status,403);
response=await anonymous.request('/api/workspace',{headers:{'x-kravv-local-mode':'1','x-kravv-operator-id':'local_workspace_FORGED','x-kravv-operator-name':'Forged','x-kravv-access-mode':'gate','x-kravv-workspace-id':'FORGED','oai-authenticated-user-id':'fake','oai-authenticated-user-email':'fake@example.invalid'}});assert.equal(response.status,401);
response=await anonymous.request('/api/workspace',{headers:{Cookie:'__sites_local_auth=1'}});assert.equal(response.status,401);
const invalidHostStatus=await new Promise((resolve,reject)=>{const request=httpRequest(base+'/access',{headers:{Host:'example.invalid'}},response=>{response.resume();resolve(response.statusCode);});request.on('error',reject);request.end();});assert.equal(invalidHostStatus,403);

const account=await initialize(base,'Access QA · fictional');
const {client,workspaceId,phrase,recoveryKey}=account;
const state=await client.state();assert.equal(state.user.workspaceId,workspaceId);assert.equal(state.user.email,'');assert.equal(state.user.localAccess,'gate');assert.equal(state.user.name,'Access QA · fictional');
const registry=JSON.parse(await readFile('.sites-runtime/access-gate/credentials.json','utf8'));
const stored=registry.workspaces[workspaceId];
assert.equal(stored.phraseHash.algorithm,'scrypt');assert.equal(stored.recoveryHash.algorithm,'scrypt');assert.notEqual(stored.phraseHash.salt,stored.recoveryHash.salt);
assert.ok(!JSON.stringify(registry).includes(phrase));assert.ok(!JSON.stringify(registry).includes(recoveryKey));assert.ok(!JSON.stringify(registry).includes(client.cookies[sessionName]));
response=await client.post('/access/initialize',{operator:'Duplicate submit',phrase,confirmation:phrase});assert.equal(response.status,303);assert.ok(!(await response.text()).includes(recoveryKey));
response=await client.request('/access/created');assert.equal(response.status,404);

// Create a fictional record so isolation and full-state restoration have material evidence.
response=await client.request('/api/workspace',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action:'create',revision:state.state.revision,payload:{companyName:'Access QA isolated case',website:'https://access-qa.example',sector:'Test software',geography:'Singapore',investmentStage:'Seed',owner:'Access QA'}})});
assert.equal(response.status,200);const changed=await response.json();const caseId=changed.createdId;
const originalCookies={...client.cookies};
response=await client.request('/access/signout');assert.equal(response.status,200);assert.equal((await client.state()).user.workspaceId,workspaceId);
response=await client.post('/access/signout',{});assert.equal(response.status,303);assert.equal(client.cookies[sessionName],undefined);assert.ok(client.cookies[deviceName]);
assert.equal((await client.request('/api/workspace')).status,401);
assert.equal((await new AccessClient(base,originalCookies).request('/api/workspace')).status,401,'Signed-out session replay must fail');
response=await client.post('/access/login',{workspaceId:'KVI-AAAA-BBBB',phrase});assert.equal(response.status,401);
response=await client.post('/access/login',{workspaceId,phrase:'Wrong phrase, long enough'});assert.equal(response.status,401);
response=await client.post('/access/login',{workspaceId:workspaceId.toLowerCase(),phrase});assert.equal(response.status,303);assert.equal((await client.state()).state.cases[0].id,caseId);
assert.equal((await new AccessClient(base,{[sessionName]:client.cookies[sessionName]}).request('/api/workspace')).status,401,'Session without device credential must fail');
const invalidDevice={...client.cookies,[deviceName]:client.cookies[deviceName]+'invalid'};
assert.equal((await new AccessClient(base,invalidDevice).request('/api/workspace')).status,401);
const tampered={...client.cookies,[sessionName]:client.cookies[sessionName]+'invalid'};
assert.equal((await new AccessClient(base,tampered).request('/api/workspace')).status,401);

const recovered=new AccessClient(base);
response=await recovered.post('/access/login',{workspaceId,phrase});assert.equal(response.status,409);assert.match(await response.text(),/Recover workspace access/);assert.equal((await recovered.request('/api/workspace')).status,401);
response=await recovered.post('/access/recover',{workspaceId,phrase,recoveryKey:'wrong'});assert.equal(response.status,401);
response=await recovered.post('/access/recover',{workspaceId,phrase:'Wrong phrase, long enough',recoveryKey});assert.equal(response.status,401);
response=await recovered.post('/access/recover',{workspaceId,phrase,recoveryKey:recoveryKey.toLowerCase().replaceAll('-',' ')});assert.equal(response.status,303);
assert.ok(response.headers.getSetCookie().every(value=>value.includes('HttpOnly')&&value.includes('SameSite=Lax')));
const restored=await recovered.state();assert.equal(restored.user.workspaceId,workspaceId);assert.deepEqual(restored.state,changed.state);
const second=await initialize(base,'Separate fictional operator');assert.notEqual(second.workspaceId,workspaceId);assert.ok(!(await second.client.state()).state.cases.some(c=>c.id===caseId));
response=await second.client.request('/api/documents?id=not-owned');assert.equal(response.status,404);

// Legacy compatibility opens pre-existing data only; never creates another email owner.
const legacy=new AccessClient(base);
response=await legacy.post('/access/legacy',{operator:'Absent legacy test',email:'never-created-before-access-gate@example.invalid'});assert.equal(response.status,400);assert.equal(legacy.cookies.__kravv_local_identity,undefined);
response=await legacy.post('/access/legacy',{operator:'Local QA',email:'local-qa@example.invalid'});
if(response.status===303) {
  const old=await legacy.state();assert.equal(old.user.localAccess,'legacy');
  const testCase=old.state.cases.find(c=>c.id==='CASE-2026-8881C241');
  if(testCase){assert.ok(testCase.docs.length);const doc=await legacy.request('/api/documents?id='+testCase.docs[0].id);assert.equal(doc.status,200);assert.equal(await doc.text(),'Fictional local file persistence check.');}
} else assert.equal(response.status,400,'A clean checkout may have no legacy QA record');

await writeFile(probePath,JSON.stringify({workspaceId,cookies:recovered.cookies,stateHash:hash(restored.state)}),{mode:0o600});
const report={passed:true,workspaceId,checks:['initialization and one-time key','scrypt hashes and separate salts','phrase and workspace validation','registered-device return','missing/tampered device recovery','wrong key rejection','signed session restoration','signout revocation','separate owners','legacy data and no new email owners','loopback/origin/header protections','unauthenticated API rejection'],restart:'Run --verify-restart after restarting the server.'};
await mkdir('outputs',{recursive:true});await writeFile('outputs/access-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
