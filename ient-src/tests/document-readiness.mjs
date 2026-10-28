// Requires an isolated QA source copy and loopback server; creates only fictional workspaces.
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {initialize, AccessClient} from './access-client.mjs';

const base = process.env.TEST_BASE_URL;
assert.ok(base, 'Set TEST_BASE_URL explicitly to an isolated QA server.');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
// Self-contained, valid one-page PDF. No parser or PDF generation dependency.
function pdf(text) {
  const stream = `BT /F1 12 Tf 40 80 Td (${text}) Tj ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 150] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let content = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((value, i) => {offsets.push(content.length); content += `${i + 1} 0 obj\n${value}\nendobj\n`;});
  const xref = content.length;
  content += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(content);
}
const {client} = await initialize(base, 'M2 Document QA (fictional)');
let state = (await client.state()).state;
const original = structuredClone(state);
async function action(action, payload, caseId) {
  const r = await client.request('/api/workspace', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action, payload, caseId, revision: state.revision})});
  const result = await r.json(); assert.equal(r.status, 200, JSON.stringify(result)); state = result.state; return result;
}
const create = name => action('create', {companyName: name, website: 'https://m2-qa.example', sector: 'Fictional software', geography: 'Indonesia', investmentStage: 'Seed', owner: 'M2 QA'});
const caseId = (await create('M2 PDF readiness QA (fictional)')).createdId;
const otherCaseId = (await create('M2 other case QA (fictional)')).createdId;
async function upload(id, name, bytes) {
  const form = new FormData(); form.set('caseId', id); form.set('revision', String(state.revision)); form.set('source', 'Fictional founder upload'); form.set('type', 'Pitch Deck'); form.set('file', new File([bytes], name, {type: 'application/pdf'}));
  const r = await client.request('/api/documents', {method: 'POST', body: form}); const d = await r.json(); assert.equal(r.status, 200, JSON.stringify(d)); state = d.state;
  return state.cases.find(c => c.id === id).docs.at(-1).id;
}
const firstBytes = pdf('Fictional first deck'), secondBytes = pdf('Fictional second deck');
const first = await upload(caseId, 'Fictional first deck.pdf', firstBytes);
const second = await upload(caseId, 'Fictional second deck.PDF', secondBytes);
const other = await upload(otherCaseId, 'Fictional other case.pdf', pdf('Different case'));
const text = await upload(caseId, 'notes.txt', new TextEncoder().encode('Fictional plain text'));
const spoof = await upload(caseId, 'spoof.pdf', new TextEncoder().encode('<html>Fictional non PDF</html>'));
await action('analysis', {name: 'Historical QA run before PDF preparation'}, caseId);
const baseline = structuredClone(state);
assert.equal(state.cases.find(c => c.id === caseId).evidence.length, 0);
async function prepare(ids, expected = 200, code, actor = client, chosenCase = caseId) {
  const r = await actor.request('/api/analysis/documents', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({caseId: chosenCase, documentIds: ids})});
  const result = await r.json(); assert.equal(r.status, expected, JSON.stringify(result));
  assert.equal(r.headers.get('cache-control'), 'private, no-store');
  if (code) assert.equal(result.code, code);
  return result;
}
const ready = await prepare([second, first]);
assert.deepEqual(ready.documents.map(d => d.documentId), [second, first]);
assert.equal(ready.version, 'case-pdf-input-v1'); assert.equal(ready.workspaceRevision, state.revision);
assert.equal(ready.totalBytes, firstBytes.length + secondBytes.length);
assert.equal(ready.documents[1].originalFilename, 'Fictional first deck.pdf');
assert.equal(ready.documents[0].source.description, 'Fictional founder upload');
assert.ok(!JSON.stringify(ready).includes('storageEtag'));
for (const d of ready.documents) {assert.ok(!('bytes' in d)); assert.ok(!('key' in d)); assert.equal(d.mimeType, 'application/pdf');}
await prepare([first, other], 404, 'DOCUMENT_NOT_FOUND');
await prepare(['missing-document'], 404, 'DOCUMENT_NOT_FOUND');
await prepare([text], 400, 'INVALID_PDF'); await prepare([spoof], 400, 'INVALID_PDF');
await prepare([], 400, 'INVALID_SELECTION'); await prepare(Array(6).fill(first), 400, 'INVALID_SELECTION');
await prepare([first, first], 400, 'DUPLICATE_DOCUMENT');
await prepare([first], 404, 'CASE_NOT_FOUND', client, 'missing-case');
await prepare([first], 401, 'AUTH_REQUIRED', new AccessClient(base));
const isolated = await initialize(base, 'M2 other owner QA (fictional)');
const denied = await prepare([first], 404, 'CASE_NOT_FOUND', isolated.client);
assert.ok(!JSON.stringify(denied).includes('Fictional first deck'));
const invalid = await client.request('/api/analysis/documents', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{invalid json'});
assert.equal(invalid.status, 400);
const crossOrigin = await client.request('/api/analysis/documents', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'http://example.invalid'}, body: JSON.stringify({caseId, documentIds: [first]})});
assert.equal(crossOrigin.status, 403);
for (const [id, bytes] of [[first, firstBytes], [second, secondBytes]]) {
  const response = await client.request('/api/documents?id=' + id); assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-disposition').startsWith('attachment;'));
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
}
assert.deepEqual((await client.state()).state, baseline, 'PDF preparation must not mutate cases, revision or historical runs');
for (const c of original.cases) assert.deepEqual(state.cases.find(x => x.id === c.id), c);
for (const c of original.companies) assert.deepEqual(state.companies.find(x => x.id === c.id), c);
const report = {passed: true, caseId, checks: ['two original PDFs without manual evidence', 'selection order and source metadata', 'cross-case and cross-owner rejection', 'unauthenticated rejection', 'invalid formats and selections', 'origin guard', 'unchanged original download bytes', 'no readiness state or historical run mutation', 'existing fictional fixtures retained']};
await mkdir('outputs', {recursive: true}); await writeFile('outputs/document-readiness-validation.json', JSON.stringify(report, null, 2));
// Fictional PDFs can also be uploaded through the browser during QA.
await writeFile('outputs/fictional-first.pdf', firstBytes); await writeFile('outputs/fictional-second.pdf', secondBytes);
console.log(JSON.stringify(report, null, 2));
