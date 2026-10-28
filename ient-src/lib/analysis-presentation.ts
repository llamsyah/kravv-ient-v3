import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type {Run} from './model';

export const REPORT_SECTIONS = ['summary','findings','risks','unverified','diligence','assessment'] as const;
export type ReportSectionKey = typeof REPORT_SECTIONS[number];
export type ReportSection = {key: ReportSectionKey; source: string; body: string};
export type ReportPresentation = {kind: 'full'; original: string} | {kind: 'sections'; original: string; preamble: string; sections: ReportSection[]};
type Node = {type: string; depth?: number; value?: string; children?: Node[]; position?: {start: {offset?: number}; end: {offset?: number}}};
const parser = unified().use(remarkParse).use(remarkGfm);
const names: Record<ReportSectionKey, readonly string[]> = {
  summary: ['ringkasan eksekutif','executive summary'],
  findings: ['temuan utama','key findings'],
  risks: ['risiko dan kontra-argumen','risiko dan kontra argumen','risks and counterarguments','risks and counter-arguments'],
  unverified: ['informasi yang belum terverifikasi','unverified information'],
  diligence: ['pertanyaan due diligence','due diligence questions'],
  assessment: ['kesimpulan sementara','preliminary assessment','provisional conclusion'],
};

// Read text only from ordinary inline content. HTML, images, and opaque nodes
// cannot become section identifiers or an inferred Decision excerpt.
function inlineText(node: Node): string | undefined {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (!['heading','paragraph','strong','emphasis','delete','link'].includes(node.type) || !node.children) return undefined;
  const values = node.children.map(inlineText);
  return values.some(v => v === undefined) ? undefined : values.join('');
}
function heading(node: Node) {
  const boldHeading = node.type === 'paragraph' && node.children?.length === 1 && node.children[0].type === 'strong';
  if (node.type !== 'heading' && !boldHeading) return undefined;
  const text = inlineText(node);
  if (!text || /[\r\n]/.test(text)) return undefined;
  const normalized = text.normalize('NFKC').trim().replace(/:$/, '').toLowerCase().replace(/\s*&\s*/g,' and ').replace(/\s+/g,' ');
  const numbered = /^(\d+)[.)]\s+(.+)$/.exec(normalized), label = numbered?.[2] || normalized;
  const key = REPORT_SECTIONS.find(key => names[key].includes(label));
  return key ? {key, number: numbered ? Number(numbered[1]) : undefined, depth: node.depth || 3} : undefined;
}
function hasSharedReferences(node: Node): boolean {
  return ['definition','linkReference','imageReference','footnoteDefinition','footnoteReference'].includes(node.type) || Boolean(node.children?.some(hasSharedReferences));
}
export function isMinimumTextRun(run: Run) {return run.simulated === false && run.version.startsWith('gemini-text:');}

export function presentAnalysis(run: Pick<Run,'assessment'|'version'>): ReportPresentation {
  const original = run.assessment, fallback: ReportPresentation = {kind: 'full', original};
  if (!run.version.startsWith('gemini-text:') || !run.version.endsWith(':minimum-pdf-text-v2')) return fallback;
  try {
    const root = parser.parse(original) as unknown as Node;
    // Reference definitions may be shared across sections. Rendering their
    // fragments independently would lose that context, so keep one full report.
    if (hasSharedReferences(root)) return fallback;
    const children = root.children || [], matches = children.flatMap((node,index) => {const match=heading(node);return match ? [{...match,node,index}] : [];});
    if (matches.length !== REPORT_SECTIONS.length || matches.some((m,i) => m.key !== REPORT_SECTIONS[i] || (m.number !== undefined && m.number !== i+1) || m.depth !== matches[0].depth)) return fallback;
    const firstIndex = matches[0].index;
    if (children.slice(firstIndex).some(node => node.type === 'heading' && (node.depth || 1) <= matches[0].depth && !heading(node))) return fallback;
    const sections: ReportSection[] = [];
    for (const [i,match] of matches.entries()) {
      const start=match.node.position?.start.offset, bodyStart=match.node.position?.end.offset, end=matches[i+1]?.node.position?.start.offset ?? original.length;
      if (start === undefined || bodyStart === undefined || end < bodyStart) return fallback;
      const source=original.slice(start,end), body=original.slice(bodyStart,end);
      if (!body.trim()) return fallback;
      sections.push({key:match.key,source,body});
    }
    const preamble=original.slice(0,matches[0].node.position!.start.offset);
    if (preamble+sections.map(s=>s.source).join('') !== original) return fallback;
    return {kind:'sections',original,preamble,sections};
  } catch {return fallback;}
}

export function preliminaryExcerpt(run: Pick<Run,'assessment'|'version'>, limit=360): string | undefined {
  const report=presentAnalysis(run);
  if (report.kind !== 'sections') return undefined;
  const body=report.sections.find(s=>s.key==='assessment')!.body;
  const first=(parser.parse(body) as unknown as Node).children?.[0];
  if (first?.type !== 'paragraph') return undefined;
  const text=inlineText(first)?.replace(/\s+/g,' ').trim();
  if (!text) return undefined;
  if (text.length <= limit) return text;
  const candidate=text.slice(0,limit), boundary=candidate.lastIndexOf(' ');
  return candidate.slice(0,boundary>limit/2?boundary:limit)+'…';
}

export function runProvenance(run: Run): {model?: string; documentCount?: number} {
  if (run.minimum) return {model:run.minimum.modelVersion || run.minimum.model,documentCount:new Set(run.minimum.documents.map(d=>d.documentId)).size};
  if (run.gemini) {
    const documents=run.gemini.input?.documents;
    return {model:run.gemini.modelVersion || run.gemini.model,documentCount:Array.isArray(documents)?new Set(documents.map(d=>d.documentId)).size:undefined};
  }
  const match=/^gemini-text:([a-zA-Z0-9.-]+):minimum-pdf-text-v\d+$/.exec(run.version);
  // Case documents are current mutable data, not this historical Run's input.
  return {model:match?.[1]};
}
