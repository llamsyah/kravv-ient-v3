'use client';
import {useId,useMemo,useRef,useState} from 'react';
import type {Run} from '@/lib/model';
import {presentAnalysis, type ReportSectionKey} from '@/lib/analysis-presentation';
import ReportMarkdown from './report-markdown';
import {useI18n} from './localization';

const labels={summary:'Executive Summary',findings:'Key Findings',risks:'Risks and Counterarguments',unverified:'Unverified Information',diligence:'Due Diligence Questions',assessment:'Preliminary Assessment'} as const;

export default function PlaintextAnalysis({run}: {run: Run}) {
  const {t}=useI18n(),id=useId(),targets=useRef<Partial<Record<ReportSectionKey,HTMLElement|null>>>({});
  const [originalOpen,setOriginalOpen]=useState(false);
  const presentation=useMemo(()=>presentAnalysis(run),[run]);
  function focusSection(key: ReportSectionKey) {const element=targets.current[key];element?.scrollIntoView({block:'start'});element?.focus({preventScroll:true});}
  return <div className="plaintext-analysis">
    <p className="report-boundary">{t('AI analysis supports Human Review. It is not an approved investment decision or independent verification.')}</p>
    {presentation.kind==='sections'?<>
      <nav className="report-navigation" aria-label={t('Report sections')}>{presentation.sections.map(section=><button key={section.key} className="text-button" onClick={()=>focusSection(section.key)}>{t(labels[section.key])}</button>)}</nav>
      {presentation.preamble.trim()&&<div className="report-preamble"><ReportMarkdown source={presentation.preamble}/></div>}
      <div className="report-sections">{presentation.sections.map(section=><section key={section.key} id={`${id}-${section.key}`} ref={element=>{targets.current[section.key]=element}} tabIndex={-1} className={`report-section report-section-${section.key}`} aria-label={t(labels[section.key])}><ReportMarkdown source={section.source}/></section>)}</div>
    </>:<section className="report-full"><h2>{t('Analysis report')}</h2><p className="muted">{t('The complete saved report is shown. Sections are separated only when six original headings match unambiguously.')}</p>{presentation.original.trim()?<ReportMarkdown source={presentation.original}/>:<p>{t('No analysis text was recorded for this Run.')}</p>}</section>}
    <details className="report-original" onToggle={event=>setOriginalOpen(event.currentTarget.open)}><summary>{t('Full original report')}</summary><p className="muted">{t('Exact stored output, including its original Markdown. Presentation does not modify this Run.')}</p>{originalOpen&&<pre>{run.assessment}</pre>}</details>
  </div>;
}
