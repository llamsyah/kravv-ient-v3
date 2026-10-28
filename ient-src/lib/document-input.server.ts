// Server entry point only: authentication and R2 access must never run in the client.
import {z} from 'zod';
import {identity, readState, bucket} from './storage';
import {PDF_INPUT_LIMITS} from './document-input';
import type {PdfDocumentMetadata, PdfInputSummary} from './document-input';

export type PreparedCasePdfInput = Omit<PdfInputSummary, 'documents'> & {
  documents: (PdfDocumentMetadata & {bytes: Uint8Array; storageEtag: string})[];
};

export class PdfInputError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = 'PdfInputError';
  }
}

const selectionSchema = z.object({
  caseId: z.string().min(1).max(200),
  documentIds: z.array(z.string().min(1).max(250)).min(1).max(PDF_INPUT_LIMITS.maxDocuments),
}).strict();

async function readPdfBytes(object: R2ObjectBody, filename: string): Promise<Uint8Array> {
  const bytes = new Uint8Array(object.size);
  const reader = object.body.getReader();
  let offset = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (offset + value.byteLength > bytes.length) {
        await reader.cancel().catch(() => {});
        throw new PdfInputError('DOCUMENT_CHANGED', `The stored size of ${filename} changed. Reload and try again.`, 409);
      }
      bytes.set(value, offset);
      offset += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  if (offset !== bytes.length) throw new PdfInputError('DOCUMENT_UNAVAILABLE', `${filename} could not be read completely. Please upload it again.`, 404);
  const decoder = new TextDecoder('ascii');
  const header = decoder.decode(bytes.subarray(0, 16));
  const tail = decoder.decode(bytes.subarray(Math.max(0, bytes.length - 1024)));
  // Envelope checks only, not parsing, decryption, OCR or a guarantee of model readability.
  if (!/^%PDF-(?:1\.[0-7]|2\.0)[\r\n\t ]/.test(header) || !/%%EOF[\t\r\n ]*$/.test(tail)) {
    throw new PdfInputError('INVALID_PDF', `${filename} does not have a supported PDF header and end marker. Upload the original PDF.`);
  }
  return bytes;
}

/** M3 must call this again in its authenticated request; browser readiness is not an authorization token. */
export async function prepareCasePdfInput(selection: unknown): Promise<PreparedCasePdfInput> {
  const user = await identity();
  const parsed = selectionSchema.safeParse(selection);
  if (!parsed.success) throw new PdfInputError('INVALID_SELECTION', `Select between 1 and ${PDF_INPUT_LIMITS.maxDocuments} documents from one investment case.`);
  const {caseId, documentIds} = parsed.data;
  if (new Set(documentIds).size !== documentIds.length) throw new PdfInputError('DUPLICATE_DOCUMENT', 'Select each PDF only once.');
  const state = await readState(user.userId);
  const investmentCase = state.cases.find(c => c.id === caseId);
  if (!investmentCase) throw new PdfInputError('CASE_NOT_FOUND', 'Investment case not found.', 404);

  // Resolve every ID against this case before reading any source bytes.
  const selected = documentIds.map(id => {
    const doc = investmentCase.docs.find(d => d.id === id);
    if (!doc) throw new PdfInputError('DOCUMENT_NOT_FOUND', 'A selected document was not found in this investment case. Reload the document list.', 404);
    if (doc.sampleText !== undefined || !/\.pdf$/i.test(doc.name)) throw new PdfInputError('INVALID_PDF', `${doc.name} is not an uploaded PDF. Select an original .pdf file.`);
    if (!Number.isSafeInteger(doc.size) || doc.size <= 0) throw new PdfInputError('EMPTY_PDF', `${doc.name} is empty or has invalid size metadata.`);
    if (doc.size > PDF_INPUT_LIMITS.maxDocumentBytes) throw new PdfInputError('DOCUMENT_TOO_LARGE', `${doc.name} exceeds the 10 MiB analysis input limit. The original upload remains available.`, 413);
    return doc;
  });
  const totalBytes = selected.reduce((sum, doc) => sum + doc.size, 0);
  if (totalBytes > PDF_INPUT_LIMITS.maxTotalBytes) throw new PdfInputError('INPUT_TOO_LARGE', 'Selected PDFs exceed the 12 MiB combined analysis input limit. Select fewer or smaller PDFs.', 413);

  const storage = bucket();
  const documents: PreparedCasePdfInput['documents'] = [];
  for (const doc of selected) {
    const object = await storage.get(`${user.userId}/${doc.id}`);
    if (!object) throw new PdfInputError('DOCUMENT_UNAVAILABLE', `${doc.name} is unavailable in document storage. Please upload it again.`, 404);
    if (object.size !== doc.size) {
      await object.body.cancel().catch(() => {});
      throw new PdfInputError('DOCUMENT_CHANGED', `The stored size of ${doc.name} changed. Reload and try again.`, 409);
    }
    const bytes = await readPdfBytes(object, doc.name);
    documents.push({
      documentId: doc.id, originalFilename: doc.name, mimeType: 'application/pdf', sizeBytes: bytes.byteLength,
      source: {description: doc.source, documentType: doc.type, uploadedAt: doc.createdAt, uploadedBy: doc.author},
      bytes, storageEtag: object.etag,
    });
  }
  return {version: 'case-pdf-input-v1', caseId, workspaceRevision: state.revision, totalBytes, documents};
}

/** Explicit projection: no byte arrays, storage keys or ETags leave this server module. */
export function summarizeCasePdfInput(input: PreparedCasePdfInput): PdfInputSummary {
  return {
    version: input.version, caseId: input.caseId, workspaceRevision: input.workspaceRevision, totalBytes: input.totalBytes,
    documents: input.documents.map(d => ({
      documentId: d.documentId, originalFilename: d.originalFilename, mimeType: d.mimeType,
      sizeBytes: d.sizeBytes, source: d.source,
    })),
  };
}
