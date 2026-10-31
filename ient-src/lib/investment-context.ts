import type {Case,Company} from './model';

export const INVESTMENT_CONTEXT_VERSION='investment-context-v1';
export const INVESTMENT_CONTEXT_CLASSIFICATION='analyst-recorded-not-verified';
export const CONTEXT_LIMITS={
 company:{name:200,sector:160,geography:160},
 investmentCase:{name:200,investmentStage:80,strategy:1200,thesis:4000,roundSize:200,checkSize:200,valuation:200},
} as const;
type CompanyValues=Partial<Record<keyof typeof CONTEXT_LIMITS.company,string>>;
type CaseValues=Partial<Record<keyof typeof CONTEXT_LIMITS.investmentCase,string>>;
export type InvestmentContextSnapshot={
 version:typeof INVESTMENT_CONTEXT_VERSION;
 classification:typeof INVESTMENT_CONTEXT_CLASSIFICATION;
 company:CompanyValues;investmentCase:CaseValues;analysisContext?:string;truncatedFields?:string[];
};
function normalize(value:string){return value.normalize('NFC').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,' ').trim();}
// Company/Case objects never leave this allowlist. Amounts remain literal text.
export function buildInvestmentContext(company:Company|undefined,investmentCase:Case,analysisContext?:string):InvestmentContextSnapshot{
 const snapshot:InvestmentContextSnapshot={version:INVESTMENT_CONTEXT_VERSION,classification:INVESTMENT_CONTEXT_CLASSIFICATION,company:{},investmentCase:{}},truncated:string[]=[];
 function take(value:unknown,max:number,path:string){if(typeof value!=='string')return undefined;const characters=Array.from(normalize(value));if(!characters.length)return undefined;if(characters.length>max)truncated.push(path);return characters.slice(0,max).join('').trimEnd();}
 for(const key of Object.keys(CONTEXT_LIMITS.company) as (keyof CompanyValues)[]){const value=take(company?.[key],CONTEXT_LIMITS.company[key],'company.'+key);if(value!==undefined)snapshot.company[key]=value;}
 for(const key of Object.keys(CONTEXT_LIMITS.investmentCase) as (keyof CaseValues)[]){const value=take(investmentCase[key],CONTEXT_LIMITS.investmentCase[key],'investmentCase.'+key);if(value!==undefined)snapshot.investmentCase[key]=value;}
 const context=take(analysisContext,200,'analysisContext');if(context!==undefined)snapshot.analysisContext=context;
 if(truncated.length)snapshot.truncatedFields=truncated;
 return snapshot;
}
function object(value:unknown):value is Record<string,unknown>{return Boolean(value&&typeof value==='object'&&!Array.isArray(value));}
export function isInvestmentContext(value:unknown):value is InvestmentContextSnapshot{
 if(!object(value)||value.version!==INVESTMENT_CONTEXT_VERSION||value.classification!==INVESTMENT_CONTEXT_CLASSIFICATION||Object.keys(value).some(k=>!['version','classification','company','investmentCase','analysisContext','truncatedFields'].includes(k)))return false;
 const text=(v:unknown,max:number)=>typeof v==='string'&&v.length>0&&Array.from(v).length<=max&&normalize(v)===v;
 for(const group of ['company','investmentCase'] as const){const fields=value[group],limits:Record<string,number>=CONTEXT_LIMITS[group];if(!object(fields)||Object.entries(fields).some(([key,v])=>!Object.hasOwn(limits,key)||!text(v,limits[key])))return false;}
 if(value.analysisContext!==undefined&&!text(value.analysisContext,200))return false;
 if(value.truncatedFields!==undefined){const allowed=['analysisContext',...Object.keys(CONTEXT_LIMITS.company).map(k=>'company.'+k),...Object.keys(CONTEXT_LIMITS.investmentCase).map(k=>'investmentCase.'+k)];if(!Array.isArray(value.truncatedFields)||!value.truncatedFields.length||value.truncatedFields.length>allowed.length||new Set(value.truncatedFields).size!==value.truncatedFields.length||value.truncatedFields.some(k=>typeof k!=='string'||!allowed.includes(k)))return false;
  for(const path of value.truncatedFields){const [group,key]=(path as string).split('.');if(key?!(value[group] as Record<string,unknown>)[key]:!value[group])return false;}
 }
 return true;
}
export function investmentContextPart(snapshot:InvestmentContextSnapshot){
 if(!isInvestmentContext(snapshot))throw new Error('Invalid investment context snapshot');
 // JSON quoting contains adversarial delimiters/newlines; no context string is
 // interpolated into the fixed analysis instruction or given an instruction role.
 return {text:JSON.stringify({kind:'analyst_recorded_investment_context',snapshot})};
}
