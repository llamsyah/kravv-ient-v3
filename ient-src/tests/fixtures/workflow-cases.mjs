// Explicitly fictional UI/workflow fixtures; no generated provider response.
import {fixtureRun} from './analysis-reports.mjs';
export const workflowScenarios=['empty','pdf','unreviewed','reviewed','diligence','recommendation','decision','history'];
export function workflowCase(kind,createdAt='2026-10-28T00:00:00.000Z'){
 const id='QA45-'+kind,docId=id+'-pdf',c={id,companyId:'QA45-COMPANY',name:'Fictional '+kind+' opportunity',stage:'Screening',investmentStage:'Seed',owner:'Fictional investment analyst',thesis:'Fictional investment thesis; not independently verified.',strategy:'',roundSize:'',checkSize:'',valuation:'',source:'Fictional QA',lead:'',notes:'User-entered notes stay unchanged.',createdAt,docs:[],evidence:[],runs:[],questions:[],reviews:[],recommendations:[],decisions:[],activity:[]};
 if(kind!=='empty')c.docs.push({id:docId,name:kind+'-fictional.pdf',size:799,type:'Pitch Deck',source:'Fictional source material',createdAt,author:'QA',processing:'Stored · extraction not run'});
 if(!['empty','pdf'].includes(kind)){
  const run={...fixtureRun(),id:id+'-AI',createdAt,minimum:{inputVersion:'minimum-multi-pdf-v1',requestId:id+'-request',model:'gemini-3.5-flash-lite',modelVersion:'gemini-3.5-flash-lite',promptVersion:'minimum-pdf-text-v2',locale:'id-ID',documents:[{documentId:docId,originalFilename:kind+'-fictional.pdf',mimeType:'application/pdf',sizeBytes:799,order:1,sourceLabel:'SOURCE-1',storageEtag:'fictional-qa-version',source:{description:'Fictional source',documentType:'Pitch Deck',uploadedAt:createdAt,uploadedBy:'QA'}}]}};
  c.runs.push(run);
  if(!['unreviewed','history'].includes(kind))c.reviews.push({id:id+'-REVIEW',runId:run.id,outcome:'Disagree',rationale:'Fictional human review. This does not verify the AI claims.',author:'Fictional reviewer',createdAt});
 }
 if(kind==='diligence')c.questions.push({id:id+'-QUESTION',text:'Verify the reported revenue period.',category:'Traction',priority:'High',owner:'Fictional analyst',status:'Open',trigger:'',resolution:'',createdAt});
 if(['recommendation','decision'].includes(kind))c.recommendations.push({id:id+'-REC',outcome:'Advance',rationale:'Fictional analyst recommendation, not approval.',author:'Fictional analyst',createdAt});
 if(kind==='decision')c.decisions.push({id:id+'-DECISION',outcome:'More Diligence',rationale:'Fictional human decision; not investment approval.',author:'Fictional Partner',participants:'Fictional reviewers',createdAt});
 if(kind==='history')c.runs.unshift({id:id+'-RULES',name:'Historical simulation',createdAt,version:'rules-v1',simulated:true,assessment:'Simulated evidence review',evidence:[],findings:[]});
 return c;
}
