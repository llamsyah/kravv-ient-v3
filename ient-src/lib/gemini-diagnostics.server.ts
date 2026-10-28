// Fixed-field server diagnostics. Raw provider text is reduced to known summaries,
// never forwarded to the sink. Do not pass business data, headers or request bodies.
const phases = new Set(['analysis','analysis_result','workspace_read','pdf_prepare','context_read','journal_read','journal_claim','journal_ready','journal_failed','journal_saved','workspace_save','save_recovery','service_validate','provider_prepare','provider_result','provider_deadline','metadata_headers','metadata_body','metadata_json','generation_headers','generation_body','generation_json','structured_parse','structured_validate','error_body_cancel','provider_error_body','provider_error_diagnostic','qa_metadata_headers','qa_generation_headers','qa_response_processing','qa_application_headers','qa_application_body','unknown']);
const events = new Set(['start','completed','failed','timeout','aborted']);
const codes = new Set(['AUTH_REQUIRED','CONFLICT','INVALID_REQUEST','INVALID_ORIGIN','CASE_NOT_FOUND','REQUEST_REUSED','REQUEST_UNCERTAIN','REQUEST_IN_PROGRESS','REVISION_CONFLICT','SAVE_UNCERTAIN','MISSING_API_KEY','INVALID_MODEL','CONTEXT_TOO_LARGE','INPUT_TOO_LARGE','INVALID_RESPONSE','INCOMPLETE_RESPONSE','INVALID_SOURCES','PROVIDER_REDIRECT','QUOTA_EXCEEDED','CREDENTIALS_REJECTED','MODEL_UNAVAILABLE','PROVIDER_ERROR','PROVIDER_UNAVAILABLE','TIMEOUT','INVALID_SELECTION','DUPLICATE_DOCUMENT','DOCUMENT_NOT_FOUND','INVALID_PDF','EMPTY_PDF','DOCUMENT_TOO_LARGE','DOCUMENT_CHANGED','DOCUMENT_UNAVAILABLE','UNEXPECTED_FAILURE']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const googleStatuses = new Set(['CANCELLED','UNKNOWN','INVALID_ARGUMENT','DEADLINE_EXCEEDED','NOT_FOUND','ALREADY_EXISTS','PERMISSION_DENIED','RESOURCE_EXHAUSTED','FAILED_PRECONDITION','ABORTED','OUT_OF_RANGE','UNIMPLEMENTED','INTERNAL','UNAVAILABLE','DATA_LOSS','UNAUTHENTICATED']);
const errorBodyOutcomes = new Set(['parsed','invalid_json','limit_exceeded','empty','read_failed','aborted']);
const summaries: [RegExp, string][] = [
  [/unknown (?:name|field)|cannot find field/i, 'Unknown request field.'],
  [/invalid json payload/i, 'Invalid JSON payload.'],
  [/(?:invalid|unsupported|too complex).*schema|schema.*(?:invalid|unsupported|too complex)/i, 'Schema rejected.'],
  [/max_?output_?tokens.*(?:limit|must|exceed)/i, 'Output token limit rejected.'],
  [/api key|permission denied|unauthenticated|not authorized/i, 'Authentication or permission rejected.'],
  [/quota|rate.?limit|resource exhausted/i, 'Quota or rate limit exceeded.'],
  [/unavailable|overloaded|service.*busy/i, 'Provider unavailable.'],
  [/not supported|unsupported/i, 'Unsupported parameter or feature.'],
  [/invalid argument|invalid value/i, 'Invalid argument.'],
];
const summaryValues = new Set([...summaries.map(([,value]) => value), 'Provider message redacted.']);
// Only public API/schema names; no values, filenames or user-supplied map keys.
const fieldNames = new Set(('generationConfig generation_config contents parts role text inlineData inline_data mimeType mime_type data systemInstruction system_instruction model tools toolConfig tool_config safetySettings safety_settings cachedContent cached_content responseMimeType response_mime_type responseJsonSchema response_json_schema responseSchema response_schema responseFormat response_format maxOutputTokens max_output_tokens temperature topP top_p topK top_k candidateCount candidate_count thinkingConfig thinking_config thinkingLevel thinking_level type properties required additionalProperties additional_properties items minItems min_items maxItems max_items minLength maxLength enum anyOf oneOf title description default $ref $defs $schema executiveSummary businessOverview findings observation interpretation uncertainty counterargument documentIds evidenceIds risks missingInformation diligenceQuestions question').split(' '));
const fieldRoots = new Set(['generationConfig','generation_config','contents','systemInstruction','system_instruction','model','tools','toolConfig','tool_config','safetySettings','safety_settings','cachedContent','cached_content']);
export type ProviderErrorDiagnostic = {status?: string; message?: string; fieldViolations?: {field: string; description?: string}[]};
export type DiagnosticFields = {providerHttpStatus?: number; applicationHttpStatus?: number; headersReceived?: boolean; bodyComplete?: boolean; signalAborted?: boolean; errorCode?: string; errorBodyOutcome?: string; providerError?: ProviderErrorDiagnostic};
export type DiagnosticEvent = DiagnosticFields & {kind: 'gemini.phase.v1'; correlationId: string; attemptId: string; sequence: number; phase: string; event: string; elapsedMs: number; phaseMs?: number; clock: string};
export type DiagnosticSink = (event: DiagnosticEvent) => void;
export function isDiagnosticAbort(error: unknown): boolean {
  try {return (error as {name?: unknown})?.name === 'AbortError';} catch {return false;}
}
function messageSummary(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (summaryValues.has(value)) return value;
  const text = value.slice(0, 512);
  return summaries.find(([pattern]) => pattern.test(text))?.[1] || 'Provider message redacted.';
}
function safeField(value: unknown): string {
  if (typeof value !== 'string' || value.length > 256) return '[redacted]';
  const pieces = value.split('.');
  if (pieces.length > 16 || !fieldRoots.has(pieces[0].replace(/\[\d+\]$/, ''))) return '[redacted]';
  for (const piece of pieces) {
    const match = /^([A-Za-z_$][A-Za-z0-9_$]*)(?:\[(0|[1-9][0-9]?)\])?$/.exec(piece);
    if (!match || !fieldNames.has(match[1])) return '[redacted]';
  }
  return value;
}
function safeProviderError(value: unknown): ProviderErrorDiagnostic | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const error = value as ProviderErrorDiagnostic, result: ProviderErrorDiagnostic = {};
  if (typeof error.status === 'string' && googleStatuses.has(error.status)) result.status = error.status;
  if (typeof error.message === 'string') result.message = messageSummary(error.message);
  if (Array.isArray(error.fieldViolations)) result.fieldViolations = error.fieldViolations.slice(0, 8).map(v => ({field: safeField(v?.field), ...(typeof v?.description === 'string' ? {description: messageSummary(v.description)} : {})}));
  return Object.keys(result).length ? result : undefined;
}
export function googleErrorDiagnostic(value: unknown): ProviderErrorDiagnostic | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const error = (value as {error?: {status?: unknown; message?: unknown; details?: unknown[]}}).error;
  if (!error || typeof error !== 'object') return undefined;
  const violations: unknown[] = [];
  if (Array.isArray(error.details)) for (const item of error.details.slice(0, 8)) {
    const detail = item as {'@type'?: unknown; fieldViolations?: unknown[]};
    if (detail?.['@type'] !== 'type.googleapis.com/google.rpc.BadRequest' || !Array.isArray(detail.fieldViolations)) continue;
    violations.push(...detail.fieldViolations.slice(0, 8 - violations.length));
    if (violations.length === 8) break;
  }
  return safeProviderError({status: error.status, message: error.message, ...(violations.length ? {fieldViolations: violations} : {})});
}

function safeFields(value: DiagnosticFields): DiagnosticFields {
  const result: DiagnosticFields = {};
  try {
    for (const key of ['providerHttpStatus','applicationHttpStatus'] as const) if (Number.isInteger(value[key]) && value[key]! >= 100 && value[key]! <= 599) result[key] = value[key];
    for (const key of ['headersReceived','bodyComplete','signalAborted'] as const) if (typeof value[key] === 'boolean') result[key] = value[key];
    if (typeof value.errorCode === 'string' && codes.has(value.errorCode)) result.errorCode = value.errorCode;
    if (typeof value.errorBodyOutcome === 'string' && errorBodyOutcomes.has(value.errorBodyOutcome)) result.errorBodyOutcome = value.errorBodyOutcome;
    const providerError = safeProviderError(value.providerError);
    if (providerError) result.providerError = providerError;
  } catch { /* Diagnostics must never change request behavior. */ }
  return result;
}
export function diagnosticFailure(error: unknown, fallback = 'UNEXPECTED_FAILURE'): DiagnosticFields {
  try {
    const e = error as {code?: unknown; status?: unknown; message?: unknown};
    if (e?.message === 'AUTH_REQUIRED') return {errorCode: 'AUTH_REQUIRED', applicationHttpStatus: 401};
    if (e?.message === 'CONFLICT') return {errorCode: 'CONFLICT', applicationHttpStatus: 409};
    return safeFields({errorCode: typeof e?.code === 'string' && codes.has(e.code) ? e.code : fallback, applicationHttpStatus: typeof e?.status === 'number' ? e.status : undefined});
  } catch {return {errorCode: 'UNEXPECTED_FAILURE'};}
}
export function createGeminiDiagnostics(correlation?: unknown, options: {sink?: DiagnosticSink; now?: () => number} = {}) {
  const id = () => {try {return crypto.randomUUID();} catch {return '00000000-0000-0000-0000-000000000000';}};
  const correlationId = typeof correlation === 'string' && uuid.test(correlation) ? correlation : id(), attemptId = id();
  const hasMonotonic = typeof performance !== 'undefined' && typeof performance.now === 'function';
  const clock = options.now ? 'injected' : hasMonotonic ? 'monotonic' : 'wall_clamped';
  let last = 0, sequence = 0;
  function now() {try {const value = options.now ? options.now() : hasMonotonic ? performance.now() : Date.now(); if (Number.isFinite(value)) last = Math.max(last, value);} catch { /* Keep the last safe timestamp. */ } return last;}
  const started = now(), active = new Set<{end: (event: string, fields?: DiagnosticFields) => void}>();
  const round = (n: number) => Math.round(Math.max(0, n) * 1000) / 1000;
  function emit(phase: string, event: string, fields: DiagnosticFields = {}, phaseStart?: number) {
    try {
      const time = now();
      const record: DiagnosticEvent = {kind: 'gemini.phase.v1', correlationId, attemptId, sequence: ++sequence, phase: phases.has(phase) ? phase : 'unknown', event: events.has(event) ? event : 'failed', elapsedMs: round(time - started), clock, ...safeFields(fields)};
      if (phaseStart !== undefined) record.phaseMs = round(time - phaseStart);
      if (options.sink) options.sink(record); else console.info(JSON.stringify(record));
    } catch { /* A throwing logger must not break the application. */ }
  }
  function begin(phase: string, fields: DiagnosticFields = {}) {
    const start = now(), initial = safeFields(fields); let ended = false;
    const span = {end(event: string, extra: DiagnosticFields = {}) {if (ended) return; ended = true; active.delete(span); emit(phase, event, {...initial, ...safeFields(extra)}, start);}};
    active.add(span); emit(phase, 'start', initial, start); return span;
  }
  async function run<T>(phase: string, operation: () => Promise<T>, fields: DiagnosticFields = {}): Promise<T> {
    const span = begin(phase, fields);
    try {const value = await operation(); span.end('completed'); return value;} catch (error) {span.end('failed', diagnosticFailure(error)); throw error;}
  }
  function sync<T>(phase: string, operation: () => T, fields: DiagnosticFields = {}): T {
    const span = begin(phase, fields);
    try {const value = operation(); span.end('completed'); return value;} catch (error) {span.end('failed', diagnosticFailure(error)); throw error;}
  }
  function interrupt(event: 'failed' | 'timeout' | 'aborted', fields: DiagnosticFields = {}) {for (const span of [...active]) span.end(event, fields);}
  return {correlationId, attemptId, begin, run, sync, record: emit, interrupt};
}
export type GeminiDiagnostics = ReturnType<typeof createGeminiDiagnostics>;
