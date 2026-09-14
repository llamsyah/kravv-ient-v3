import type {Case, Evidence, Run} from './model';

// Presentation derivations only. Historical runs and evidence are never mutated.
export function evidenceChanges(current: Evidence[], snapshot: Evidence[]) {
  const old = new Map(snapshot.map(e => [e.id, e]));
  const present = new Set(current.map(e => e.id));
  const fields = ['label','value','status','kind','source','locator','documentId','excerpt','resolution'] as const;
  return {
    added: current.filter(e => !old.has(e.id)).length,
    changed: current.filter(e => {const before=old.get(e.id); return before && fields.some(k => before[k] !== e[k]);}).length,
    removed: snapshot.filter(e => !present.has(e.id)).length,
  };
}

export function analysisView(run: Run) {
  const byStatus = (status: string) => run.evidence.filter(e => e.status === status);
  const supported = run.evidence.filter(e => ['Supported','Verified'].includes(e.status));
  const conflicting = byStatus('Conflicting'), unknown = byStatus('Unknown'), reported = byStatus('Reported');
  const suggestions = [...conflicting,...unknown,...reported].map(e => ({
    evidence: e,
    question: e.status === 'Conflicting' ? `What explains the conflicting source statements for ${e.label}?` : e.status === 'Unknown' ? `What source information would establish ${e.label}?` : `What independent evidence can corroborate ${e.label}?`,
    reason: e.status === 'Conflicting' ? 'Conflicting statements remain unresolved in this snapshot.' : e.status === 'Unknown' ? 'This information is absent from the recorded evidence.' : 'The snapshot records a claim without corroborated status.',
  }));
  return {supported,conflicting,unknown,reported,suggestions,documentCount:new Set(run.evidence.map(e=>e.documentId).filter(Boolean)).size};
}

export function suggestedQuestionContext(c: Case, run: Run, evidence: Evidence, question: string) {
  // The existing question model has one evidence trigger and no run foreign key.
  // Preserve the original run reference in the editable question text instead.
  return {text:`${question}\n\nSuggested from analysis run ${run.id} (${run.name}). Snapshot: ${evidence.label} — ${evidence.value} [${evidence.status}].`,trigger:c.evidence.some(e=>e.id===evidence.id)?evidence.id:''};
}
