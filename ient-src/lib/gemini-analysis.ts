import {z} from 'zod';
import type {Company} from './model';
import type {PdfDocumentMetadata} from './document-input';

export const GEMINI_PROMPT_VERSION = 'vc-pdf-v1';
const documentIds = z.array(z.string().min(1).max(250)).max(5);
const evidenceIds = z.array(z.string().min(1).max(250)).max(50);
export const geminiResultSchema = z.object({
  executiveSummary: z.string().min(1).max(4000), businessOverview: z.string().min(1).max(4000),
  findings: z.array(z.object({
    observation: z.string().min(1).max(1500), interpretation: z.string().min(1).max(2000),
    uncertainty: z.string().min(1).max(1000), counterargument: z.string().min(1).max(1200), documentIds, evidenceIds,
  }).strict()).min(1).max(10),
  risks: z.array(z.object({description: z.string().min(1).max(1500), uncertainty: z.string().min(1).max(1000), documentIds}).strict()).max(8),
  missingInformation: z.array(z.string().min(1).max(1000)).max(8),
  diligenceQuestions: z.array(z.object({question: z.string().min(1).max(1000), documentIds}).strict()).max(8),
}).strict();
export type GeminiResult = z.infer<typeof geminiResultSchema>;
export type GeminiProvenance = {
  workspaceRevision: number; company: Company; caseContext: Record<string, string>;
  documents: (PdfDocumentMetadata & {storageEtag: string})[]; evidenceIds: string[];
};
export type GeminiRunData = {
  requestId: string; model: string; modelVersion: string; promptVersion: string;
  input: GeminiProvenance; result: GeminiResult;
  usage?: {promptTokens?: number; outputTokens?: number; totalTokens?: number};
};
export type GeminiActionResult = {saved: boolean; runId?: string; error?: string; code?: string};
export class GeminiError extends Error {
  constructor(public code: string, message: string, public status = 400) {super(message); this.name = 'GeminiError';}
}
export function validateGeminiResult(value: unknown, sources: {documentIds: string[]; evidenceIds: string[]}): GeminiResult {
  const parsed = geminiResultSchema.safeParse(value);
  if (!parsed.success) throw new GeminiError('INVALID_RESPONSE', 'Gemini returned an incomplete or invalid analysis. No run was saved.', 502);
  const docs = new Set(sources.documentIds), evidence = new Set(sources.evidenceIds);
  const references = [...parsed.data.findings, ...parsed.data.risks, ...parsed.data.diligenceQuestions];
  if (references.some(item => item.documentIds.some(id => !docs.has(id))) || parsed.data.findings.some(f => f.evidenceIds.some(id => !evidence.has(id)))) {
    throw new GeminiError('INVALID_SOURCES', 'Gemini referenced sources that were not provided. No run was saved.', 502);
  }
  return parsed.data;
}
// Small JSON Schema subset; server Zod validation also enforces lengths and references.
export function geminiResponseSchema() {
  const text = {type: 'string'};
  const ids = (maxItems: number) => ({type: 'array', items: text, maxItems});
  const object = (properties: Record<string, unknown>) => ({type: 'object', properties, required: Object.keys(properties), additionalProperties: false});
  return object({
    executiveSummary: text, businessOverview: text,
    findings: {type: 'array', minItems: 1, maxItems: 10, items: object({observation: text, interpretation: text, uncertainty: text, counterargument: text, documentIds: ids(5), evidenceIds: ids(50)})},
    risks: {type: 'array', maxItems: 8, items: object({description: text, uncertainty: text, documentIds: ids(5)})},
    missingInformation: {type: 'array', maxItems: 8, items: text},
    diligenceQuestions: {type: 'array', maxItems: 8, items: object({question: text, documentIds: ids(5)})},
  });
}
