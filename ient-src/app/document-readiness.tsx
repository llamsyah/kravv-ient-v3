'use client';
import {useI18n} from './localization';

import {useState} from 'react';
import type {Doc} from '@/lib/model';
import {PDF_INPUT_LIMITS, pdfSelectionStatus} from '@/lib/document-input';
import type {PdfInputSummary} from '@/lib/document-input';

export default function DocumentReadiness({caseId, docs, disabled, onDocuments, selected, onSelectionChange, maxDocuments = PDF_INPUT_LIMITS.maxDocuments}: {caseId: string; docs: Doc[]; disabled: boolean; onDocuments: () => void; selected: string[]; onSelectionChange: (ids: string[]) => void; maxDocuments?: number}) {
 const {t,errorText,number}=useI18n();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{key: string; summary?: PdfInputSummary; error?: string} | null>(null);
  const pdfs = docs.filter(d => /\.pdf$/i.test(d.name) && d.sampleText === undefined);
  const selectionKey = JSON.stringify({caseId, selected, docs: docs.map(d => [d.id, d.name, d.size, d.source, d.type, d.createdAt, d.author, d.sampleText])});
  const currentResult = result?.key === selectionKey ? result : null;
  const selection = pdfSelectionStatus(docs, selected);
  async function check() {
    if (checking || disabled || selection.error) return;
    setChecking(true);
    setResult(null);
    try {
      const response = await fetch('/api/analysis/documents', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({caseId, documentIds: selected}),
      });
      const data = await response.json() as PdfInputSummary & {error?: string};
      if (!response.ok) throw new Error(data.error || 'Unable to check the selected PDFs.');
      setResult({key: selectionKey, summary: data});
    } catch (error) {
      setResult({key: selectionKey, error: error instanceof Error ? error.message : 'Unable to check the selected PDFs.'});
    } finally { setChecking(false); }
  }
  return <section className="pdf-readiness panel padded" aria-labelledby="pdf-readiness-title">
    <h3 id="pdf-readiness-title">{t("PDFs for Gemini analysis")}</h3>
    <p className="muted">{maxDocuments === 1 ? t("Select one original PDF from this case, up to 10 MiB.") : t('Select original PDFs from this case. Up to {count} files, 10 MiB each and 12 MiB combined.',{count:maxDocuments})} {t('Manual evidence is not required.')}</p>
    {pdfs.length ? <fieldset disabled={disabled || checking}>
      <legend>{t("Select case PDFs")}</legend>
      {pdfs.map(doc => <label key={doc.id} className="pdf-choice">
        <input type="checkbox" checked={selected.includes(doc.id)} disabled={!selected.includes(doc.id) && selected.length >= maxDocuments}
          onChange={event => onSelectionChange(event.target.checked ? [...new Set([...selected, doc.id])] : selected.filter(id => id !== doc.id))}/>
        <span><b>{doc.name}</b><small>{doc.source} · {number(doc.size < 1024*1024 ? doc.size / 1024 : doc.size / 1024 / 1024,{minimumFractionDigits:2,maximumFractionDigits:2})} {doc.size < 1024*1024 ? 'KiB':'MiB'}</small></span>
      </label>)}
    </fieldset> : <p className="muted">{t("No uploaded PDFs in this case. Other documents and sample excerpts remain available in Evidence.")}</p>}
    <p role="status">{t('{count} selected PDFs · {size} MiB combined',{count:number(selection.count),size:number(selection.totalBytes / 1024 / 1024,{minimumFractionDigits:2,maximumFractionDigits:2})})}</p>
    {selected.length > 0 && selection.error && <p role="alert" className="form-error">{errorText(selection.error)}</p>}
    <div className="actions"><button className="secondary" onClick={check} disabled={disabled || checking || Boolean(selection.error)}>{checking ? t("Checking PDFs…") : t("Check selected PDFs")}</button><button className="text-button" onClick={onDocuments}>{t("View / upload documents")}</button></div>
    {currentResult?.error && <p role="alert" className="form-error">{errorText(currentResult.error)}</p>}
    {currentResult?.summary && <p role="status">{currentResult.summary.documents.length} {t(currentResult.summary.documents.length===1?"PDF ready ·":"PDFs ready ·")} {number(currentResult.summary.totalBytes / 1024 / 1024,{minimumFractionDigits:2,maximumFractionDigits:2})} {t("MiB. Original files checked; no model was called.")}</p>}
    <small>{t("Checking PDFs does not call Gemini or create a run. Run Gemini analysis uses the selected originals and rechecks their access. The separate legacy simulation uses manual evidence.")}</small>
  </section>;
}
