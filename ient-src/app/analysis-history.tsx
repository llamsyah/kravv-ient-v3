'use client';
import {useState,type ReactNode} from 'react';
import type {Case,Run} from '@/lib/model';
import {savedReports,comparisonReports,reportSources,reportPrompt} from '@/lib/report-history';
import {runProvenance} from '@/lib/analysis-presentation';
import {useI18n} from './localization';
import {Badge} from './ui';

export function ReportMetadata({c,run,sources=false}:{c:Case;run:Run;sources?:boolean}){
 const {t,dateTime,number}=useI18n(),provenance=runProvenance(run),documents=reportSources(run),prompt=reportPrompt(run),reviews=c.reviews.filter(r=>r.runId===run.id);
 return <dl className="history-metadata">
  <div><dt>{t('Created')}</dt><dd>{dateTime(run.createdAt)}</dd></div>
  <div><dt>{t('Analysis type')}</dt><dd>{run.simulated!==false?t('Simulated · PoC'):run.version.startsWith('gemini-text:')?t('Gemini · PDF text'):t('Gemini · Structured analysis')}</dd></div>
  <div><dt>{t('Model')}</dt><dd>{provenance.model||t('Model not recorded')}</dd></div>
  <div><dt>{t('Prompt version')}</dt><dd>{prompt||t('Not recorded')}</dd></div>
  <div><dt>{t('Source documents')}</dt><dd>{provenance.documentCount===undefined?t('Not recorded'):number(provenance.documentCount)}</dd></div>
  <div><dt>{t('Human Review')}</dt><dd>{reviews.length?t(reviews.length===1?'{count} review record':'{count} review records',{count:reviews.length}):t('Awaiting review')}</dd></div>
  {sources&&<div className="history-source-metadata"><dt>{t('Saved source provenance')}</dt><dd>{documents?<ul>{documents.map((doc,i)=><li key={`${doc.documentId}:${i}`}><b>{doc.originalFilename}</b><small>{doc.documentId}{'sourceLabel' in doc?' · '+String(doc.sourceLabel):''}</small><small>{t('Source version')}: {doc.storageEtag||t('Not recorded')}</small><small>{doc.source?.description} · {doc.source?.documentType} · {doc.source?.uploadedAt?dateTime(doc.source.uploadedAt):''}</small></li>)}</ul>:t('Document provenance is not recorded in this Run.')}</dd></div>}
 </dl>;
}

export function SavedReports({c,onOpen,onNew}:{c:Case;onOpen:(id:string)=>void;onNew:()=>void}){
 const {t,dateTime}=useI18n(),[filter,setFilter]=useState('all'),runs=savedReports(c).filter(r=>filter==='all'||(filter==='gemini'?r.simulated===false&&/^gemini(?:-text)?:/.test(r.version):r.simulated!==false));
 return <section className="saved-reports" aria-label={t('Saved Reports')}>
  <div className="history-heading"><div><h2>{t('Saved Reports')}</h2><p className="muted">{t('Original saved analyses for this Investment Case. Human Review remains linked to each Run.')}</p></div><button className="primary" onClick={onNew}>{t('New Analysis')}</button></div>
  {c.runs.length?<><label className="history-filter">{t('Filter reports')}<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{t('All Runs')}</option><option value="gemini">{t('Gemini Runs')}</option><option value="simulated">{t('Simulated Runs')}</option></select></label><ol className="history-list">{runs.map(run=><li key={run.id}><div className="history-item-heading"><div><small>{dateTime(run.createdAt)} · {run.id.slice(-8)}</small><h3>{run.name}</h3></div><Badge tone={run.simulated===false?'blue':''}>{run.simulated===false?t('Real Gemini'):t('Simulated · PoC')}</Badge></div><ReportMetadata c={c} run={run}/><button className="secondary" onClick={()=>onOpen(run.id)}>{t('Open Report')}</button></li>)}</ol>{!runs.length&&<p className="notice">{t('No reports match this filter.')}</p>}</>:<p className="notice">{t('No saved reports yet. Prepare a new analysis when your sources are ready.')}</p>}
 </section>;
}

export function CompareReports({c,onOpen,onSaved,onNew,renderReport}:{c:Case;onOpen:(id:string)=>void;onSaved:()=>void;onNew:()=>void;renderReport:(run:Run)=>ReactNode}){
 const {t,dateTime}=useI18n(),history=savedReports(c),[ids,setIds]=useState([history[0]?.id||'',history[1]?.id||'']),runs=comparisonReports(c,ids);
 return <section className="compare-reports" aria-label={t('Compare')}><h2>{t('Compare saved reports')}</h2><p className="muted">{t('Read two original reports and their saved metadata. No AI comparison, metric extraction or new generation is performed.')}</p>
  {history.length<2?<div className="notice"><p>{t('At least two saved reports in this Case are needed to compare.')}</p><div className="actions"><button className="secondary" onClick={onSaved}>{t('Saved Reports')}</button><button className="text-button" onClick={onNew}>{t('New Analysis')}</button></div></div>:<>
   <div className="compare-selectors">{[0,1].map(index=><label key={index}>{t(index===0?'First report':'Second report')}<select value={ids[index]} onChange={e=>setIds(previous=>previous.map((id,i)=>i===index?e.target.value:id))}>{history.map(run=><option key={run.id} value={run.id}>{run.name} · {dateTime(run.createdAt)} · {run.id.slice(-8)}</option>)}</select></label>)}</div>
   {!runs?<p className="notice" role="status">{t('Select two different reports from this Case.')}</p>:<div className="compare-columns">{runs.map((run,index)=><article key={`${index}:${run.id}`} aria-label={t(index===0?'First report':'Second report')}><header><h3>{run.name}</h3><p className="mono run-identifier">{run.id}</p><ReportMetadata c={c} run={run} sources/><button className="secondary" onClick={()=>onOpen(run.id)}>{t('Open Report')}</button></header>{renderReport(run)}</article>)}</div>}
  </>}
 </section>;
}
