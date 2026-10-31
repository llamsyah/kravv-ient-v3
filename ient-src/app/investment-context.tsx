'use client';
import type {Run} from '@/lib/model';
import {isInvestmentContext,type InvestmentContextSnapshot} from '@/lib/investment-context';
import {useI18n} from './localization';

export function InvestmentContextPanel({snapshot,preview=false,onEdit}:{snapshot:InvestmentContextSnapshot;preview?:boolean;onEdit?:()=>void}){
 const {t}=useI18n();
 const fields=[
  ['Company name',snapshot.company.name],['Sector / industry',snapshot.company.sector],['Geography',snapshot.company.geography],
  ['Case name',snapshot.investmentCase.name],['Investment stage',snapshot.investmentCase.investmentStage],
  ['Recorded investment strategy for this Case',snapshot.investmentCase.strategy],['Investment thesis',snapshot.investmentCase.thesis],
  ['Round size',snapshot.investmentCase.roundSize],['Target check',snapshot.investmentCase.checkSize],['Valuation',snapshot.investmentCase.valuation],['Analysis context',snapshot.analysisContext],
 ] as const;
 const paths=['company.name','company.sector','company.geography','investmentCase.name','investmentCase.investmentStage','investmentCase.strategy','investmentCase.thesis','investmentCase.roundSize','investmentCase.checkSize','investmentCase.valuation','analysisContext'];
 const shortened=fields.filter((_,index)=>snapshot.truncatedFields?.includes(paths[index])).map(([label])=>t(label));
 const available=fields.filter(([,value])=>value!==undefined),missing=fields.filter(([,value])=>value===undefined);
 return <section className={`investment-context ${preview?'context-preview':'context-used'}`} aria-label={t(preview?'Investment Context':'Investment Context Used')}>
  <div className="context-heading"><h3>{t(preview?'Investment Context':'Investment Context Used')}</h3>{onEdit&&<button className="text-button" onClick={onEdit}>{t('Edit context')}</button>}</div>
  <p className="muted">{t('Analyst-recorded context and assumptions, not independently verified facts or an approved fund mandate.')}</p>
  {preview&&<p className="muted">{t('Selected PDFs provide source material; this context provides the evaluation perspective. Both are sent for a new request. AI does not approve investments.')}</p>}
  <details open={preview||undefined}><summary>{t('Inspect context fields')} · {snapshot.version}</summary><dl className="context-values" tabIndex={preview?0:undefined}>{available.map(([label,value])=><div key={label}><dt>{t(label)}</dt><dd>{value}</dd></div>)}</dl>
   {missing.length>0&&<p className="context-missing">{t('Not specified')}: {missing.map(([label])=>t(label)).join(' · ')}</p>}
   {snapshot.truncatedFields?.length&&<p className="notice">{t('Some context values were shortened to the analysis input limits. The saved snapshot records only the included text.')} <span className="mono">{shortened.join(' · ')}</span></p>}
  </details>
  {preview&&<small>{t('Rechecking an existing request preserves its original context. Current Case edits apply to a new request only.')}</small>}
 </section>;
}

export function InvestmentContextUsed({run}:{run:Run}){
 const {t}=useI18n(),snapshot=run.minimum?.investmentContext;
 if(run.simulated!==false)return <p className="context-absence muted">{t('Simulation does not use Gemini investment context.')}</p>;
 return isInvestmentContext(snapshot)?<InvestmentContextPanel snapshot={snapshot}/>:<section className="context-absence"><h3>{t('Investment context snapshot not recorded')}</h3><p className="muted">{t('This Run has no investment-context-v1 snapshot. Current Case values are not substituted.')}</p></section>;
}
