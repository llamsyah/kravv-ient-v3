'use client';
import {ArrowRight,ArrowUpRight} from 'lucide-react';
import type {Case} from '@/lib/model';
import {caseWorkflow,type CaseNextAction} from '@/lib/case-workflow';
import {useI18n} from './localization';

const nextLabels = {documents:'Collect source PDFs',analysis:'Prepare AI analysis',review:'Review saved AI analysis',diligence:'Follow up open diligence',recommendation:'Record analyst recommendation',decision:'View human decision workflow'} as const;
const reasons = {
  documents:'Upload original PDFs to start preliminary AI analysis. Manual Evidence and complete investment context are not prerequisites.',
  analysis:'PDFs can be selected for one analysis. The server rechecks ownership, availability and limits before contacting Gemini.',
  review:'The latest saved AI Run has no Human Review yet. Read its original report and record your own judgment.',
  diligence:'Recorded questions still need follow-up. Revisit their owners, responses and status; resolution is a human action.',
  recommendation:'Record an analyst recommendation separately from AI output and Human Review. It does not approve an investment.',
  decision:'Recommendations and decisions are separate records. The existing Partner/Admin decision permission remains in effect.',
} as const;

export default function CaseWorkflowOverview({c,busy,onAction,onHistory}: {c:Case;busy:boolean;onAction:(action:CaseNextAction)=>void;onHistory:()=>void}) {
  const {t,number}=useI18n(),work=caseWorkflow(c);
  const indicators = [
    {title:'Source documents',value:t('{count} recorded sources',{count:number(c.docs.length)}),detail:t('{count} PDFs selectable by metadata',{count:number(work.pdfCandidates.length)}),action:'documents'},
    {title:'AI Analysis',value:t(work.latestAi?'AI analysis saved':'No saved AI analysis'),detail:t('{count} saved Runs · simulations remain available',{count:number(c.runs.length)}),action:work.latestAi?'review':'analysis'},
    {title:'Human review',value:t(!work.latestAi?'No saved AI analysis':work.aiReviews.length?'Human Review recorded':'Awaiting Human Review'),detail:t('Review is a recorded human judgment, not independent verification.'),action:'review'},
    {title:'Diligence',value:t('{count} open questions',{count:number(work.openQuestions.length)}),detail:t('Only recorded questions are counted; missing questions may still exist.'),action:'diligence'},
    {title:'Analyst recommendation',value:t(work.recommendation?'Recommendation recorded':'No recommendation recorded'),detail:t('Human recommendation, separate from the investment decision.'),action:'recommendation'},
    {title:'Final human decision',value:t(work.decision?'Human decision recorded':'No human decision recorded'),detail:t('Recorded outcome is not inferred from an AI report or opportunity stage.'),action:'decision'},
  ] as const;
  return <section className="panel case-workflow-overview" aria-label={t('Investment case command center')}>
    <div className="case-workflow-heading"><div><p className="eyebrow">{t('Analytical work')}</p><h2>{t('Case work at a glance')}</h2></div>{c.runs.length>0&&<button className="text-button" onClick={onHistory}>{t('Open saved Run history')} <ArrowUpRight size={14} aria-hidden="true"/></button>}</div>
    <dl className="workflow-indicators">{indicators.map(item=><div key={item.title}><dt>{t(item.title)}</dt><dd><button className="text-button" onClick={()=>onAction(item.action)}>{item.value}<ArrowUpRight size={13} aria-hidden="true"/></button><small>{item.detail}</small></dd></div>)}</dl>
    <div className="case-next-action"><div><p className="eyebrow">{t('Suggested next action')}</p><h3>{t(nextLabels[work.next])}</h3><p>{t(work.next==='decision'&&work.decision?'A human decision is recorded. You can inspect its history and revisit analysis or diligence without replacing earlier judgments.':reasons[work.next])}</p></div><button className="primary" disabled={busy} onClick={()=>onAction(work.next)}>{t(nextLabels[work.next])}<ArrowRight size={16} aria-hidden="true"/></button></div>
    <p className="workflow-boundary">{t('These indicators describe saved work, not verified completeness or approval. Work can be revisited in any order. PDFs are revalidated server-side.')}</p>
  </section>;
}
