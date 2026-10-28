'use client';
import {useI18n} from './localization';

import type {GeminiRunData} from '@/lib/gemini-analysis';

export default function GeminiResult({data, onDiligence}: {data: GeminiRunData; onDiligence: () => void}) {
 const {t}=useI18n();
  const sources = (ids: string[]) => ids.map(id => {
    const doc = data.input.documents.find(d => d.documentId === id);
    return doc ? <a key={id} className="source-link" href={'/api/documents?id=' + encodeURIComponent(id)}>{doc.originalFilename}</a> : null;
  });
  return <>
    <section className="panel padded"><h2>{t("Business overview")}</h2><p className="body-text">{data.result.businessOverview}</p></section>
    <div className="analysis-issues"><section><h2>{t("Potential business risks")}</h2>{data.result.risks.map((risk, i) => <article key={i}><p>{risk.description}</p><p className="muted">{t("Uncertainty:")} {risk.uncertainty}</p>{sources(risk.documentIds)}</article>)}{!data.result.risks.length&&<p>{t("No risks were returned for this bounded input; human review is still needed.")}</p>}</section><section><h2>{t("Missing information and uncertainty")}</h2><ul>{data.result.missingInformation.map((text, i) => <li key={i}>{text}</li>)}</ul>{!data.result.missingInformation.length&&<p>{t("No additional gaps were returned; this is not a completeness certification.")}</p>}</section></div>
    <section className="analysis-suggestions"><div className="section-heading"><h2>{t("Suggested due diligence")}</h2><button className="text-button" onClick={onDiligence}>{t("Open diligence workflow")}</button></div><p className="muted">{t("Suggestions are not saved diligence records or investment decisions.")}</p>{data.result.diligenceQuestions.map((item, i) => <article key={i}><div><h3>{item.question}</h3>{sources(item.documentIds)}</div></article>)}</section>
    <details className="panel padded"><summary>{t("Immutable analysis input and provider")}</summary><p>{data.modelVersion} {t("· prompt")} {data.promptVersion} {t("· request")} {data.requestId}</p><p>{t("Original workspace revision:")} {data.input.workspaceRevision}. {t("Company:")} {data.input.company.name}.</p><h3>{t("Selected source versions")}</h3>{data.input.documents.map(doc => <p key={doc.documentId}>{doc.originalFilename} · {doc.documentId}<br/>{doc.source.description} · {doc.sizeBytes} {t("bytes · ETag")} {doc.storageEtag}</p>)}<h3>{t("Case context at this run")}</h3><dl>{Object.entries(data.input.caseContext).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value || t("Not provided")}</dd></div>)}</dl></details>
  </>;
}
