'use client';

import {useState} from 'react';
import {ArrowRight, FileText} from 'lucide-react';
import type {Case,Company,Evidence} from '@/lib/model';
import {date} from './ui';

type Intent='summary'|'unknowns'|'challenge'|'changes';
type Props={c:Case;company:Company;onTab:(tab:string)=>void;onEvidence:(entry:Evidence)=>void};

const starters:{id:Intent;label:string;prompt:string}[]=[
  {id:'summary',label:'Summarize this case',prompt:'Summarize the current investment case.'},
  {id:'unknowns',label:'Surface critical unknowns',prompt:'What remains unknown?'},
  {id:'challenge',label:'Challenge the thesis',prompt:'Challenge the current thesis.'},
  {id:'changes',label:'Compare analysis runs',prompt:'What changed since the previous analysis run?'},
];

function demoAnswer(c:Case,company:Company,intent:Intent){
  const unresolved=c.questions.filter(q=>q.status!=='Resolved');
  const flagged=c.evidence.filter(e=>e.status==='Unknown'||e.status==='Conflicting');
  switch(intent){
    case 'summary': return {
      answer:<>{company.name} has an active Investment Case at the <b>{c.stage}</b> stage. {c.thesis?<>The recorded thesis is: “{c.thesis}”</>:'No thesis has been recorded.'}</>,
      limitation:'This repeats saved case fields. It does not assess thesis quality, verify a source, or make a recommendation.',
      suggestion:'Review the recorded evidence before forming a human recommendation.',
    };
    case 'unknowns': return {
      answer:<>{flagged.length} evidence {flagged.length===1?'entry is':'entries are'} marked Unknown or Conflicting, and {unresolved.length} diligence {unresolved.length===1?'question remains':'questions remain'} unresolved.</>,
      limitation:'Recorded status and question counts cannot establish which gaps are material or whether other unknowns exist.',
      suggestion:'Review open diligence and source coverage before assigning priority.',
    };
    case 'challenge': return {
      answer:<>{c.thesis?<>The recorded thesis is: “{c.thesis}”</>:'There is no recorded thesis to challenge yet.'} This preview places the thesis beside its recorded evidence; it does not generate a counterargument.</>,
      limitation:'A real challenge would require source review and human judgment. No claim here has been independently tested.',
      suggestion:'Look for conflicting statements and missing support before revising the thesis.',
    };
    case 'changes': return {
      answer:<>{c.runs.length>1?<>There are {c.runs.length} saved analysis runs. The latest is “{c.runs[0].name}”; the previous is “{c.runs[1].name}”.</>:c.runs.length===1?<>Only one analysis run, “{c.runs[0].name}”, is saved for this case.</>:'No analysis run has been saved for this case.'}</>,
      limitation:'This preview lists saved runs only. It has not compared findings or evidence snapshots.',
      suggestion:'Inspect both saved runs and their source references before interpreting a change.',
    };
  }
}

export default function AssistantWorkspace({c,company,onTab,onEvidence}:Props){
  const [intent,setIntent]=useState<Intent|null>(null);
  const selected=starters.find(item=>item.id===intent);
  const answer=intent?demoAnswer(c,company,intent):null;
  const unresolved=c.questions.filter(q=>q.status!=='Resolved').length;
  const sources=c.docs.length;
  const latest=c.runs[0];
  const references=intent==='unknowns'||intent==='challenge'
    ? c.evidence.filter(e=>e.status==='Unknown'||e.status==='Conflicting').slice(0,3)
    : intent==='changes'
      ? latest?.evidence.slice(0,3)??[]
      : c.evidence.slice(0,3);

  return <section className="case-assistant" aria-label="Investment Case Assistant demonstration">
    <header className="assistant-heading">
      <div><p className="assistant-kicker">CASE INTELLIGENCE INTERFACE</p><h2>Assistant</h2><p>{company.name} <span aria-hidden="true">/</span> {c.name}</p></div>
      <span className="assistant-prototype">UI PROTOTYPE · NO LIVE MODEL</span>
    </header>
    <p className="assistant-intro">Future responses will be grounded in this Investment Case, its recorded evidence, source references and saved analysis runs. This preview does not generate a live answer.</p>
    <div className="assistant-grid">
      <div className="assistant-main">
        {!selected?<section className="assistant-welcome">
          <p className="assistant-kicker">START WITH THIS CASE</p>
          <h3>Explore the questions behind the decision.</h3>
          <p>Select an intent to preview how a case-grounded answer could be organized. Nothing is sent or saved.</p>
          <div className="assistant-starters">{starters.map(item=><button key={item.id} type="button" onClick={()=>setIntent(item.id)}>{item.label}<ArrowRight size={16} aria-hidden="true"/></button>)}</div>
        </section>:<div className="assistant-conversation" aria-live="polite">
          <div className="assistant-exchange-top"><span className="assistant-kicker">DEMONSTRATION EXCHANGE</span><button type="button" className="text-button" onClick={()=>setIntent(null)}>Back to starter actions</button></div>
          <div className="assistant-prompt"><small>EXAMPLE QUESTION</small><p>{selected.prompt}</p></div>
          <article className="assistant-answer"><div className="assistant-answer-label"><span>ASSISTANT RESPONSE FORMAT</span><strong>Static UI example · no model response</strong></div>
            <section><h3>Answer</h3><p>{answer?.answer}</p></section>
            <section><h3>Evidence / basis</h3><p>Current case record: {c.evidence.length} structured evidence {c.evidence.length===1?'entry':'entries'}, {sources} source {sources===1?'document':'documents'}, {c.runs.length} saved analysis {c.runs.length===1?'run':'runs'}.</p>
              {references.length?<ul className="assistant-references">{references.map(entry=>{
                const document=c.docs.find(doc=>doc.id===entry.documentId);
                return <li key={entry.id}><button type="button" onClick={()=>onEvidence(entry)}><FileText size={16} aria-hidden="true"/><span><b>{entry.label}</b><small>{entry.status} · {document?.name||entry.source||'No document linked'}{entry.locator?` · ${entry.locator}`:''}</small></span><ArrowRight size={15} aria-hidden="true"/></button></li>;
              })}</ul>:<p className="assistant-no-references">No evidence references are recorded for this view. <button type="button" className="text-button" onClick={()=>onTab('Evidence')}>Open evidence</button></p>}
            </section>
            <section><h3>Limitation</h3><p>{answer?.limitation}</p></section>
            <div className="assistant-suggestion"><small>Suggestion · not saved</small><p>{answer?.suggestion}</p></div>
          </article>
        </div>}
        <div className="assistant-composer"><label htmlFor="assistant-demo-composer">Ask about this case</label><textarea id="assistant-demo-composer" disabled rows={2} placeholder="Live intelligence not connected"/><div><span>Live intelligence not connected · Preview only</span><button type="button" disabled>Send</button></div></div>
      </div>
      <aside className="assistant-inspector" aria-label="Current case context">
        <div className="assistant-inspector-head"><p className="assistant-kicker">GROUNDING INSPECTOR</p><h3>Current case context</h3><p>Saved records available in this workspace</p></div>
        <dl><div><dt>Investment Case</dt><dd>{c.name}<small>{c.id}</small></dd></div><div><dt>Company</dt><dd>{company.name}</dd></div><div><dt>Structured evidence</dt><dd>{c.evidence.length}</dd></div><div><dt>Source documents</dt><dd>{sources}</dd></div><div><dt>Latest analysis run</dt><dd>{latest?<>{latest.name}<small>{date(latest.createdAt)} · simulated</small></>:'None saved'}</dd></div><div><dt>Open diligence</dt><dd>{unresolved}</dd></div></dl>
        <div className="assistant-inspector-links"><button type="button" onClick={()=>onTab('Evidence')}>Inspect evidence <ArrowRight size={14}/></button><button type="button" onClick={()=>onTab('Analysis')}>View saved analysis <ArrowRight size={14}/></button><button type="button" onClick={()=>onTab('Diligence')}>Open diligence <ArrowRight size={14}/></button></div>
        <p className="assistant-boundary">Source material is separate from structured evidence. A saved analysis does not replace human judgment or a final decision.</p>
      </aside>
    </div>
  </section>;
}
