import type {Case,Run,WorkspaceState} from './model';
import {PDF_INPUT_LIMITS} from './document-input';

export type CaseNextAction = 'documents' | 'analysis' | 'review' | 'diligence' | 'recommendation' | 'decision';
export const investmentRoles = {Analyst:'Investment Analyst',Partner:'Investment Partner',Admin:'Administrator'} as const satisfies Record<WorkspaceState['role'],string>;
export const isSavedAiRun = (run: Run) => run.simulated === false && /^gemini(?:-text)?:/.test(run.version);

// Presentation only. Existing histories are newest-first; no stage, record,
// permission, verification status, or completeness score is written or inferred.
export function caseWorkflow(c: Case) {
  const latestAi = c.runs.find(isSavedAiRun);
  const latestSaved = c.runs[0];
  const aiReviews = latestAi ? c.reviews.filter(review => review.runId === latestAi.id) : [];
  const openQuestions = c.questions.filter(question => question.status !== 'Resolved');
  const pdfCandidates = c.docs.filter(doc => !doc.sampleText && /\.pdf$/i.test(doc.name) && Number.isSafeInteger(doc.size) && doc.size > 0 && doc.size <= PDF_INPUT_LIMITS.maxDocumentBytes);
  const recommendation = c.recommendations[0], decision = c.decisions[0];
  let next: CaseNextAction;
  if (latestAi && !aiReviews.length) next = 'review';
  else if (openQuestions.length) next = 'diligence';
  else if (decision) next = 'decision';
  else if (!latestAi) next = pdfCandidates.length ? 'analysis' : 'documents';
  else next = recommendation ? 'decision' : 'recommendation';
  return {latestAi,latestSaved,aiReviews,openQuestions,pdfCandidates,recommendation,decision,next};
}
