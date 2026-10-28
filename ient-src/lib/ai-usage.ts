// Read-only projection of already owner-scoped Saved Runs. No journals, transport,
// inferred token counts or provider billing data are involved.
export type UsagePeriod = 'all' | '30d';
export type TokenMetric = {value?: bigint; reportedRuns: number};
export type UsageTotals = {generations: number; input: TokenMetric; output: TokenMetric; total: TokenMetric};
export type UsageRun = {id: string; caseId: string; caseName: string; createdAt: string; model?: string; documentCount?: number; input?: number; output?: number; total?: number};
type UsageCase = {id: string; name: string; runs: readonly unknown[]};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;
const token = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
function totals(): UsageTotals {return {generations: 0, input: {reportedRuns: 0}, output: {reportedRuns: 0}, total: {reportedRuns: 0}};}
function add(to: UsageTotals, run: UsageRun) {
  to.generations++;
  for (const key of ['input','output','total'] as const) if (run[key] !== undefined) {
    to[key].value = (to[key].value ?? BigInt(0)) + BigInt(run[key]);
    to[key].reportedRuns++;
  }
}
function documents(value: unknown): number | undefined {
  if (!Array.isArray(value)) return undefined;
  const ids = value.map(item => text(object(item).documentId));
  return ids.every(id => id !== undefined) ? new Set(ids).size : undefined;
}
export function aggregateAiUsage(cases: readonly UsageCase[], options: {period: UsagePeriod; nowMs: number; recentLimit?: number}) {
  const candidates: {run: UsageRun; requestKey?: string; family: string}[] = [];
  for (const c of cases) for (const value of Array.isArray(c.runs) ? c.runs : []) {
    const r = object(value), version = text(r.version), id = text(r.id);
    // A non-simulated flag alone is not evidence of a Gemini Run.
    if (r.simulated !== false || !id || !version || !/^gemini(?:-text)?:/.test(version)) continue;
    const family = version.startsWith('gemini-text:') ? 'minimum' : 'structured';
    const meta = object(family === 'minimum' ? r.minimum : r.gemini), usage = object(meta.usage);
    const requestId = text(meta.requestId) || (family === 'minimum' && /^GEMINI-TEXT-[a-f0-9-]{36}$/i.test(id) ? id.slice(12) : undefined);
    const model = text(meta.model) || text(meta.modelVersion) || version.split(':')[1] || undefined;
    candidates.push({family, requestKey: requestId ? `${family}:${requestId}` : undefined, run: {
      id, caseId: c.id, caseName: c.name, createdAt: text(r.createdAt) || '', model,
      documentCount: documents(family === 'minimum' ? meta.documents : object(meta.input).documents),
      input: token(usage.promptTokens), output: token(usage.outputTokens), total: token(usage.totalTokens),
    }});
  }
  // Canonical selection is independent of case-array order; historical objects
  // stay untouched. Deduplicate before timeframe filtering or recent truncation.
  candidates.sort((a,b) => compare(a.run.createdAt,b.run.createdAt) || compare(a.run.id,b.run.id) || compare(a.run.caseId,b.run.caseId));
  const ids = new Set<string>(), requests = new Set<string>(), unique: UsageRun[] = [];
  let duplicates = 0;
  for (const {run, requestKey, family} of candidates) {
    const id = `${family}:${run.id}`;
    const duplicate = ids.has(id) || (requestKey !== undefined && requests.has(requestKey));
    ids.add(id); if (requestKey) requests.add(requestKey);
    if (duplicate) {duplicates++; continue;}
    unique.push(run);
  }
  const selected = unique.filter(r => {
    if (options.period === 'all') return true;
    const time = Date.parse(r.createdAt);
    return Number.isFinite(time) && Number.isFinite(options.nowMs) && time >= options.nowMs - 30 * 86400000 && time <= options.nowMs;
  });
  const summary = totals(), groups = new Map<string | undefined, UsageTotals>();
  for (const r of selected) {add(summary,r); const group = groups.get(r.model) || totals(); add(group,r); groups.set(r.model,group);}
  selected.sort((a,b) => {
    const time = (r: UsageRun) => Number.isFinite(Date.parse(r.createdAt)) ? Date.parse(r.createdAt) : -Infinity;
    return (time(b) - time(a) || 0) || compare(a.id,b.id) || compare(a.caseId,b.caseId);
  });
  const limit = Math.max(0, Math.min(50, Math.floor(options.recentLimit ?? 10)));
  return {summary, models: [...groups].map(([model,usage]) => ({model,...usage})).sort((a,b) => compare(a.model || '',b.model || '')), recent: selected.slice(0,limit), duplicates, missingDates: unique.filter(r => !Number.isFinite(Date.parse(r.createdAt))).length};
}
