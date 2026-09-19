'use client';

import {useEffect,useRef,useState} from 'react';
import {ArrowRight, FileText} from 'lucide-react';
import type {Case,Company,Evidence} from '@/lib/model';
import {date} from './ui';
import {resolveDemoIntent,type AssistantIntent} from './assistant-intents';

type Props={c:Case;company:Company;onTab:(tab:string)=>void;onEvidence:(entry:Evidence)=>void};
type Turn={id:number;question:string;intent:AssistantIntent|null};
const fallback='Live intelligence is not connected yet. This prototype can currently summarize the case, surface critical unknowns, challenge the recorded thesis, or compare saved analysis runs.';

const starters:{id:AssistantIntent;label:string;prompt:string}[]=[
  {id:'summary',label:'Summarize this case',prompt:'Summarize the current investment case.'},
  {id:'unknowns',label:'Surface critical unknowns',prompt:'What remains unknown?'},
  {id:'challenge',label:'Challenge the thesis',prompt:'Challenge the current thesis.'},
  {id:'changes',label:'Compare analysis runs',prompt:'What changed since the previous analysis run?'},
];

function demoAnswer(c:Case,company:Company,intent:AssistantIntent){
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

function DemoResponse({c,company,intent,onTab,onEvidence}:Props&{intent:AssistantIntent|null}){
  if(!intent)return <article className="assistant-answer assistant-fallback"><div className="assistant-answer-label"><span>LOCAL DEMO RESPONSE</span><strong>No live model</strong></div><section><h3>Answer</h3><p>{fallback}</p></section></article>;
  const answer=demoAnswer(c,company,intent);
  const sources=c.docs.length;
  const latest=c.runs[0];
  const references=intent==='unknowns'||intent==='challenge'
    ? c.evidence.filter(e=>e.status==='Unknown'||e.status==='Conflicting').slice(0,3)
    : intent==='changes'
      ? latest?.evidence.slice(0,3)??[]
      : c.evidence.slice(0,3);
  return <article className="assistant-answer"><div className="assistant-answer-label"><span>LOCAL DEMO RESPONSE</span><strong>Recorded case fields · no model response</strong></div>
    <section><h3>Answer</h3><p>{answer.answer}</p></section>
    <section><h3>Evidence / basis</h3><p>Current case record: {c.evidence.length} structured evidence {c.evidence.length===1?'entry':'entries'}, {sources} source {sources===1?'document':'documents'}, {c.runs.length} saved analysis {c.runs.length===1?'run':'runs'}.</p>
      {references.length?<ul className="assistant-references">{references.map(entry=>{
        const document=c.docs.find(doc=>doc.id===entry.documentId);
        return <li key={entry.id}><button type="button" onClick={()=>onEvidence(entry)}><FileText size={16} aria-hidden="true"/><span><b>{entry.label}</b><small>{entry.status} · {document?.name||entry.source||'No document linked'}{entry.locator?` · ${entry.locator}`:''}</small></span><ArrowRight size={15} aria-hidden="true"/></button></li>;
      })}</ul>:<p className="assistant-no-references">No evidence references are recorded for this view. <button type="button" className="text-button" onClick={()=>onTab('Evidence')}>Open evidence</button></p>}
    </section>
    <section><h3>Limitation</h3><p>{answer.limitation}</p></section>
    <div className="assistant-suggestion"><small>Suggestion · not saved</small><p>{answer.suggestion}</p></div>
  </article>;
}

export default function AssistantWorkspace({c,company,onTab,onEvidence}:Props){
  const [draft,setDraft]=useState('');
  const [turns,setTurns]=useState<Turn[]>([]);
  const conversationRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{conversationRef.current?.scrollTo({top:conversationRef.current.scrollHeight,behavior:'smooth'})},[turns.length]);
  const unresolved=c.questions.filter(q=>q.status!=='Resolved').length;
  const sources=c.docs.length;
  const latest=c.runs[0];
  function sendMessage(value:string){
    const question=value.trim();
    if(!question)return;
    setTurns(previous=>[...previous,{id:(previous.at(-1)?.id??0)+1,question,intent:resolveDemoIntent(question)}]);
    setDraft('');
  }

  return <section className="case-assistant" aria-label="Investment Case Assistant demonstration">
    <header className="assistant-heading">
      <div><p className="assistant-kicker">CASE INTELLIGENCE INTERFACE</p><h2>Assistant</h2><p>{company.name} <span aria-hidden="true">/</span> {c.name}</p></div>
      <span className="assistant-prototype">UI PROTOTYPE · NO LIVE MODEL</span>
    </header>
    <p className="assistant-intro">Future responses will be grounded in this Investment Case, its recorded evidence, source references and saved analysis runs. Messages here stay in this browser view and receive only local demonstration responses.</p>
    <div className="assistant-grid">
      <div className="assistant-main">
        {!turns.length?<section className="assistant-welcome">
          <p className="assistant-kicker">START WITH THIS CASE</p>
          <h3>Explore the questions behind the decision.</h3>
          <p>Select an intent or write your own question. Replies use local demo behavior; nothing is sent or saved.</p>
          <div className="assistant-starters">{starters.map(item=><button key={item.id} type="button" onClick={()=>sendMessage(item.prompt)}>{item.label}<ArrowRight size={16} aria-hidden="true"/></button>)}</div>
        </section>:<div className="assistant-conversation" ref={conversationRef} aria-live="polite">
          <div className="assistant-exchange-top"><span className="assistant-kicker">LOCAL DEMO CONVERSATION</span><button type="button" className="text-button" onClick={()=>setTurns([])}>New local conversation</button></div>
          {turns.map(turn=><div className="assistant-turn" key={turn.id}>
            <div className="assistant-prompt"><small>YOU · LOCAL ONLY</small><p>{turn.question}</p></div>
            <DemoResponse c={c} company={company} intent={turn.intent} onTab={onTab} onEvidence={onEvidence}/>
          </div>)}
        </div>}
        <div className="assistant-composer"><label htmlFor="assistant-demo-composer">Ask about this case</label><textarea id="assistant-demo-composer" rows={2} value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();sendMessage(draft)}}} placeholder="Type a question about this case…"/><div><span>Live intelligence not connected · Enter to send · Shift+Enter for a new line</span><button type="button" disabled={!draft.trim()} onClick={()=>sendMessage(draft)}>Send</button></div></div>
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
