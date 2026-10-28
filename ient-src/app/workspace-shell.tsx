'use client';
import {useI18n,LanguageSwitch} from './localization';

import type {ReactNode, RefObject} from 'react';
import {LayoutDashboard, Layers, Building2, Briefcase, Files, Settings, Search, ChevronRight} from 'lucide-react';
import {investmentRoles} from '@/lib/case-workflow';
import type {WorkspaceState} from '@/lib/model';

const destinations = [['Dashboard', LayoutDashboard], ['Deal Flow', Layers], ['Companies', Building2], ['Portfolio', Briefcase], ['Documents', Files], ['Settings', Settings]] as const;
export const caseTabs = ['Overview', 'Evidence', 'Analysis', 'Diligence', 'Decision', 'Activity'];

type ShellProps = {
  children: ReactNode;
  area: string;
  company?: string;
  caseId?: string;
  activeCases: number;
  userName: string;
  role: WorkspaceState['role'];
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  onSearch: (value: string) => void;
  onNavigate: (area: string) => void;
};

export function TopContextBar({area, company, caseId, role, query, searchRef, onSearch}: Pick<ShellProps, 'area' | 'company' | 'caseId' | 'role' | 'query' | 'searchRef' | 'onSearch'>) {
 const {t,label}=useI18n();
  return <header className="context-bar">
    <div className="context-path" aria-label={t("Current workspace context")}>
      <span className="context-workspace">{t("Internal investment workspace")}</span>
      <ChevronRight size={14} aria-hidden="true"/>
      <span className="context-area">{label(area)}</span>
      {company && <><ChevronRight size={14} aria-hidden="true"/><span className="context-company">{company}</span></>}
      {caseId && <span className="context-case-id mono">{caseId}</span>}
    </div>
    <div className="shell-search">
      <Search size={17} aria-hidden="true"/>
      <input ref={searchRef} aria-label={t("Search workspace")} placeholder={t("Search workspace…")} value={query} onChange={event => onSearch(event.target.value)}/>
      <kbd title={t("Command or Control + K")}>⌘ / Ctrl K</kbd>
    </div><span className="shell-role-demo" title={t('Role demonstration only; this does not change the signed-in operator or create employee permissions.')}>{t(investmentRoles[role])} · {t('Role demo')}</span><LanguageSwitch/>
  </header>;
}

export function GlobalBottomRail({area, activeCases, userName, role, onNavigate}: Pick<ShellProps, 'area' | 'activeCases' | 'userName' | 'role' | 'onNavigate'>) {
 const {t,label}=useI18n();
  return <div className="global-bottom-rail">
    <div className="rail-identity"><span className="rail-mark" aria-hidden="true">K</span><span><strong>KRAVV-IENT</strong><small>{t("Venture Capital · Internal")}</small></span></div>
    <nav className="global-navigation" aria-label={t("Global navigation")}>
      {destinations.map(([name, Icon]) => <button key={name} type="button" className="global-nav-item" aria-current={area === name ? 'page' : undefined} onClick={() => onNavigate(name)}>
        <Icon size={18} strokeWidth={1.7} aria-hidden="true"/><span>{label(name)}</span>{name === 'Deal Flow' && <span className="rail-count">{activeCases}</span>}
      </button>)}
    </nav>
    <button type="button" className="rail-profile" onClick={() => onNavigate('Settings')} aria-label={t('{name}, {role} prototype role. Open profile settings',{name:userName,role:t(investmentRoles[role])})}>
      <span className="avatar">{userName.slice(0, 2).toUpperCase()}</span><span className="rail-profile-text"><span>{userName}</span><small>{t('{role} · prototype role',{role:t(investmentRoles[role])})}</small></span>
    </button>
  </div>;
}

export function WorkspaceShell(props: ShellProps) {

  return <div className="workstation-shell">
    <TopContextBar {...props}/>
    <main className="content workstation-content">{props.children}</main>
    <GlobalBottomRail {...props}/>
  </div>;
}

export function CaseTabs({selected, openQuestions, onSelect}: {selected: string; openQuestions: number; onSelect: (tab: string) => void}) {
 const {t,label}=useI18n();
  return <div className="tabs" role="tablist" aria-label={t("Investment case navigation")}>
    {caseTabs.map(tab => <button key={tab} role="tab" aria-selected={selected === tab} onClick={() => onSelect(tab)} className={selected === tab ? 'selected' : ''}>
      {label(tab)}{tab === 'Diligence' && openQuestions > 0 && <span className="count">{openQuestions}</span>}
    </button>)}
  </div>;
}
