import type {Case,Run,WorkspaceState} from './model';

export type AnalysisDestination='saved'|'new'|'compare'|'report';
export type AnalysisLocation={caseId:string;destination:AnalysisDestination;runId?:string};
export function savedReports(c:Case):Run[]{
  // Sort a copy only; retain saved ordering for equal or unavailable timestamps.
  return c.runs.map((run,index)=>({run,index,time:Date.parse(run.createdAt)})).sort((a,b)=>
    (Number.isFinite(b.time)?b.time:-Infinity)-(Number.isFinite(a.time)?a.time:-Infinity)||a.index-b.index
  ).map(item=>item.run);
}
export function analysisLocation(c:Case,location?:AnalysisLocation|null):AnalysisLocation{
  if(location?.caseId===c.id)return location;
  return {caseId:c.id,destination:c.runs.length?'saved':'new'};
}
export function selectedReport(c:Case,location:AnalysisLocation):Run|undefined{
  return location.caseId===c.id&&location.destination==='report'?c.runs.find(r=>r.id===location.runId):undefined;
}
export function comparisonReports(c:Case,ids:readonly string[]):Run[]|undefined{
  if(ids.length!==2||ids[0]===ids[1])return undefined;
  const runs=ids.map(id=>c.runs.find(r=>r.id===id));
  return runs.every((run):run is Run=>Boolean(run))?runs:undefined;
}
export function analysisHash(location:AnalysisLocation):string{
  return `case/${encodeURIComponent(location.caseId)}/Analysis/${location.destination}${location.destination==='report'&&location.runId?'/'+encodeURIComponent(location.runId):''}`;
}
export function parseAnalysisHash(hash:string):AnalysisLocation|null{
  const parts=hash.replace(/^#/,'').split('/');
  if(parts[0]!=='case'||parts[2]!=='Analysis'||!['saved','new','compare','report'].includes(parts[3]))return null;
  try{return {caseId:decodeURIComponent(parts[1]),destination:parts[3] as AnalysisDestination,...(parts[3]==='report'?{runId:decodeURIComponent(parts[4]||'')}:{})}}catch{return null}
}
// Success is only shown for an exact ID confirmed in the returned saved Case.
export function confirmedReport(state:WorkspaceState,caseId:string,runId:unknown):Run|undefined{
  return typeof runId==='string'?state.cases.find(c=>c.id===caseId)?.runs.find(r=>r.id===runId):undefined;
}
export function reportSources(run:Run){return run.minimum?.documents??run.gemini?.input.documents;}
export function reportPrompt(run:Run){return run.minimum?.promptVersion??run.gemini?.promptVersion;}
