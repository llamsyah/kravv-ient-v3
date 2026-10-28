// Fictional presentation fixtures. Never generated through a provider.
export const indonesianReport = `# Catatan investasi Lintas QA

Materi fiktif untuk menguji tampilan, bukan hasil AI baru.

### 1. Ringkasan Eksekutif

QA-S1. **Lintas QA** melaporkan MRR Rp 480 juta dan ARR Rp 5,76 M. Angka ini merupakan *klaim manajemen*, bukan verifikasi independen.

### 2. Temuan Utama

1. **QA-S2A. Kualitas pendapatan**
   - Fakta / Data: pendapatan dilaporkan berulang.
   - Interpretasi: kontrak dan invoice perlu diperiksa.
     1. Periksa periode pelaporan.
     2. Rekonsiliasi satuan rupiah.
2. **QA-S2B. Konsistensi sumber**
   > Hubungan antarangka belum diaudit.

| Metrik | Nilai dilaporkan | Status sumber |
| --- | --- | --- |
| MRR | Rp 480 juta | Klaim manajemen |
| ARR | Rp 5,76 M | Notasi perlu dikonfirmasi |

### 3. Risiko dan Kontra-Argumen

- **QA-S3. Konsentrasi pelanggan:** distribusi pendapatan belum disediakan.
- Kontra-argumen: kontrak jangka panjang dapat mengurangi risiko; kontraknya belum tersedia.

### 4. Informasi yang Belum Terverifikasi

QA-S4. Churn, gross margin, dan runway belum didukung bukti independen.

### 5. Pertanyaan Due Diligence

1. QA-S5. Apakah manajemen dapat menyediakan rincian kontrak dan rekonsiliasi ARR/MRR?
2. Bagaimana distribusi pendapatan per pelanggan?

### 6. Kesimpulan Sementara

QA-S6. Indikator pendapatan layak ditelaah lebih lanjut; kualitas pendapatan dan retensi masih perlu diverifikasi. Human Review menentukan tindak lanjut, bukan persetujuan investasi otomatis.

Tidak ada keputusan investasi yang dibuat dalam fixture ini.
`;
export const englishReport = `### 1. Executive Summary

EN-S1. **Fictional Harbor QA** reports recurring revenue. *Management-provided* evidence remains unverified.

### 2. Key Findings

1. **EN-S2. Revenue quality**
   - Reported ARR is USD 1M, where M follows the English source notation.
   - Request contracts before relying on the claim.

### 3. Risks & Counterarguments

EN-S3. Retention is unknown. Long contracts could reduce risk, but have not been supplied.

### 4. Unverified Information

EN-S4. No independent confirmation of churn or gross margin is supplied.

### 5. Due Diligence Questions

- EN-S5. Can management reconcile renewals with recurring revenue?

### 6. Provisional Conclusion

EN-S6. Further verification of contracts and renewals is needed before human judgment. This statement is supporting analysis, not an investment decision.
`;
export const legacyReport = 'Executive Summary\nFictional legacy company.\n\nFindings\nReported ARR USD 100000.\n\nRisks\nRetention unknown.\n\nDiligence Questions\nVerify renewals.';
export const fixtureRun = (text=indonesianReport,version='minimum-pdf-text-v2') => ({id:'QA-REPORT-'+version,name:'Original Run name',createdAt:'2026-10-27T01:00:00.000Z',version:'gemini-text:gemini-3.5-flash-lite:'+version,assessment:text,simulated:false,evidence:[],findings:[]});
export const structuredRun = () => ({...fixtureRun('STRUCT-ASSESSMENT. Original structured summary.'),id:'QA-STRUCTURED',name:'Fixture · Historical structured Gemini',version:'gemini:gemini-qa-structured:vc-pdf-v1',findings:[{id:'STRUCT-FINDING',dimension:'AI observation',observation:'STRUCT-FINDING. Fictional pilot reported.',interpretation:'Original structured interpretation.',counterargument:'Original uncertainty.',confidence:'Not independently verified',documentIds:['DOC-STRUCT-QA'],evidenceIds:[]}],gemini:{requestId:'00000000-0000-4000-8000-000000000042',model:'gemini-qa-structured',modelVersion:'gemini-qa-structured-001',promptVersion:'vc-pdf-v1',input:{workspaceRevision:1,company:{id:'CO-QA',name:'Historical structured fixture',website:'https://fictional.example',sector:'Software',geography:'Indonesia'},caseContext:{name:'Original case context',thesis:'Original thesis'},evidenceIds:[],documents:[{documentId:'DOC-STRUCT-QA',originalFilename:'fictional-historical.pdf',mimeType:'application/pdf',sizeBytes:799,source:{description:'Fictional source',documentType:'Pitch Deck',uploadedAt:'2026-10-27',uploadedBy:'QA'},storageEtag:'fixture-version'}]},result:{executiveSummary:'STRUCT-SUMMARY. Original structured executive summary.',businessOverview:'STRUCT-BUSINESS. Original structured business overview.',findings:[{observation:'Fictional pilot reported.',interpretation:'Original interpretation.',uncertainty:'Original uncertainty.',counterargument:'Original counterargument.',documentIds:['DOC-STRUCT-QA'],evidenceIds:[]}],risks:[{description:'STRUCT-RISK. Fictional risk.',uncertainty:'Original uncertainty.',documentIds:['DOC-STRUCT-QA']}],missingInformation:['STRUCT-MISSING. Retention unknown.'],diligenceQuestions:[{question:'STRUCT-QUESTION. Can management provide renewal evidence?',documentIds:['DOC-STRUCT-QA']}]}}});
