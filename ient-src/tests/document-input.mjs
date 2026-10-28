// In-memory server-contract regressions. No application storage or network is used.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url), ts = require('typescript');
function load(relative, dependencies = {}) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const loaded = {exports: {}};
  new Function('require', 'exports', 'module', code)(name => dependencies[name] ?? require(name), loaded.exports, loaded);
  return loaded.exports;
}
const shared = load('../lib/document-input.ts');
const bytes = new TextEncoder().encode('%PDF-1.4\nFictional envelope fixture\n%%EOF\n');
const doc = (id, name = `${id}.pdf`, size = bytes.length) => ({id, name, size, source: 'Fictional founder', type: 'Pitch Deck', createdAt: '2026-10-25T00:00:00Z', author: 'QA'});
let signedIn = true, state, objects, reads;
const storage = {
  identity: async () => {if (!signedIn) throw new Error('AUTH_REQUIRED'); return {userId: 'owner-qa'};},
  readState: async owner => {assert.equal(owner, 'owner-qa'); return state;},
  bucket: () => ({get: async key => {reads.push(key); return objects.get(key) ?? null;}}),
};
const server = load('../lib/document-input.server.ts', {'./storage': storage, './document-input': shared});
const {prepareCasePdfInput, summarizeCasePdfInput, PdfInputError} = server;
function object(data = bytes, size = data.length) {
  return {size, etag: 'qa-etag', body: new ReadableStream({start(controller) {controller.enqueue(data); controller.close();}})};
}
function reset() {
  signedIn = true; reads = [];
  state = {revision: 4, cases: [{id: 'case-a', docs: [doc('a'), doc('b', 'Fictional résumé.PDF')], evidence: [], runs: [{id: 'historical', assessment: 'Untouched'}]}, {id: 'case-b', docs: [doc('other')]}]};
  objects = new Map([['owner-qa/a', object()], ['owner-qa/b', object()]]);
}
async function rejects(code, selection = {caseId: 'case-a', documentIds: ['a']}, status) {
  await assert.rejects(() => prepareCasePdfInput(selection), error => {
    assert.ok(error instanceof PdfInputError); assert.equal(error.code, code);
    if (status) assert.equal(error.status, status);
    return true;
  });
}
reset();
const before = structuredClone(state);
const input = await prepareCasePdfInput({caseId: 'case-a', documentIds: ['b', 'a']});
assert.equal(input.version, 'case-pdf-input-v1'); assert.equal(input.workspaceRevision, 4);
assert.deepEqual(input.documents.map(d => d.documentId), ['b', 'a']);
assert.equal(input.documents[0].originalFilename, 'Fictional résumé.PDF');
assert.equal(input.documents[0].source.description, 'Fictional founder');
for (const d of input.documents) assert.deepEqual(d.bytes, bytes);
assert.equal(input.totalBytes, 2 * bytes.length); assert.deepEqual(state, before);
const summary = summarizeCasePdfInput(input);
assert.ok(!JSON.stringify(summary).includes('qa-etag'));
for (const d of summary.documents) {assert.ok(!('bytes' in d)); assert.ok(!('storageEtag' in d));}
reset(); signedIn = false;
await assert.rejects(() => prepareCasePdfInput({caseId: 'case-a', documentIds: ['a']}), /AUTH_REQUIRED/); assert.deepEqual(reads, []);
reset(); await rejects('CASE_NOT_FOUND', {caseId: 'foreign-owner-case', documentIds: ['a']}, 404);
reset(); await rejects('DOCUMENT_NOT_FOUND', {caseId: 'case-a', documentIds: ['a', 'other']}, 404); assert.deepEqual(reads, []);
reset(); await rejects('DOCUMENT_NOT_FOUND', {caseId: 'case-a', documentIds: ['missing']}, 404);
reset(); objects.clear(); await rejects('DOCUMENT_UNAVAILABLE', undefined, 404);
reset(); state.cases[0].docs[0].name = 'notes.txt'; await rejects('INVALID_PDF'); assert.deepEqual(reads, []);
reset(); state.cases[0].docs[0].sampleText = 'not original bytes'; await rejects('INVALID_PDF');
reset(); const html = new TextEncoder().encode('<html>not PDF</html>\n%%EOF\n'); state.cases[0].docs[0].size = html.length; objects.set('owner-qa/a', object(html)); await rejects('INVALID_PDF');
reset(); const truncated = new TextEncoder().encode('%PDF-1.4\nmissing end marker'); state.cases[0].docs[0].size = truncated.length; objects.set('owner-qa/a', object(truncated)); await rejects('INVALID_PDF');
reset(); state.cases[0].docs[0].size = 0; await rejects('EMPTY_PDF');
reset(); state.cases[0].docs[0].size = shared.PDF_INPUT_LIMITS.maxDocumentBytes + 1; await rejects('DOCUMENT_TOO_LARGE', undefined, 413); assert.deepEqual(reads, []);
reset(); state.cases[0].docs[0].size = 7 * 1024 * 1024; state.cases[0].docs[1].size = 6 * 1024 * 1024;
await rejects('INPUT_TOO_LARGE', {caseId: 'case-a', documentIds: ['a', 'b']}, 413); assert.deepEqual(reads, []);
reset(); await rejects('INVALID_SELECTION', {caseId: 'case-a', documentIds: []});
await rejects('INVALID_SELECTION', {caseId: 'case-a', documentIds: Array(6).fill('a')});
await rejects('INVALID_SELECTION', {caseId: 'case-a', documentIds: ['a'], ownerId: 'forged-owner'});
await rejects('DUPLICATE_DOCUMENT', {caseId: 'case-a', documentIds: ['a', 'a']});
reset(); objects.set('owner-qa/a', object(bytes, bytes.length + 1)); await rejects('DOCUMENT_CHANGED', undefined, 409);
reset(); objects.set('owner-qa/a', object(bytes.subarray(0, 4), bytes.length)); await rejects('DOCUMENT_UNAVAILABLE', undefined, 404);
reset(); objects.set('owner-qa/a', object(new Uint8Array(bytes.length + 1), bytes.length)); await rejects('DOCUMENT_CHANGED', undefined, 409);
console.log('Passed: authenticated case ownership, multiple original PDFs and order, metadata-only projection, missing objects, invalid/truncated formats, count/size budgets, duplicate IDs, bounded streams, and unchanged historical state.');
