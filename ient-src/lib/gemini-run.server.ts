import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {identity, readState, saveState, bucket} from './storage';
import {prepareCasePdfInput} from './document-input.server';
import {readGeminiConfig, callGemini} from './gemini-provider.server';
import {GeminiError, GEMINI_PROMPT_VERSION, validateGeminiResult} from './gemini-analysis';
import type {GeminiProvenance} from './gemini-analysis';
import {addEvent, timestamp} from './model';
import type {Run, WorkspaceState} from './model';
import {createGeminiDiagnostics, diagnosticFailure} from './gemini-diagnostics.server';
import type {GeminiDiagnostics} from './gemini-diagnostics.server';

const requestSchema = z.object({
  caseId: z.string().min(1).max(200), name: z.string().trim().min(1).max(200),
  documentIds: z.array(z.string().min(1).max(250)).min(1).max(5),
  requestId: z.string().uuid(), revision: z.number().int().nonnegative(),
}).strict();
type Journal = {intent: string; caseId: string; status: 'started' | 'ready' | 'failed' | 'saved'; run?: Run; failure?: {code: string; message: string; status: number}};
const contextFields = ['name','stage','investmentStage','thesis','strategy','roundSize','checkSize','valuation','source','lead','notes'] as const;
async function intentHash(caseId: string, name: string, documentIds: string[]) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({caseId, name, documentIds})));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
}
const conflict = () => new GeminiError('REVISION_CONFLICT', 'The workspace changed. Reloaded data is required before retrying this request. A completed response will be saved from its original snapshot without another Gemini call.', 409);

export async function runGeminiAnalysis(value: unknown, trace: GeminiDiagnostics = createGeminiDiagnostics(value && typeof value === 'object' ? (value as {requestId?: unknown}).requestId : undefined)): Promise<{state: WorkspaceState; runId: string; reused: boolean}> {
  trace.record('analysis', 'start');
  try {
    const result = await executeGeminiAnalysis(value, trace);
    trace.record('analysis_result', 'completed', {applicationHttpStatus: 200});
    return result;
  } catch (error) {
    const failure = diagnosticFailure(error);
    if (failure.applicationHttpStatus === undefined) {
      failure.applicationHttpStatus = 503;
      failure.errorCode = 'SAVE_UNCERTAIN';
    }
    trace.interrupt('failed', failure);
    trace.record('analysis_result', 'failed', failure);
    throw error;
  }
}
async function executeGeminiAnalysis(value: unknown, trace: GeminiDiagnostics): Promise<{state: WorkspaceState; runId: string; reused: boolean}> {
  const user = await identity();
  const parsed = requestSchema.safeParse(value);
  if (!parsed.success) throw new GeminiError('INVALID_REQUEST', 'Provide a case, analysis context, 1–5 PDF IDs, request ID and current revision.');
  const request = parsed.data;
  if (new Set(request.documentIds).size !== request.documentIds.length) throw new GeminiError('INVALID_REQUEST', 'Select each PDF only once.');
  const intent = await intentHash(request.caseId, request.name, request.documentIds);
  const runId = `GEMINI-${request.requestId}`, storage = bucket();
  const key = `${user.userId}/analysis-requests/${request.requestId}.json`;
  let state = await trace.run('workspace_read', () => readState(user.userId));
  let investmentCase = state.cases.find(c => c.id === request.caseId);
  if (!investmentCase) throw new GeminiError('CASE_NOT_FOUND', 'Investment case not found.', 404);
  const saved = investmentCase.runs.find(r => r.id === runId);
  if (saved) {
    if (await intentHash(request.caseId, saved.name, saved.gemini?.input.documents.map(d => d.documentId) || []) !== intent) throw new GeminiError('REQUEST_REUSED', 'This request ID belongs to another selection or context.', 409);
    return {state, runId, reused: true};
  }

  async function readJournal(): Promise<Journal | null> {
    return trace.run('journal_read', async () => {
      const object = await storage.get(key);
      if (!object) return null;
      if (object.size > 512 * 1024) throw new GeminiError('REQUEST_UNCERTAIN', 'The request journal cannot be read safely. No new provider call was made.', 503);
      try {return await object.json<Journal>();} catch {throw new GeminiError('REQUEST_UNCERTAIN', 'The request journal is unavailable. No new provider call was made.', 503);}
    });
  }
  async function finish(journal: Journal, reused: boolean) {
    if (journal.intent !== intent || journal.caseId !== request.caseId) throw new GeminiError('REQUEST_REUSED', 'This request ID belongs to another selection or context.', 409);
    if (journal.status === 'failed' && journal.failure) throw new GeminiError(journal.failure.code, journal.failure.message, journal.failure.status);
    if (!journal.run || !['ready','saved'].includes(journal.status)) throw new GeminiError('REQUEST_IN_PROGRESS', 'This request has already started. Retry the same request later; it will not call Gemini again. If the server stopped mid-request, start a new request explicitly.', 409);
    state = await trace.run('workspace_read', () => readState(user.userId));
    investmentCase = state.cases.find(c => c.id === request.caseId);
    if (!investmentCase) throw new GeminiError('CASE_NOT_FOUND', 'Investment case not found.', 404);
    if (investmentCase.runs.some(r => r.id === runId)) return {state, runId, reused: true};
    if (state.revision !== request.revision) throw conflict();
    investmentCase.runs.unshift(structuredClone(journal.run));
    addEvent(investmentCase, `Gemini analysis completed: ${journal.run.name} (${runId}). Original PDF and case input provenance preserved.`, user.displayName);
    try {state = await trace.run('workspace_save', () => saveState(user.userId, state, request.revision));}
    catch (error) {
      const latest = await trace.run('save_recovery', () => readState(user.userId));
      if (latest.cases.find(c => c.id === request.caseId)?.runs.some(r => r.id === runId)) return {state: latest, runId, reused: true};
      if (error instanceof Error && error.message === 'CONFLICT') throw conflict();
      throw new GeminiError('SAVE_UNCERTAIN', 'Saving could not be confirmed. Retry the same request to check or save its completed response without another provider call.', 503);
    }
    // D1 is authoritative. A journal-update failure must not report a successfully saved run as failed.
    await trace.run('journal_saved', () => storage.put(key, JSON.stringify({...journal, status: 'saved'}), {httpMetadata: {contentType: 'application/json'}})).catch(() => {});
    return {state, runId, reused};
  }

  const existing = await readJournal();
  if (existing) return finish(existing, true);
  if (state.revision !== request.revision) throw conflict();
  const config = readGeminiConfig(env);
  const pdfs = await trace.run('pdf_prepare', () => prepareCasePdfInput({caseId: request.caseId, documentIds: request.documentIds}));
  state = await trace.run('context_read', () => readState(user.userId));
  investmentCase = state.cases.find(c => c.id === request.caseId);
  const company = state.companies.find(c => c.id === investmentCase?.companyId);
  if (!investmentCase || !company) throw new GeminiError('CASE_NOT_FOUND', 'Company or investment case not found.', 404);
  if (state.revision !== request.revision || pdfs.workspaceRevision !== state.revision) throw conflict();
  const evidence = structuredClone(investmentCase.evidence);
  const provenance: GeminiProvenance = {
    workspaceRevision: state.revision, company: structuredClone(company),
    caseContext: {...Object.fromEntries(contextFields.map(k => [k, investmentCase![k]])), analysisContext: request.name}, evidenceIds: evidence.map(e => e.id),
    documents: pdfs.documents.map(d => ({documentId: d.documentId, originalFilename: d.originalFilename, mimeType: d.mimeType, sizeBytes: d.sizeBytes, source: structuredClone(d.source), storageEtag: d.storageEtag})),
  };
  const started: Journal = {intent, caseId: request.caseId, status: 'started'};
  // Atomic claim prevents concurrent requests/processes from repeating a potentially billable call.
  const claim = await trace.run('journal_claim', () => storage.put(key, JSON.stringify(started), {onlyIf: new Headers({'If-None-Match': '*'}), httpMetadata: {contentType: 'application/json'}}));
  if (!claim) {
    const winner = await readJournal();
    if (!winner) throw new GeminiError('REQUEST_UNCERTAIN', 'The request claim could not be confirmed. Retry the same request.', 503);
    return finish(winner, true);
  }
  let ready: Journal;
  try {
    const generated = await callGemini({pdfs, provenance, evidence}, config, undefined, trace);
    const result = trace.sync('service_validate', () => validateGeminiResult(generated.result, {documentIds: request.documentIds, evidenceIds: provenance.evidenceIds}));
    const run: Run = {
      id: runId, name: request.name, createdAt: timestamp(), version: `gemini:${generated.modelVersion}:${GEMINI_PROMPT_VERSION}`,
      assessment: 'Gemini document analysis · human review required', evidence, simulated: false,
      findings: result.findings.map((f, i) => ({id: `${runId}-finding-${i + 1}`, dimension: 'Business analysis', observation: f.observation, interpretation: f.interpretation, counterargument: `${f.uncertainty}\n${f.counterargument}`, confidence: 'Model-generated · not independently verified', evidenceIds: f.evidenceIds, documentIds: f.documentIds})),
      gemini: {requestId: request.requestId, model: config.model, modelVersion: generated.modelVersion, promptVersion: GEMINI_PROMPT_VERSION, input: provenance, result, usage: generated.usage},
    };
    ready = {intent, caseId: request.caseId, status: 'ready', run};
    const body = JSON.stringify(ready);
    if (new TextEncoder().encode(body).byteLength > 512 * 1024) throw new GeminiError('INPUT_TOO_LARGE', 'The completed run exceeds the prototype persistence budget.', 413);
    await trace.run('journal_ready', () => storage.put(key, body, {httpMetadata: {contentType: 'application/json'}}));
  } catch (error) {
    const failure = error instanceof GeminiError ? error : new GeminiError('REQUEST_UNCERTAIN', 'The response could not be retained safely. No run was saved and no automatic provider retry was made.', 503);
    await trace.run('journal_failed', () => storage.put(key, JSON.stringify({...started, status: 'failed', failure: {code: failure.code, message: failure.message, status: failure.status}}), {httpMetadata: {contentType: 'application/json'}})).catch(() => {});
    throw failure;
  }
  return finish(ready, false);
}
