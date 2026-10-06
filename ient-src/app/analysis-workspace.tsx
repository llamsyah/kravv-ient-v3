'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,FileText,Loader2} from 'lucide-react';
import type {Case,Evidence,Run} from '@/lib/model';
import {analysisView,evidenceChanges} from '@/lib/analysis-view';
import {Badge,JudgmentCard,date,tone} from './ui';
import {EvidenceSummary} from './surface-ui';

type Props={c:Case;run?:Run;busy:boolean;showReadiness:boolean;onReadiness:(show:boolean)=>void;onSelectRun:(id:string)=>void;onRun:(context:string)=>Promise<boolean>;onEvidence:(e:Evidence)=>void;onReview:(run:Run)=>void;onQuestion:(run:Run,e:Evidence,text:string)=>void;onTab:(tab:string)=>void};
const contexts=['Initial Screening','Post-Founder-Meeting','Due Diligence','Pre-IC'];
const steps=['Preparing evidence snapshot','Reviewing recorded statuses','Preserving conflicts and unknowns','Building simulated findings','Confirming saved analysis run'];

export function EvidenceChangeNotice({c,run,onReview,onRun}:{c:Case;run?:Run;onReview:()=>void;onRun:()=>void}) {
  if(!run)return null;
  const changes=evidenceChanges(c.evidence,run.evidence);
  if(!changes.added&&!changes.changed&&!changes.removed)return null;
  return <aside className="analysis-change"><div><b>Current evidence differs from this run</b><p>{[changes.added?`${changes.added} added`:null,changes.changed?`${changes.changed} changed`:null,changes.removed?`${changes.removed} no longer present`:null].filter(Boolean).join(' · ')}. The saved snapshot remains unchanged.</p></div><div className="actions"><button className="text-button" onClick={onReview}>Review current evidence</button><button className="secondary" onClick={onRun}>Prepare new analysis</button></div></aside>;
}

export default function AnalysisWorkspace(p:Props) {
  const [context,setContext]=useState(contexts.includes(p.c.runs[0]?.name)?p.c.runs[0].name:contexts[0]);
  const [processing,setProcessing]=useState(false),[step,setStep]=useState(0),[failure,setFailure]=useState('');
  const [inputCount,setInputCount]=useState(0);
  const running=useRef(false),mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
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
  if(processing)return <section className="analysis-processing" aria-busy="true" aria-label="Analysis processing">
    <div className="analysis-kicker">Simulated · PoC</div><h2>Reviewing the evidence snapshot</h2><p className="analysis-intro">{context} · {inputCount} recorded evidence {inputCount===1?'entry':'entries'}</p>
    <ol className="execution-steps">{steps.map((label,i)=><li key={label} className={i<step?'done':i===step?'current':''}><span>{i<step?<Check size={18}/>:i===step?<Loader2 className="execution-spinner" size={18}/>:String(i+1).padStart(2,'0')}</span>{label}</li>)}</ol>
    <p role="status" aria-live="polite">{steps[step]}</p><small>This sequence illustrates the PoC flow. The saved run, rather than these animation stages, is the durable record. Uploaded files are not extracted.</small>
  </section>;
  if(p.showReadiness||!p.run)return <section className="analysis-readiness">
    <div className="analysis-kicker">Analysis readiness <span>Simulated · PoC</span></div>
    <h2>{p.c.evidence.length?'A snapshot of what is known.':'Start with what is available.'}</h2>
    <p className="analysis-intro">Analysis reviews structured evidence recorded in this case. Source documents remain reference material; uploading a file does not extract or verify its contents.</p>
    <div className="readiness-counts"><div><b>{p.c.docs.length}</b><span>Source documents</span></div><div><b>{p.c.evidence.length}</b><span>Evidence entries</span></div><div><b>{p.c.evidence.filter(e=>['Supported','Verified'].includes(e.status)).length}</b><span>Supported or verified</span></div><div><b>{p.c.evidence.filter(e=>e.status==='Conflicting').length}</b><span>Conflicting</span></div><div><b>{p.c.evidence.filter(e=>e.status==='Unknown').length}</b><span>Unknown</span></div></div>
    {!p.c.evidence.length?<div className="notice"><b>No structured evidence yet.</b> A run can still be saved, but it will report insufficient evidence. No investment conclusion can be drawn from document count alone.</div>:<EvidenceSummary entries={p.c.evidence}/>}
    <div className="readiness-inputs"><div><h3>What this run will use</h3><p>The current evidence values, statuses, source references and excerpts will be saved together. Later edits will not rewrite this run.</p><button className="text-button" onClick={()=>p.onTab('Evidence')}>Review sources and evidence <ArrowRight size={15}/></button></div><div><label>Analysis context<select value={context} onChange={e=>setContext(e.target.value)}>{contexts.map(name=><option key={name}>{name}</option>)}</select></label><button className="primary" onClick={start} disabled={p.busy}>Run analysis <ArrowRight size={16}/></button>{p.run&&<button className="text-button return-result" onClick={()=>p.onReadiness(false)}>Return to saved result</button>}</div></div>
    {failure&&<p className="form-error" role="alert">{failure}</p>}
  </section>;
  const run=p.run,view=analysisView(run),reviews=p.c.reviews.filter(r=>r.runId===run.id);
  const evidenceList=(entries:Evidence[],empty:string)=><>{entries.length?<div className="analysis-evidence-list">{entries.map(e=><button key={e.id} onClick={()=>p.onEvidence(e)}><span><b>{e.label}</b><span>{e.value}</span><small>{e.source}{e.locator?` · ${e.locator}`:''}</small></span><Badge tone={tone(e.status)}>{e.status}</Badge></button>)}</div>:<p className="muted">{empty}</p>}</>;
  return <div className="analysis-result">
    <header className="analysis-run-header"><div><div className="analysis-kicker">Saved analysis <Badge tone="blue">Simulated · PoC</Badge>{p.c.runs[0]?.id===run.id&&<span>Latest run</span>}</div><h2>{run.name}</h2><p className="mono run-identifier">{run.id}</p><p className="muted">{new Date(run.createdAt).toLocaleString()} · {run.evidence.length} evidence entries · {view.documentCount} referenced documents</p></div><div className="run-controls"><label>Analysis run<select value={run.id} onChange={e=>p.onSelectRun(e.target.value)}>{p.c.runs.map((r,i)=><option key={r.id} value={r.id}>{i===0?'Latest · ':''}{r.name} · {date(r.createdAt)} · {r.id.slice(0,8)}</option>)}</select></label><button className="secondary" disabled={p.busy} onClick={()=>p.onReadiness(true)}>Prepare new analysis</button></div></header>
    <EvidenceChangeNotice c={p.c} run={run} onReview={()=>p.onTab('Evidence')} onRun={()=>p.onReadiness(true)}/>
    <section className="analysis-synthesis"><div><p className="eyebrow">Executive synthesis</p><h3>{run.assessment}</h3><p>{run.evidence.length?`This snapshot contains ${view.supported.length} supported or verified entries, ${view.reported.length} reported claims, ${view.conflicting.length} conflicts and ${view.unknown.length} unknowns.`:'No structured evidence was available for this run. There is no factual basis for an investment assessment.'}</p><p className="muted">{view.conflicting.length?'Conflicting source statements require reconciliation. ':''}{view.unknown.length?'Missing information limits the assessment. ':''}These are recorded evidence states, not a verdict on company quality or investment fit.</p></div><aside><p className="eyebrow">Human judgment</p><b>{reviews.length?`${reviews.length} review ${reviews.length===1?'record':'records'}`:'Awaiting review'}</b><p>The saved assessment is one input. Your review is recorded separately.</p><button className="primary" onClick={()=>p.onReview(run)}>Review analysis</button></aside></section>
    <section className="analysis-findings"><div className="section-heading"><h2>Key findings</h2><small>{run.findings.length} saved findings · {run.version}</small></div>{run.findings.map((f,i)=><details className="analysis-finding" key={f.id} open={i===0||undefined}><summary><span className="finding-number mono">{String(i+1).padStart(2,'0')}</span><span><small>{f.dimension}</small><b>{f.observation}</b></span></summary><div className="finding-body"><div><p className="eyebrow">Interpretation · simulated</p><p>{f.interpretation}</p><p className="eyebrow">Uncertainty / limitation</p><p>{f.counterargument}</p><small>{f.confidence}</small></div><div><p className="eyebrow">Evidence at this run</p>{f.evidenceIds.map(id=>{const e=run.evidence.find(e=>e.id===id);return e?<button className="source-link" key={id} onClick={()=>p.onEvidence(e)}><FileText size={15}/>{e.label}<ArrowRight size={14}/></button>:<p className="muted" key={id}>Evidence reference unavailable: {id}</p>})}{!f.evidenceIds.length&&<p className="muted">No supporting entries in this snapshot.</p>}</div></div></details>)}</section>
    <div className="analysis-tensions"><section><h2>Why this could win</h2><p className="muted">A stronger factual basis for human assessment. Supporting evidence alone does not establish future performance or thesis fit.</p>{evidenceList(view.supported,'No supported or verified entries are present in this snapshot.')}</section><section><h2>Why this could fail</h2><p className="muted">Saved counterarguments challenge reliance on the current evidence; this is not an exhaustive business-risk assessment.</p><ul>{[...new Set(run.findings.map(f=>f.counterargument))].map(text=><li key={text}>{text}</li>)}</ul>{view.reported.length>0&&<p className="notice">{view.reported.length} {view.reported.length===1?'entry remains a reported claim':'entries remain reported claims'} in this snapshot.</p>}</section></div>
    <div className="analysis-issues"><section><div className="section-heading"><h2>Contradictions</h2><span className="count">{view.conflicting.length}</span></div>{evidenceList(view.conflicting,'No entries were marked Conflicting. This does not establish that all sources agree.')}</section><section><div className="section-heading"><h2>Critical unknowns</h2><span className="count">{view.unknown.length}</span></div><p className="muted">Recorded gaps requiring human assessment of materiality.</p>{evidenceList(view.unknown,'No entries were marked Unknown. Missing information may still exist outside this snapshot.')}</section></div>
    <section className="analysis-suggestions"><div className="section-heading"><div><h2>Diligence priorities</h2><p className="muted">Suggested follow-ups from evidence status. No priority ranking or workflow records are assigned automatically.</p></div><button className="text-button" onClick={()=>p.onTab('Diligence')}>View recorded diligence <ArrowRight size={15}/></button></div>{view.suggestions.map(s=><article key={s.evidence.id}><div><small>Suggested · {s.evidence.status}</small><h3>{s.question}</h3><p>{s.reason}</p><button className="text-button" onClick={()=>p.onEvidence(s.evidence)}>Inspect {s.evidence.label}</button></div><button className="secondary" onClick={()=>p.onQuestion(run,s.evidence,s.question)}>Create diligence question</button></article>)}{!view.suggestions.length&&<p className="muted">No status-based suggestions for this snapshot. Human diligence may still be needed.</p>}</section>
    <section className="analysis-review"><div className="section-heading"><h2>Human review of this run</h2><button className="secondary" onClick={()=>p.onReview(run)}>Add human review</button></div>{reviews.map(r=><JudgmentCard key={r.id} title="Human review" value={r}/>)}{!reviews.length&&<p className="muted">No human review recorded for this run.</p>}<div className="review-handoff"><p>Review, recommendation and final decision remain distinct historical records.</p><button className="primary" onClick={()=>p.onTab('Decision')}>Continue to recommendation / decision <ArrowRight size={15}/></button></div></section>
  </div>;
}
