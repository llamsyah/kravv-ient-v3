import {Buffer} from 'node:buffer';
import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {identity, readState, saveState, bucket} from '@/lib/storage';
import {addEvent} from '@/lib/model';
import type {Run, Company} from '@/lib/model';
import {prepareCasePdfInput, PdfInputError} from '@/lib/document-input.server';
import type {PreparedCasePdfInput} from '@/lib/document-input.server';
import {readGeminiConfig, readJson, GEMINI_REQUEST_LIMIT, GEMINI_RESPONSE_LIMIT, inspectProviderError, providerFailure} from '@/lib/gemini-provider.server';
import {GeminiError} from '@/lib/gemini-analysis';
import {createGeminiDiagnostics, diagnosticFailure} from '@/lib/gemini-diagnostics.server';
import type {DiagnosticFields} from '@/lib/gemini-diagnostics.server';
import {getMinimumAnalysisPrompt, PROMPT_LANGUAGES} from '@/lib/minimum-analysis-prompt';
import type {PromptLanguage} from '@/lib/minimum-analysis-prompt';
import {PDF_INPUT_LIMITS} from '@/lib/document-input';
import {MINIMUM_INPUT_VERSION, MULTI_PDF_CONTEXT} from '@/lib/minimum-analysis';

export const dynamic = 'force-dynamic';
const minimumModel = 'gemini-3.5-flash-lite';
const journalLimit = 512 * 1024;
const requestSchema = z.object({caseId: z.string().min(1).max(200), name: z.string().trim().max(200).optional(), documentIds: z.array(z.string().min(1).max(250)).min(1).max(PDF_INPUT_LIMITS.maxDocuments), requestId: z.string().uuid(), revision: z.number().int().nonnegative(), locale: z.enum(PROMPT_LANGUAGES).default('id-ID')}).strict();
const saveSchema = z.object({action: z.literal('save'), caseId: z.string().min(1).max(200), requestId: z.string().uuid(), revision: z.number().int().nonnegative()}).strict();
type SaveInput = z.infer<typeof saveSchema>;
type User = {userId: string; displayName: string};
type Envelope = {modelVersion?: unknown; usageMetadata?: {promptTokenCount?: unknown; candidatesTokenCount?: unknown; totalTokenCount?: unknown}; candidates?: {finishReason?: unknown; content?: {parts?: {text?: unknown; thought?: unknown}[]}}[]};
type Provenance = {requestId: string; caseId: string; workspaceRevision: number; analysisName: string; company: Company; caseContext: {name: string; thesis: string}; documents: Omit<PreparedCasePdfInput['documents'][number], 'bytes'>[]; model: string; promptVersion: string; language?: PromptLanguage; instruction: string; sourceContext?: string; createdAt: string};
type Journal = {status: 'started' | 'generated' | 'saved' | 'failed'; intent: string; intentVersion?: 'locale-v1' | typeof MINIMUM_INPUT_VERSION; provenance: Provenance; analysisText?: string; envelope?: Envelope; failure?: {code: string; message: string; status: number}; runId?: string};
const journalKey = (user: User, requestId: string) => `${user.userId}/minimum-analysis/${requestId}.json`;
const conflict = () => new GeminiError('REVISION_CONFLICT', 'The workspace changed. Reload and retry the same request to save its original response without another provider call.', 409);
function encodeJournal(journal: Journal) {
  const text = JSON.stringify(journal);
  if (Buffer.byteLength(text) > journalLimit) throw new GeminiError('INPUT_TOO_LARGE', 'The analysis journal exceeds the prototype storage budget.', 413);
  return text;
}
async function readJournal(key: string): Promise<Journal | null> {
  const object = await bucket().get(key);
  if (!object) return null;
  if (object.size > journalLimit) throw new GeminiError('REQUEST_UNCERTAIN', 'The request journal cannot be read safely. No generation repeated.', 503);
  try {
    const value = await object.json<Journal>();
    if (!value || !['started','generated','saved','failed'].includes(value.status) || typeof value.intent !== 'string' || !value.provenance) throw new Error('Invalid journal');
    return value;
  } catch {throw new GeminiError('REQUEST_UNCERTAIN', 'The request journal is unavailable. No generation repeated.', 503);}
}
async function intentHash(input: z.infer<typeof requestSchema>, legacy = false, frozen?: Provenance) {
  const value = JSON.stringify({caseId: input.caseId, name: input.name || '', documentIds: input.documentIds, ...(!legacy ? {locale: input.locale} : {}), ...(frozen ? {inputVersion: MINIMUM_INPUT_VERSION, model: frozen.model, promptVersion: frozen.promptVersion, sourceContext: frozen.sourceContext, documents: frozen.documents} : {})});
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
async function saveGenerated(user: User, input: Pick<SaveInput, 'caseId' | 'requestId' | 'revision'>, journal: Journal) {
  if (journal.provenance.caseId !== input.caseId) throw new GeminiError('REQUEST_REUSED', 'This request ID belongs to another investment case.', 409);
  if (journal.status === 'failed' && journal.failure) throw new GeminiError(journal.failure.code, journal.failure.message, journal.failure.status);
  if (journal.status === 'started') throw new GeminiError('REQUEST_IN_PROGRESS', 'This request has already started. Reusing its ID will not call Gemini again.', 409);
  if (!['generated','saved'].includes(journal.status) || !journal.envelope || typeof journal.analysisText !== 'string' || !journal.analysisText.trim()) throw new GeminiError('REQUEST_UNCERTAIN', 'No completed text response is available. No generation repeated.', 503);
  const state = await readState(user.userId), investmentCase = state.cases.find(c => c.id === input.caseId);
  if (!investmentCase) throw new GeminiError('CASE_NOT_FOUND', 'Investment case not found.', 404);
  const runId = 'GEMINI-TEXT-' + input.requestId;
  if (investmentCase.runs.some(r => r.id === runId)) return {state, runId, reused: true};
  if (state.revision !== input.revision) throw conflict();
  const modelVersion = typeof journal.envelope.modelVersion === 'string' ? journal.envelope.modelVersion.slice(0, 200) : journal.provenance.model;
  // Preserve literal model text. Empty arrays do not claim structured validation
  // or invent interpretations, counterarguments, evidence or source citations.
  const run: Run = {id: runId, name: journal.provenance.analysisName, createdAt: new Date().toISOString(), version: `gemini-text:${modelVersion}:${journal.provenance.promptVersion}`, assessment: journal.analysisText, evidence: [], findings: [], simulated: false};
  if (journal.intentVersion === MINIMUM_INPUT_VERSION) {
    const token = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
    run.minimum = {inputVersion: MINIMUM_INPUT_VERSION, requestId: input.requestId, model: journal.provenance.model, modelVersion, promptVersion: journal.provenance.promptVersion, locale: journal.provenance.language || 'id-ID', documents: journal.provenance.documents.map((doc, index) => ({...structuredClone(doc), order: index + 1, sourceLabel: `SOURCE-${index + 1}`})), usage: {promptTokens: token(journal.envelope.usageMetadata?.promptTokenCount), outputTokens: token(journal.envelope.usageMetadata?.candidatesTokenCount), totalTokens: token(journal.envelope.usageMetadata?.totalTokenCount)}};
  }
  if (Buffer.byteLength(JSON.stringify(run)) > journalLimit) throw new GeminiError('INPUT_TOO_LARGE', 'Run storage budget exceeded.', 413);
  investmentCase.runs.unshift(run);
  addEvent(investmentCase, `Original Gemini PDF text saved (${runId}); input provenance retained in the private request journal.`, user.displayName);
  let saved;
  try {saved = await saveState(user.userId, state, input.revision);}
  catch (error) {
    const latest = await readState(user.userId);
    if (latest.cases.find(c => c.id === input.caseId)?.runs.some(r => r.id === runId)) return {state: latest, runId, reused: true};
    if (error instanceof Error && error.message === 'CONFLICT') throw conflict();
    throw new GeminiError('SAVE_UNCERTAIN', 'Save could not be confirmed. Retry the same request; the original response is retained without generation.', 503);
  }
  // D1 is authoritative; failure to finalize R2 must not mask a confirmed save.
  try {await bucket().put(journalKey(user, input.requestId), encodeJournal({...journal, status: 'saved', runId}), {httpMetadata: {contentType: 'application/json'}});} catch { /* D1 already confirmed the run. */ }
  return {state: saved, runId, reused: false};
}
function extractText(value: unknown): {envelope: Envelope; analysisText: string} {
  if (!value || typeof value !== 'object') throw new GeminiError('INVALID_RESPONSE', 'Gemini returned an invalid response.', 502);
  const envelope = value as Envelope, candidate = envelope.candidates?.[0];
  if (candidate?.finishReason !== 'STOP') throw new GeminiError('INCOMPLETE_RESPONSE', 'Gemini did not finish the text analysis. No run was saved.', 502);
  const parts = candidate.content?.parts;
  if (!Array.isArray(parts) || parts.some(p => !p || typeof p !== 'object' || (p.thought !== true && typeof p.text !== 'string'))) throw new GeminiError('INVALID_RESPONSE', 'Gemini returned invalid text parts. No run was saved.', 502);
  const analysisText = parts.filter(p => p.thought !== true).map(p => p.text as string).join('');
  if (!analysisText.trim()) throw new GeminiError('INVALID_RESPONSE', 'Gemini returned no analysis text.', 502);
  return {envelope, analysisText};
}
export async function POST(request: Request) {
  const headers = {'Cache-Control': 'private, no-store'};
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const user = await identity(), origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) throw new GeminiError('INVALID_ORIGIN', 'Invalid request origin.', 403);
    let raw: unknown;
    try {raw = await request.json();} catch {throw new GeminiError('INVALID_REQUEST', 'Send a valid analysis request.');}
    if (raw && typeof raw === 'object' && 'action' in raw && raw.action === 'save') {
      const parsed = saveSchema.safeParse(raw);
      if (!parsed.success) throw new GeminiError('INVALID_REQUEST', 'Provide the captured request and current revision.');
      const journal = await readJournal(journalKey(user, parsed.data.requestId));
      if (!journal) throw new GeminiError('REQUEST_UNCERTAIN', 'Completed response unavailable. No generation repeated.', 503);
      return Response.json(await saveGenerated(user, parsed.data, journal), {headers});
    }
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success && raw && typeof raw === 'object' && 'locale' in raw && raw.locale !== 'id-ID' && raw.locale !== 'en-US') throw new GeminiError('INVALID_REQUEST', 'Unsupported analysis locale.');
    if (!parsed.success) throw new GeminiError('INVALID_REQUEST', 'Select 1–5 case PDFs and provide a request ID and current revision.');
    const input = parsed.data, key = journalKey(user, input.requestId), trace = createGeminiDiagnostics(input.requestId);
    const finish = async (journal: Journal) => {
      if (journal.intentVersion !== undefined && journal.intentVersion !== 'locale-v1' && journal.intentVersion !== MINIMUM_INPUT_VERSION) throw new GeminiError('REQUEST_UNCERTAIN', 'The request journal cannot be read safely. No generation repeated.', 503);
      // Replay binds the original, private source snapshot. Do not read mutable
      // case documents or call the provider to recover a completed response.
      if (journal.intentVersion === MINIMUM_INPUT_VERSION && JSON.stringify(journal.provenance.documents.map(d => d.documentId)) !== JSON.stringify(input.documentIds)) throw new GeminiError('REQUEST_REUSED', 'This request ID belongs to another case, PDF selection or analysis context.', 409);
      if (journal.intent !== await intentHash(input, journal.intentVersion === undefined, journal.intentVersion === MINIMUM_INPUT_VERSION ? journal.provenance : undefined)) throw new GeminiError('REQUEST_REUSED', 'This request ID belongs to another case, PDF selection or analysis context.', 409);
      return saveGenerated(user, input, journal);
    };
    const initialState = await readState(user.userId), initialCase = initialState.cases.find(c => c.id === input.caseId);
    if (!initialCase) throw new GeminiError('CASE_NOT_FOUND', 'Investment case not found.', 404);
    const previous = await readJournal(key);
    if (previous) return Response.json(await finish(previous), {headers});
    if (initialCase.runs.some(r => r.id === 'GEMINI-TEXT-' + input.requestId)) throw new GeminiError('REQUEST_UNCERTAIN', 'The Run is saved, but its original request journal is unavailable. No generation repeated.', 503);
    const pdfs = await prepareCasePdfInput({caseId: input.caseId, documentIds: input.documentIds});
    const workspace = await readState(user.userId), investmentCase = workspace.cases.find(c => c.id === input.caseId), company = workspace.companies.find(c => c.id === investmentCase?.companyId);
    if (!investmentCase || !company) throw new GeminiError('CASE_NOT_FOUND', 'Company or investment case not found.', 404);
    if (workspace.revision !== input.revision || pdfs.workspaceRevision !== input.revision) throw conflict();
    // This flow has its own fixed model; unrelated GEMINI_MODEL settings and the
    // existing structured adapter remain unchanged. The key stays server-side.
    const config = readGeminiConfig({GEMINI_API_KEY: env.GEMINI_API_KEY, GEMINI_MODEL: minimumModel});
    const {instruction, promptVersion, language} = getMinimumAnalysisPrompt(input.locale);
    const parts = [{text: MULTI_PDF_CONTEXT}, ...pdfs.documents.flatMap((doc, index) => [{text: JSON.stringify({sourceLabel: `SOURCE-${index + 1}`, documentId: doc.documentId, originalFilename: doc.originalFilename})}, {inlineData: {mimeType: 'application/pdf', data: Buffer.from(doc.bytes).toString('base64')}}]), {text: instruction}];
    const body = JSON.stringify({contents: [{role: 'user', parts}], generationConfig: {maxOutputTokens: 8192}});
    if (Buffer.byteLength(body) > GEMINI_REQUEST_LIMIT) throw new GeminiError('INPUT_TOO_LARGE', 'Request limit exceeded.', 413);
    const provenance: Provenance = {requestId: input.requestId, caseId: input.caseId, workspaceRevision: input.revision, analysisName: input.name || 'Gemini PDF analysis — text', company: structuredClone(company), caseContext: {name: investmentCase.name, thesis: investmentCase.thesis}, documents: pdfs.documents.map(d => ({documentId: d.documentId, originalFilename: d.originalFilename, mimeType: d.mimeType, sizeBytes: d.sizeBytes, source: structuredClone(d.source), storageEtag: d.storageEtag})), model: config.model, promptVersion, language, instruction, sourceContext: MULTI_PDF_CONTEXT, createdAt: new Date().toISOString()};
    const started: Journal = {status: 'started', intent: await intentHash(input, false, provenance), intentVersion: MINIMUM_INPUT_VERSION, provenance};
    const claim = await bucket().put(key, encodeJournal(started), {onlyIf: new Headers({'If-None-Match': '*'}), httpMetadata: {contentType: 'application/json'}});
    if (!claim) {
      const winner = await readJournal(key);
      if (!winner) throw new GeminiError('REQUEST_UNCERTAIN', 'The request claim could not be confirmed. No generation repeated.', 503);
      return Response.json(await finish(winner), {headers});
    }
    const controller = new AbortController(), state: DiagnosticFields = {headersReceived: false, bodyComplete: false, signalAborted: false};
    let rejection: GeminiError | undefined, providerComplete = false, generationStored = false;
    timer = setTimeout(() => {controller.abort(); state.signalAborted = true; const failure = {...state, ...(rejection ? diagnosticFailure(rejection) : {errorCode: 'TIMEOUT', applicationHttpStatus: 504})}; trace.record('provider_deadline', 'timeout', failure); trace.interrupt('timeout', failure);}, config.timeoutMs);
    try {
      const span = trace.begin('generation_headers', state);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`, {method: 'POST', headers: {'x-goog-api-key': config.apiKey, 'Content-Type': 'application/json'}, body, redirect: 'manual', signal: controller.signal});
      state.headersReceived = true; state.providerHttpStatus = response.status; span.end('completed', state);
      if (!response.ok) {
        try {providerFailure(response.status);} catch (error) {if (!(error instanceof GeminiError)) throw error; rejection = error;}
        await inspectProviderError(response, controller.signal, trace, state, rejection!); throw rejection;
      }
      const {envelope, analysisText} = extractText(await readJson(response, GEMINI_RESPONSE_LIMIT, trace, 'generation', state));
      providerComplete = true;
      await bucket().put(key, encodeJournal({...started, status: 'generated', envelope, analysisText}), {httpMetadata: {contentType: 'application/json'}});
      generationStored = true; trace.record('provider_result', 'completed', state);
      clearTimeout(timer); timer = undefined;
      return Response.json(await finish({...started, status: 'generated', envelope, analysisText}), {headers});
    } catch (error) {
      if (generationStored) throw error;
      const failure = rejection || (controller.signal.aborted ? new GeminiError('TIMEOUT', 'Gemini timed out. No retry was made; the provider may still have processed it.', 504) : error instanceof GeminiError ? error : providerComplete ? new GeminiError('REQUEST_UNCERTAIN', 'The completed response could not be retained safely. No automatic provider retry was made.', 503) : new GeminiError('PROVIDER_UNAVAILABLE', 'The Gemini connection failed. No automatic retry was made.', 502));
      trace.interrupt('failed', {...state, ...diagnosticFailure(failure)}); trace.record('provider_result', 'failed', {...state, ...diagnosticFailure(failure)});
      try {await bucket().put(key, encodeJournal({...started, status: 'failed', failure: {code: failure.code, message: failure.message, status: failure.status}}), {httpMetadata: {contentType: 'application/json'}});} catch { /* The started claim still prevents duplicate generation. */ }
      throw failure;
    }
  } catch (error) {
    if (error instanceof GeminiError || error instanceof PdfInputError) return Response.json({code: error.code, error: error.message}, {status: error.status, headers});
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return Response.json({code: 'AUTH_REQUIRED', error: 'Sign in first.'}, {status: 401, headers});
    return Response.json({code: 'REQUEST_UNCERTAIN', error: 'The analysis request could not be confirmed. Reuse its ID; no automatic generation retry was made.'}, {status: 503, headers});
  } finally {if (timer !== undefined) clearTimeout(timer);}
}
