export const stages=['Sourced','Screening','Evaluation','Due Diligence','IC Review','Passed','Monitor','Invested'] as const;
export const evidenceStates=['Reported','Supported','Verified','Conflicting','Unknown'] as const;
export type EvidenceStatus=typeof evidenceStates[number];
export type Company={id:string;name:string;website:string;sector:string;geography:string};
export type Evidence={id:string;label:string;value:string;status:EvidenceStatus;kind:string;source:string;locator:string;documentId:string;excerpt:string;createdAt:string;author:string;resolution?:string};
export type Doc={id:string;name:string;type:string;source:string;size:number;createdAt:string;author:string;processing:string;sampleText?:string};
export type Question={id:string;text:string;category:string;priority:string;owner:string;status:string;trigger:string;resolution:string;createdAt:string};
export type Judgment={id:string;outcome:string;rationale:string;author:string;createdAt:string;participants?:string;runId?:string};
export type Finding={id:string;dimension:string;observation:string;interpretation:string;confidence:string;counterargument:string;evidenceIds:string[]};
export type Run={id:string;name:string;createdAt:string;version:string;assessment:string;evidence:Evidence[];findings:Finding[];simulated:boolean};
export type Event={id:string;createdAt:string;author:string;text:string};
export type Case={id:string;companyId:string;name:string;stage:string;investmentStage:string;owner:string;thesis:string;strategy:string;roundSize:string;checkSize:string;valuation:string;source:string;lead:string;notes:string;createdAt:string;docs:Doc[];evidence:Evidence[];runs:Run[];questions:Question[];reviews:Judgment[];recommendations:Judgment[];decisions:Judgment[];activity:Event[];portfolio?:{date:string;ownership:string;valuation:string;thesis:string;updates:{id:string;date:string;type:string;expected:string;actual:string;note:string;author:string}[]}};
export type WorkspaceState={revision:number;role:'Analyst'|'Partner'|'Admin';companies:Company[];cases:Case[]};
export const uid=()=>crypto.randomUUID();
export const timestamp=()=>new Date().toISOString();
export function addEvent(c:Case,text:string,author:string){c.activity.unshift({id:uid(),createdAt:timestamp(),author,text})}
export function analyze(c:Case,name:string):Run{
 const evidence=structuredClone(c.evidence);
 const findings:Finding[]=evidence.map(e=>({id:uid(),dimension:e.kind==='Financial metric'?'Financial health':'Evidence quality',observation:`${e.label}: ${e.value || 'Unknown'}`,interpretation:e.status==='Conflicting'?'Sources disagree. Reconcile definitions and reporting periods before relying on this value.':e.status==='Unknown'?'The available evidence does not establish this information.':e.status==='Reported'?'A source reports this value. Independent corroboration is still needed.':'This entry has supporting human-recorded evidence; assess its relevance to the thesis.',confidence:'Not calibrated · simulated',counterargument:e.status==='Verified'?'Verification does not establish future performance or thesis fit.':'Source completeness, definitions, and reporting period may affect the interpretation.',evidenceIds:[e.id]}));
 if(!findings.length)findings.push({id:uid(),dimension:'Evidence quality',observation:'No structured evidence has been recorded.',interpretation:'Insufficient evidence to assess this case. Add source-linked entries before analysis.',confidence:'Not assessed',counterargument:'Uploaded documents have not been automatically extracted.',evidenceIds:[]});
 return {id:uid(),name,createdAt:timestamp(),version:'rules-v1',assessment:evidence.some(e=>e.status==='Conflicting')?'Conflicting evidence':evidence.length?'Evidence review required':'Insufficient evidence',evidence,findings,simulated:true};
}
