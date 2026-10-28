'use client';
import {useI18n} from './localization';

import type {ReactNode} from 'react';
import type {Evidence} from '@/lib/model';
import {evidenceStates} from '@/lib/model';
import {tone} from './ui';

export function PageHeader({title,description,actions}:{title:string;description:string;actions?:ReactNode}) {

  return <div className="page-heading workspace-page-heading"><div><h1>{title}</h1><p className="muted">{description}</p></div>{actions}</div>;
}

export function EvidenceSummary({entries,compact=false}:{entries:Evidence[];compact?:boolean}) {
 const {t,label}=useI18n();
  if(!entries.length)return <span className="muted">{t("No evidence recorded")}</span>;
  return <div className={compact?'evidence-summary compact':'evidence-summary'} aria-label={t("Recorded evidence statuses")}>
    {evidenceStates.map(status=>{const count=entries.filter(e=>e.status===status).length;return count?<span key={status} className={'evidence-total '+tone(status)}><span>{label(status)}</span><b>{count}</b></span>:null})}
  </div>;
}

export function EvidenceGuide() {
 const {t}=useI18n();
  return <details className="domain-note"><summary>{t("How evidence status is recorded")}</summary><p>{t("Reported captures a source claim. Supported indicates additional evidence; Verified indicates confirmation through a reliable source. Conflicting keeps disagreement visible, while Unknown marks missing information. These statuses are assigned by a person in this PoC.")}</p><p>{t('A claim may need several sources. The existing ledger records one primary document per entry; note additional references in the excerpt or locator. No multi-source verification is performed automatically.')}</p></details>;
}
