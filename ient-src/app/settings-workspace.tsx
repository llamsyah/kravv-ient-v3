'use client';
import {useMemo, useState} from 'react';
import {ArrowUpRight, LogOut} from 'lucide-react';
import type {WorkspaceState} from '@/lib/model';
import {aggregateAiUsage, type TokenMetric, type UsagePeriod} from '@/lib/ai-usage';
import {minimumAiSettings as config} from '@/lib/settings-configuration';
import {LanguageSwitch, useI18n} from './localization';

export type SettingsIdentity = {name: string; email: string; local: boolean; workspaceId?: string; localAccess?: 'gate' | 'legacy'};
type Props = {state: WorkspaceState; user: SettingsIdentity; busy: boolean; onRole: (role: WorkspaceState['role']) => void; onOpenRun: (caseId: string, runId: string) => void};
const sections = ['General settings','AI usage','AI configuration','Security & access','System & about'] as const;

export default function SettingsWorkspace({state,user,busy,onRole,onOpenRun}: Props) {
  const {t,locale,number,dateTime} = useI18n();
  const [section,setSection] = useState<typeof sections[number]>('General settings');
  const [period,setPeriod] = useState<UsagePeriod>('all');
  const [nowMs] = useState(() => Date.now());
  const usage = useMemo(() => aggregateAiUsage(state.cases,{period,nowMs}),[state.cases,period,nowMs]);
  const auth = user.local ? user.localAccess === 'gate' ? 'KRAVV Access Gate · Local device session' : 'Legacy local identity · Compatibility access' : 'ChatGPT / Sites identity';
  const measured = (value?: number | bigint) => value === undefined ? t('Not reported') : new Intl.NumberFormat(locale).format(value);
  const coverage = (metric: TokenMetric) => t('{reported} of {runs} Runs reported',{reported:number(metric.reportedRuns),runs:number(usage.summary.generations)});
  const signOut = user.local ? <form method="post" action="/access/signout"><button className="secondary" type="submit"><LogOut size={15} aria-hidden="true"/>{t('Sign out')}</button></form> : <a className="secondary" href="/signout-with-chatgpt?return_to=%2F" target="_top"><LogOut size={15} aria-hidden="true"/>{t('Sign out')}</a>;
  return <div className="settings-center">
    <nav className="settings-navigation" aria-label={t('Settings sections')}>
      {sections.map(name => <button key={name} type="button" aria-current={section===name?'page':undefined} aria-controls="settings-content" onClick={() => setSection(name)}>{t(name)}</button>)}
    </nav>
    <div id="settings-content" className="settings-content" role="region" aria-label={t(section)}>
      {section==='General settings'&&<>
        <section className="panel settings-card"><p className="eyebrow">{t('General settings')}</p><h2>{t('Your workspace')}</h2>
          <dl className="settings-facts"><div><dt>{t('Signed-in identity')}</dt><dd>{user.name}</dd></div><div><dt>{t(user.localAccess==='gate'?'Workspace ID':user.local?'Legacy identity':'Hosted identity')}</dt><dd>{user.workspaceId || user.email || t('Not exposed')}</dd></div><div><dt>{t('Authentication method')}</dt><dd>{t(auth)}</dd></div><div><dt>{t('UI language')}</dt><dd><LanguageSwitch/><small>{t('Uses the shared language preference, saved in this browser for one year. Saved Run text stays unchanged.')}</small></dd></div></dl>
          <div className="settings-actions">{signOut}</div>
        </section>
        <section className="panel settings-card"><p className="eyebrow">{t('Prototype role')}</p><h2>{t('Explore the human workflow')}</h2><p className="muted">{t('The same signed-in owner can switch roles for demonstration. This is not a validated firm permission model.')}</p>
          <label className="settings-role">{t('Active role')}<select value={state.role} disabled={busy} onChange={e => onRole(e.target.value as WorkspaceState['role'])}>{(['Analyst','Partner','Admin'] as const).map(role => <option key={role} value={role}>{t(role)}</option>)}</select></label>
          <p className="muted">{t('Analyst: evidence, analysis, diligence, recommendations. Partner / Admin: also records final decisions and portfolio entry.')}</p>
        </section>
      </>}
      {section==='AI usage'&&<>
        <section className="settings-section-intro"><div><p className="eyebrow">{t('AI usage')}</p><h2>{t('Persisted AI activity')}</h2><p className="muted">{t('Only unique, non-simulated Gemini Saved Runs in this workspace are counted. Failed or unsaved requests and private journals are not included.')}</p></div>
          <label>{t('Timeframe')}<select value={period} onChange={e => setPeriod(e.target.value as UsagePeriod)}><option value="all">{t('All time')}</option><option value="30d">{t('Last 30 days')}</option></select></label>
        </section>
        <div className="settings-metrics" aria-label={t('Saved AI usage totals')}>
          <article className="panel"><span>{t('Saved AI generations')}</span><strong>{number(usage.summary.generations)}</strong><small>{t('Simulations are excluded.')}</small></article>
          {([['Input tokens','input'],['Output tokens','output'],['Provider total tokens','total']] as const).map(([title,key]) => <article className="panel" key={key}><span>{t(title)}</span><strong>{measured(usage.summary[key].value)}</strong><small>{coverage(usage.summary[key])}</small></article>)}
        </div>
        <p className="settings-note">{t('Token sums include only reported fields. Missing values are not zero. Provider total tokens are preserved independently of input plus output. These figures are not billing charges.')}</p>
        {period==='30d'&&<p className="settings-note">{t('The 30-day window uses Saved Run timestamps through the time this Settings view opened. Missing, invalid or future dates are excluded.')}</p>}
        <section className="panel settings-card"><h2>{t('Usage by model')}</h2>{usage.models.length?<div className="settings-table-wrap"><table><thead><tr><th>{t('Model')}</th><th>{t('Saved AI generations')}</th><th>{t('Input tokens')}</th><th>{t('Output tokens')}</th><th>{t('Provider total tokens')}</th></tr></thead><tbody>{usage.models.map(m => <tr key={m.model || 'unknown'}><th scope="row">{m.model || t('Unknown model')}</th><td>{number(m.generations)}</td>{(['input','output','total'] as const).map(k => <td key={k}>{measured(m[k].value)}<small>{t('{reported} of {runs} Runs reported',{reported:number(m[k].reportedRuns),runs:number(m.generations)})}</small></td>)}</tr>)}</tbody></table></div>:<p className="muted">{t('No eligible saved AI Runs in this timeframe. Legacy simulations remain in case history.')}</p>}</section>
        <section className="panel settings-card"><h2>{t('Recent AI Runs')}</h2><p className="muted">{t('Up to 10 unique saved Runs, newest first. Source counts come only from saved provenance.')}</p>{usage.recent.length?<div className="settings-table-wrap"><table><thead><tr><th>{t('Saved Run / date')}</th><th>{t('Investment Case')}</th><th>{t('Model')}</th><th>{t('PDFs')}</th><th>{t('Input / output / total')}</th></tr></thead><tbody>{usage.recent.map(r => <tr key={`${r.caseId}:${r.id}`}><td><button className="text-button settings-run-link" onClick={() => onOpenRun(r.caseId,r.id)}>{r.id}<ArrowUpRight size={14} aria-hidden="true"/></button><small>{r.createdAt?dateTime(r.createdAt):t('Date unavailable')}</small></td><td>{r.caseName}<small>{r.caseId}</small></td><td>{r.model || t('Unknown model')}</td><td>{r.documentCount===undefined?t('Not reported'):number(r.documentCount)}</td><td>{[measured(r.input),measured(r.output),measured(r.total)].join(' / ')}</td></tr>)}</tbody></table></div>:<p className="muted">{t('No eligible saved AI Runs in this timeframe. Legacy simulations remain in case history.')}</p>}</section>
      </>}
      {section==='AI configuration'&&<section className="panel settings-card"><p className="eyebrow">{t('Read-only configuration')}</p><h2>{t('Working Minimum AI flow')}</h2><dl className="settings-facts">
        <div><dt>{t('Model')}</dt><dd>{config.model}</dd></div><div><dt>{t('Prompt version')}</dt><dd>{config.promptVersion}</dd></div>
        <div><dt>{t('PDF analysis limits')}</dt><dd>{t('1–{count} PDFs · {each} MiB each · {total} MiB combined',{count:config.limits.maxDocuments,each:config.limits.maxDocumentBytes/1024/1024,total:config.limits.maxTotalBytes/1024/1024})}</dd></div>
        <div><dt>{t('Output token limit')}</dt><dd>{number(config.maxOutputTokens)}</dd></div><div><dt>{t('Provider timeout')}</dt><dd>{t('{seconds} seconds · shared deadline',{seconds:config.timeoutSeconds})}</dd></div><div><dt>{t('Supported output languages')}</dt><dd>{config.languages.join(' / ')}</dd></div>
      </dl><p className="settings-note">{t('Native inline PDF input and Markdown analysis; source provenance, Saved Run and Human Review. No automatic retries or model fallback. Manual Evidence is optional and is not sent by this Minimum AI flow.')}</p><p className="settings-note">{t('The preserved structured Gemini adapter is separate and uses server GEMINI_MODEL configuration. It is not the working Minimum AI action. API keys and account quota are not exposed here.')}</p></section>}
      {section==='Security & access'&&<section className="panel settings-card"><p className="eyebrow">{t('Security & access')}</p><h2>{t('Current access boundary')}</h2><dl className="settings-facts"><div><dt>{t('Authentication method')}</dt><dd>{t(auth)}</dd></div><div><dt>{t('Session status')}</dt><dd>{t('Authenticated workspace loaded')}</dd></div></dl>
        <p className="muted">{user.local?user.localAccess==='gate'?t('Local Access Gate uses a Workspace ID, hashed Access Phrase and Recovery Key, and signed HttpOnly device/session cookies. No secret or cookie value is shown here.'):t('Legacy access retains the earlier unverified name/email boundary. It is not upgraded to Access Gate by this screen.'):t('Hosted identity is supplied by ChatGPT / Sites. Hosted session lifetime and device details are not available to this application.')}</p>
        <p className="settings-note">{t('This screen confirms the last successful workspace load, not a live session monitor. Expiry and device management are not exposed. Signing out does not delete business records.')}</p>
        <p className="settings-note">{t('Prototype roles are demonstration controls, not firm administration. Credential rotation, MFA, device revocation and Access Gate hardening are deferred.')}</p><div className="settings-actions">{signOut}</div>
      </section>}
      {section==='System & about'&&<section className="panel settings-card"><p className="eyebrow">{t('System & about')}</p><h2>{t('KRAVV-IENT V3 · Functional AI Prototype')}</h2><dl className="settings-facts"><div><dt>{t('Application environment')}</dt><dd>{t(user.local?'Local development':'Deployment stage not exposed')}</dd></div><div><dt>{t('Runtime & storage')}</dt><dd>{t('Vinext · Cloudflare Workers · D1 / R2')}</dd></div></dl>
        <ul className="settings-boundaries"><li>{t('Company → Investment Case → PDFs → Gemini → Saved Run → Human Review. People record recommendations and final decisions separately.')}</li><li>{t('AI text is preserved as generated. Source labels are not verified page citations. Human Review adds a separate judgment without rewriting the Run.')}</li><li>{t('D1 stores owner-scoped workspace records. R2 stores original PDFs and private request journals. Selected PDFs are sent to Google Gemini when analysis is explicitly requested; opening Settings sends nothing to the provider.')}</li><li>{t('Local data and access credentials stay in separate ignored runtime folders. Git does not back them up or transfer them to another computer. Hosted storage is separate from local storage.')}</li><li>{t('Desktop prototype with responsive Settings. No collaborative firm tenancy, production security certification, independent financial verification, OCR, RAG or autonomous investment decisions.')}</li></ul>
      </section>}
    </div>
  </div>;
}
