'use client';
import {useMemo} from 'react';
import type {Run,Judgment} from '@/lib/model';
import {preliminaryExcerpt,runProvenance} from '@/lib/analysis-presentation';
import {useI18n} from './localization';
import {Badge} from './ui';

export default function DecisionAnalysisReference({run,reviews,onOpen}: {run?:Run;reviews:Judgment[];onOpen:(run:Run)=>void}) {
  const {t,date}=useI18n(),excerpt=useMemo(()=>run?preliminaryExcerpt(run):undefined,[run]);
  const reviewed=Boolean(run&&reviews.some(review=>review.runId===run.id));
  return <section className="panel judgment ai decision-analysis-reference">
    <p className="eyebrow">{t('AI Analysis')}</p>
    {run?<><h3>{run.name}</h3><small>{date(run.createdAt)} · {runProvenance(run).model || run.version}</small><div className="actions"><Badge>{run.simulated!==false?t('Simulated · PoC'):t('Saved analysis')}</Badge><Badge>{reviewed?t('Human Review recorded'):t('Awaiting review')}</Badge></div>
      {excerpt?<><p className="decision-excerpt-label">{t('Excerpt from the saved preliminary assessment')}</p><blockquote>{excerpt}</blockquote></>:<p>{run.assessment.trim()?t('Saved analysis is available for Human Review.'):t('No analysis text was recorded for this Run.')}</p>}
      <p className="muted">{t('AI findings are supporting input. Recommendations and final decisions are recorded separately by people.')}</p><button className="text-button" onClick={()=>onOpen(run)}>{t('View complete analysis')}</button>
    </>:<p>{t('No saved analysis is available yet.')}</p>}
  </section>;
}
