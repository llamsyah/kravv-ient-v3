'use client';
import {useI18n} from './localization';

import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,FileText,Loader2} from 'lucide-react';
import type {Case,Evidence,Run} from '@/lib/model';
import {analysisView,evidenceChanges} from '@/lib/analysis-view';
import {Badge,JudgmentCard,tone} from './ui';
import {EvidenceSummary} from './surface-ui';
import DocumentReadiness from './document-readiness';
import GeminiResult from './gemini-result';
import PlaintextAnalysis from './plaintext-analysis';
import {runProvenance} from '@/lib/analysis-presentation';
import type {Locale} from '@/lib/localization.mjs';
import {isLocale} from '@/lib/localization.mjs';
import type {GeminiActionResult} from '@/lib/gemini-analysis';
import {pdfSelectionStatus} from '@/lib/document-input';

export type AnalysisPreparation={documentIds:string[];context:string};
type Props={preparation?:AnalysisPreparation;onPreparation?:(value:AnalysisPreparation)=>void;c:Case;run?:Run;busy:boolean;showReadiness:boolean;onReadiness:(show:boolean)=>void;onSelectRun:(id:string)=>void;onRun:(context:string)=>Promise<boolean>;onGemini:(context:string,documentIds:string[],requestId:string,locale?:Locale)=>Promise<GeminiActionResult>;onEvidence:(e:Evidence)=>void;onReview:(run:Run)=>void;onQuestion:(run:Run,e:Evidence,text:string)=>void;onTab:(tab:string)=>void};
const contexts=['Initial Screening','Post-Founder-Meeting','Due Diligence','Pre-IC'];
const requestStorageKey=(caseId:string)=>`kravv-gemini-text-request:${caseId}`;
const steps=['Preparing evidence snapshot','Reviewing recorded statuses','Preserving conflicts and unknowns','Building simulated findings','Confirming saved analysis run'];

export function EvidenceChangeNotice({c,run,onReview,onRun}:{c:Case;run?:Run;onReview:()=>void;onRun:()=>void}) {
 const {t}=useI18n();
  if(!run)return null;
  const changes=evidenceChanges(c.evidence,run.evidence);
  if(!changes.added&&!changes.changed&&!changes.removed)return null;
  return <aside className="analysis-change"><div><b>{t("Current evidence differs from this run")}</b><p>{[changes.added?t('{count} added',{count:changes.added}):null,changes.changed?t('{count} changed',{count:changes.changed}):null,changes.removed?t('{count} no longer present',{count:changes.removed}):null].filter(Boolean).join(' · ')}{t('. The saved snapshot remains unchanged.')}</p></div><div className="actions"><button className="text-button" onClick={onReview}>{t("Review current evidence")}</button><button className="secondary" onClick={onRun}>{t("Prepare new analysis")}</button></div></aside>;
}

export default function AnalysisWorkspace(p:Props) {
 const {t,label,errorText,date,dateTime,number,locale}=useI18n();
  const [context,setContext]=useState(p.preparation?.context || (contexts.includes(p.c.runs[0]?.name)?p.c.runs[0].name:contexts[0]));
  const [processing,setProcessing]=useState(false),[step,setStep]=useState(0),[failure,setFailure]=useState('');
  const [inputCount,setInputCount]=useState(0);
  const [documentIds,setDocumentIds]=useState<string[]>(p.preparation?.documentIds||[]),[geminiProcessing,setGeminiProcessing]=useState(false),[retryRequest,setRetryRequest]=useState(false);
  const [pendingLocale,setPendingLocale]=useState<Locale>('id-ID');
  const pendingRequest=useRef<{key:string;selection:string;id:string;locale?:Locale}|null>(null);
  const running=useRef(false),mounted=useRef(true);
  const pdfSelection=pdfSelectionStatus(p.c.docs,documentIds);
  const suggestionQuestion=(e:Evidence)=>t(e.status==='Conflicting'?'What explains the conflicting source statements for {name}?':e.status==='Unknown'?'What source information would establish {name}?':'What independent evidence can corroborate {name}?',{name:e.label});
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
  function rememberSelection(ids:string[],nextContext=context) {setDocumentIds(ids);setContext(nextContext);setFailure('');setRetryRequest(false);p.onPreparation?.({documentIds:[...ids],context:nextContext})}
  useEffect(()=>{if(!processing)return;const timer=setInterval(()=>setStep(s=>Math.min(s+1,steps.length-1)),650);return()=>clearInterval(timer)},[processing]);
  async function start() {
    if(running.current||p.busy)return;
    running.current=true;setFailure('');setInputCount(p.c.evidence.length);setStep(0);setProcessing(true);
    try {
      // Saving starts immediately. The short sequence illustrates the deterministic
      // PoC flow; it is not a background AI job or a report of server progress.
      const [saved]=await Promise.all([p.onRun(context),new Promise(resolve=>setTimeout(resolve,2900))]);
      if(!mounted.current)return;
      if(saved){p.onSelectRun('');p.onReadiness(false)}
      else setFailure('The run could not be confirmed. Reload the workspace to check saved history before retrying.');
    }catch{if(mounted.current)setFailure('The run could not be confirmed. Reload the workspace before retrying.')}
    finally{running.current=false;if(mounted.current)setProcessing(false)}
  }
  async function startGemini() {
    if(running.current||p.busy||pdfSelection.error)return;
    const selection=JSON.stringify({context,documentIds}),key=JSON.stringify({context,documentIds,locale});
    if(pendingRequest.current?.selection!==selection){
      let recovered:typeof pendingRequest.current=null;
      try{const value=JSON.parse(sessionStorage.getItem(requestStorageKey(p.c.id))||'null');if((value?.selection||value?.key)===selection&&typeof value.id==='string'&&(value.locale===undefined||isLocale(value.locale)))recovered={...value,selection}}catch{}
      pendingRequest.current=recovered||{key,selection,id:crypto.randomUUID(),locale};
    }
    // Persist only opaque request identity, never PDF bytes or analysis content.
    try{sessionStorage.setItem(requestStorageKey(p.c.id),JSON.stringify(pendingRequest.current))}catch{}
    const requestId=pendingRequest.current.id;
    setPendingLocale(pendingRequest.current.locale || 'id-ID');
    running.current=true;setFailure('');setGeminiProcessing(true);
    try{
      const outcome=await p.onGemini(context,documentIds,requestId,pendingRequest.current.locale);
      if(!mounted.current)return;
      if(outcome.saved){pendingRequest.current=null;try{sessionStorage.removeItem(requestStorageKey(p.c.id))}catch{}setRetryRequest(false);p.onSelectRun('');p.onReadiness(false)}
      else{
        setFailure(outcome.error||'The Gemini run could not be confirmed.');
        const preserve=['REVISION_CONFLICT','REQUEST_IN_PROGRESS','REQUEST_UNCERTAIN','SAVE_UNCERTAIN'].includes(outcome.code||'');
        setRetryRequest(preserve);if(!preserve){pendingRequest.current=null;try{sessionStorage.removeItem(requestStorageKey(p.c.id))}catch{}}
      }
    }finally{running.current=false;if(mounted.current)setGeminiProcessing(false)}
  }
  if(geminiProcessing)return <section className="analysis-processing" aria-busy="true" aria-label={t("Gemini analysis processing")}><div className="analysis-kicker">{t("Gemini · Provider request")}</div><h2>{t("Analyzing selected PDFs")}</h2><p>{label(context)} · {number(documentIds.length)} {t("PDFs · manual evidence is optional")}</p><p role="status"><Loader2 className="execution-spinner" size={18}/> {t("Waiting for the model response and confirmed save.")}</p><small>{t("This is an actual provider request, not simulated stages. The provider deadline is 90 seconds. No automatic retries are performed. If the response is uncertain, retry the same request before starting a new one.")}</small></section>;
  if(processing)return <section className="analysis-processing" aria-busy="true" aria-label={t("Analysis processing")}>
    <div className="analysis-kicker">{t("Simulated · PoC")}</div><h2>{t("Reviewing the evidence snapshot")}</h2><p className="analysis-intro">{t('{context} · {count} recorded evidence entries',{context:label(context),count:inputCount})}</p>
    <ol className="execution-steps">{steps.map((label,i)=><li key={label} className={i<step?'done':i===step?'current':''}><span>{i<step?<Check size={18}/>:i===step?<Loader2 className="execution-spinner" size={18}/>:String(i+1).padStart(2,'0')}</span>{t(label as Parameters<typeof t>[0])}</li>)}</ol>
    <p role="status" aria-live="polite">{label(steps[step])}</p><small>{t("This sequence illustrates the PoC flow. The saved run, rather than these animation stages, is the durable record. Uploaded files are not extracted.")}</small>
  </section>;
  if(p.showReadiness||!p.run)return <section className="analysis-readiness">
    <div className="analysis-kicker">{t("Analysis readiness")} <span>{t("Gemini PDFs · legacy simulation optional")}</span></div>
    <h2>{p.c.evidence.length?t("A snapshot of what is known."):t("Start with what is available.")}</h2>
    <p className="analysis-intro">{t("Gemini reads 1–5 original PDFs together and saves one text analysis. Manual evidence remains available for review and the separate legacy simulation.")}</p>
    <div className="readiness-counts"><div><b>{p.c.docs.length}</b><span>{t("Source documents")}</span></div><div><b>{p.c.evidence.length}</b><span>{t("Evidence entries")}</span></div><div><b>{p.c.evidence.filter(e=>['Supported','Verified'].includes(e.status)).length}</b><span>{t("Supported or verified")}</span></div><div><b>{p.c.evidence.filter(e=>e.status==='Conflicting').length}</b><span>{t("Conflicting")}</span></div><div><b>{p.c.evidence.filter(e=>e.status==='Unknown').length}</b><span>{t("Unknown")}</span></div></div>
    {!p.c.evidence.length?<div className="notice"><b>{t("No structured evidence yet.")}</b> {t("Gemini can analyze selected PDFs directly. Only the legacy evidence simulation reports insufficient evidence without manual entries.")}</div>:<EvidenceSummary entries={p.c.evidence}/>}
    <DocumentReadiness caseId={p.c.id} docs={p.c.docs} selected={documentIds} onSelectionChange={ids=>rememberSelection(ids)} disabled={p.busy} onDocuments={()=>p.onTab('Evidence')}/>
    <div className="readiness-inputs"><div><h3>{t("What this run will use")}</h3><p>{t("This flow reads the selected PDFs together and saves the original model text and source versions. Manual evidence and case notes are not sent in this request.")}</p><button className="text-button" onClick={()=>p.onTab('Evidence')}>{t("Review sources and evidence")} <ArrowRight size={14}/></button></div><div><label>{t("Analysis context")}<select value={context} onChange={e=>rememberSelection(documentIds,e.target.value)}>{contexts.map(name=><option key={name} value={name}>{label(name)}</option>)}</select></label><button className="primary" onClick={startGemini} disabled={p.busy||Boolean(pdfSelection.error)}>{retryRequest?t("Retry same PDF request"):t("Run Gemini PDF analysis")} <ArrowRight size={16}/></button><button className="secondary" onClick={start} disabled={p.busy}>{t("Run legacy simulation")}</button>{retryRequest&&<button className="text-button" onClick={()=>{pendingRequest.current=null;try{sessionStorage.removeItem(requestStorageKey(p.c.id))}catch{}setRetryRequest(false);setFailure('A new request is selected. Running again may make another provider call.')}}>{t("Start a new request instead")}</button>}{p.run&&<button className="text-button return-result" onClick={()=>p.onReadiness(false)}>{t("Return to saved result")}</button>}</div></div>
    {retryRequest&&<p className="notice">{t('Pending request language: {language}. Rechecking preserves its original language.',{language:pendingLocale==='en-US'?'English':'Indonesia'})}</p>}
    {failure&&<p className="form-error" role="alert">{errorText(failure)}</p>}
  </section>;
  const run=p.run,view=analysisView(run),reviews=p.c.reviews.filter(r=>r.runId===run.id),plainText=run.version.startsWith('gemini-text:'),provenance=runProvenance(run);
  const evidenceList=(entries:Evidence[],empty:string)=><>{entries.length?<div className="analysis-evidence-list">{entries.map(e=><button key={e.id} onClick={()=>p.onEvidence(e)}><span><b>{e.label}</b><span>{e.value}</span><small>{e.source}{e.locator?` · ${e.locator}`:''}</small></span><Badge tone={tone(e.status)}>{label(e.status)}</Badge></button>)}</div>:<p className="muted">{label(empty)}</p>}</>;
  return <div className="analysis-result">
    <header className="analysis-run-header"><div><div className="analysis-kicker">{t("Saved analysis")} <Badge tone="blue">{run.simulated!==false?t("Simulated · PoC"):plainText?t("Gemini · PDF text"):t("Gemini · Structured analysis")}</Badge>{p.c.runs[0]?.id===run.id&&<span>{t("Latest run")}</span>}</div><h2>{run.name}</h2><p className="mono run-identifier">{run.id}</p><p className="muted">{dateTime(run.createdAt)} · {run.evidence.length} {t("evidence entries ·")} {plainText?t("Plaintext PDF analysis"):t('{count} referenced documents',{count:run.gemini?.input.documents.length??view.documentCount})}</p><dl className="run-provenance"><div><dt>{t('Execution')}</dt><dd>{run.simulated!==false?run.version:provenance.model?('Gemini · '+provenance.model):t('Model not recorded')}</dd></div><div><dt>{t('Source documents')}</dt><dd>{provenance.documentCount!==undefined?t('{count} documents in the saved input',{count:provenance.documentCount}):plainText?t('Document provenance is not recorded in this Run.'):t('{count} referenced documents',{count:view.documentCount})}</dd></div><div><dt>{t('Status')}</dt><dd>{t('Saved analysis')}</dd></div></dl></div><div className="run-controls"><label>{t("Analysis run")}<select value={run.id} onChange={e=>p.onSelectRun(e.target.value)}>{p.c.runs.map((r,i)=><option key={r.id} value={r.id}>{i===0?t("Latest · "):''}{r.name} · {date(r.createdAt)} · {r.id.slice(0,8)}</option>)}</select></label><button className="secondary" disabled={p.busy} onClick={()=>p.onReadiness(true)}>{t("Prepare new analysis")}</button></div></header>
    {plainText&&run.minimum&&<section className="run-source-list" aria-label={t('Analyzed source documents')}><h3>{t('Analyzed source documents')}</h3><ol>{run.minimum.documents.map(doc=><li key={doc.documentId}><b>{doc.originalFilename}</b><small>{doc.sourceLabel} · {number(doc.sizeBytes<1024*1024?doc.sizeBytes/1024:doc.sizeBytes/1024/1024,{minimumFractionDigits:2,maximumFractionDigits:2})} {doc.sizeBytes<1024*1024?'KiB':'MiB'}{' · '}{doc.documentId}</small></li>)}</ol><small>{t('Saved source snapshot · {language} · {version}',{language:run.minimum.locale,version:run.minimum.promptVersion})}</small></section>}
    <EvidenceChangeNotice c={p.c} run={run} onReview={()=>p.onTab('Evidence')} onRun={()=>p.onReadiness(true)}/>
    {plainText?<>
      <div className="run-review-rail"><div><span>{t('Human Review')}</span><b>{reviews.length?t(reviews.length===1?'{count} review record':'{count} review records',{count:reviews.length}):t('Awaiting review')}</b></div><button className="secondary" onClick={()=>p.onReview(run)}>{t('Review analysis')}</button></div>
      <PlaintextAnalysis key={run.id} run={run}/>
    </>:<>
    <section className="analysis-synthesis"><div><p className="eyebrow">{t("Executive synthesis")}</p><h3>{run.assessment}</h3><p>{run.gemini?run.gemini.result.executiveSummary:run.evidence.length?t('This snapshot contains {supported} supported or verified entries, {reported} reported claims, {conflicting} conflicts and {unknown} unknowns.',{supported:view.supported.length,reported:view.reported.length,conflicting:view.conflicting.length,unknown:view.unknown.length}):t("No structured evidence was available for this run. There is no factual basis for an investment assessment.")}</p><p className="muted">{run.gemini?t("Model interpretation is not independent verification or a final investment decision. "):''}{view.conflicting.length?t("Conflicting source statements require reconciliation. "):''}{view.unknown.length?t("Missing information limits the assessment. "):''}{t("These are recorded evidence states, not a verdict on company quality or investment fit.")}</p></div><aside><p className="eyebrow">{t("Human judgment")}</p><b>{reviews.length?t(reviews.length===1?'{count} review record':'{count} review records',{count:reviews.length}):t("Awaiting review")}</b><p>{t("The saved assessment is one input. Your review is recorded separately.")}</p><button className="primary" onClick={()=>p.onReview(run)}>{t("Review analysis")}</button></aside></section>
    </>}
    {!plainText&&<>
    <section className="analysis-findings"><div className="section-heading"><h2>{t("Key findings")}</h2><small>{run.findings.length} {t("saved findings ·")} {run.version}</small></div>{run.findings.map((f,i)=><details className="analysis-finding" key={f.id} open={i===0||undefined}><summary><span className="finding-number mono">{String(i+1).padStart(2,'0')}</span><span><small>{f.dimension}</small><b>{f.observation}</b></span></summary><div className="finding-body"><div><p className="eyebrow">{t("Interpretation")}{run.simulated!==false?t(" · simulated"):' · Gemini'}</p><p>{f.interpretation}</p><p className="eyebrow">{t("Uncertainty / limitation")}</p><p>{f.counterargument}</p><small>{f.confidence}</small></div><div><p className="eyebrow">{t("Evidence at this run")}</p>{f.evidenceIds.map(id=>{const e=run.evidence.find(e=>e.id===id);return e?<button className="source-link" key={id} onClick={()=>p.onEvidence(e)}><FileText size={15}/>{e.label}<ArrowRight size={14}/></button>:<p className="muted" key={id}>{t('Evidence reference unavailable: {id}',{id})}</p>})}{(f.documentIds||[]).map(id=>{const doc=run.gemini?.input.documents.find(d=>d.documentId===id);return doc?<a className="source-link" key={id} href={'/api/documents?id='+encodeURIComponent(id)}><FileText size={15}/>{doc.originalFilename}</a>:null})}{!f.evidenceIds.length&&!f.documentIds?.length&&<p className="muted">{t("No supporting entries in this snapshot.")}</p>}</div></div></details>)}</section>
    </>}
    {run.gemini&&<GeminiResult data={run.gemini} onDiligence={()=>p.onTab('Diligence')}/>}
    {run.simulated!==false&&<><div className="analysis-tensions"><section><h2>{t("Why this could win")}</h2><p className="muted">{t("A stronger factual basis for human assessment. Supporting evidence alone does not establish future performance or thesis fit.")}</p>{evidenceList(view.supported,'No supported or verified entries are present in this snapshot.')}</section><section><h2>{t("Why this could fail")}</h2><p className="muted">{t("Saved counterarguments challenge reliance on the current evidence; this is not an exhaustive business-risk assessment.")}</p><ul>{[...new Set(run.findings.map(f=>f.counterargument))].map(text=><li key={text}>{text}</li>)}</ul>{view.reported.length>0&&<p className="notice">{t('{count} entries remain reported claims in this snapshot.',{count:view.reported.length})}</p>}</section></div>
    <div className="analysis-issues"><section><div className="section-heading"><h2>{t("Contradictions")}</h2><span className="count">{view.conflicting.length}</span></div>{evidenceList(view.conflicting,'No entries were marked Conflicting. This does not establish that all sources agree.')}</section><section><div className="section-heading"><h2>{t("Critical unknowns")}</h2><span className="count">{view.unknown.length}</span></div><p className="muted">{t("Recorded gaps requiring human assessment of materiality.")}</p>{evidenceList(view.unknown,'No entries were marked Unknown. Missing information may still exist outside this snapshot.')}</section></div>
    <section className="analysis-suggestions"><div className="section-heading"><div><h2>{t("Diligence priorities")}</h2><p className="muted">{t("Suggested follow-ups from evidence status. No priority ranking or workflow records are assigned automatically.")}</p></div><button className="text-button" onClick={()=>p.onTab('Diligence')}>{t("View recorded diligence")} <ArrowRight size={15}/></button></div>{view.suggestions.map(s=><article key={s.evidence.id}><div><small>{t("Suggested ·")} {label(s.evidence.status)}</small><h3>{suggestionQuestion(s.evidence)}</h3><p>{label(s.reason)}</p><button className="text-button" onClick={()=>p.onEvidence(s.evidence)}>{t('Inspect {name}',{name:s.evidence.label})}</button></div><button className="secondary" onClick={()=>p.onQuestion(run,s.evidence,suggestionQuestion(s.evidence))}>{t("Create diligence question")}</button></article>)}{!view.suggestions.length&&<p className="muted">{t("No status-based suggestions for this snapshot. Human diligence may still be needed.")}</p>}</section>
    </>}
    <section className="analysis-review"><div className="section-heading"><h2>{t("Human review of this run")}</h2><button className="secondary" onClick={()=>p.onReview(run)}>{t("Add human review")}</button></div>{reviews.map(r=><JudgmentCard key={r.id} title={t("Human review")} value={r}/>)}{!reviews.length&&<p className="muted">{t("No human review recorded for this run.")}</p>}<div className="review-handoff"><p>{t("Review, recommendation and final decision remain distinct historical records.")}</p><button className="primary" onClick={()=>p.onTab('Decision')}>{t("Continue to recommendation / decision")} <ArrowRight size={15}/></button></div></section>
  </div>;
}
