// Prototype input budgets, independent of the existing upload limit or provider limits.
export const PDF_INPUT_LIMITS = {
  maxDocuments: 5,
  maxDocumentBytes: 10 * 1024 * 1024,
  maxTotalBytes: 12 * 1024 * 1024,
} as const;

export type PdfSelection = {caseId: string; documentIds: string[]};

/** Browser feedback only; the authenticated server rechecks originals in R2. */
export function pdfSelectionStatus(docs: {id: string; name: string; size: number; sampleText?: string}[], selected: string[]) {
  const chosen = selected.map(id => docs.find(doc => doc.id === id));
  const totalBytes = chosen.reduce((sum, doc) => sum + (doc && Number.isSafeInteger(doc.size) && doc.size > 0 ? doc.size : 0), 0);
  let error: string | undefined;
  if (!selected.length || selected.length > PDF_INPUT_LIMITS.maxDocuments) error = 'Select between 1 and 5 documents from one investment case.';
  else if (new Set(selected).size !== selected.length) error = 'Select each PDF only once.';
  else if (chosen.some(doc => !doc)) error = 'A selected document was not found in this investment case. Reload the document list.';
  else {
    for (const doc of chosen) {
      if (!doc) continue;
      if (doc.sampleText !== undefined || !/\.pdf$/i.test(doc.name)) {error = `${doc.name} is not an uploaded PDF. Select an original .pdf file.`; break;}
      if (!Number.isSafeInteger(doc.size) || doc.size <= 0) {error = `${doc.name} is empty or has invalid size metadata.`; break;}
      if (doc.size > PDF_INPUT_LIMITS.maxDocumentBytes) {error = `${doc.name} exceeds the 10 MiB analysis input limit. The original upload remains available.`; break;}
    }
    if (!error && totalBytes > PDF_INPUT_LIMITS.maxTotalBytes) error = 'Selected PDFs exceed the 12 MiB combined analysis input limit. Select fewer or smaller PDFs.';
  }
  return {count: selected.length, totalBytes, error};
}
export type PdfDocumentMetadata = {
  documentId: string;
  originalFilename: string;
  mimeType: 'application/pdf';
  sizeBytes: number;
  source: {description: string; documentType: string; uploadedAt: string; uploadedBy: string};
};
export type PdfInputSummary = {
  version: 'case-pdf-input-v1';
  caseId: string;
  workspaceRevision: number;
  totalBytes: number;
  documents: PdfDocumentMetadata[];
};
