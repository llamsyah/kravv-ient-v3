# M3.2 — Gemini Flash-Lite Model Pivot & Live Acceptance

Tanggal: 26 Oktober 2026. **Final verdict: BLOCKED.**

Satu generation nyata menggunakan `gemini-3.5-flash-lite` mengembalikan **HTTP 400 dari provider**. Aplikasi memetakannya menjadi **HTTP 502 / PROVIDER_ERROR**. Header generation diterima sekitar empat detik setelah POST; percobaan ini tidak mengalami timeout. Tidak ada retry, fallback, structured output, atau saved Gemini Run.

## 1. Temuan kompatibilitas

Pemeriksaan dokumentasi resmi dilakukan sebelum perubahan model QA dan generation.

| Aspek | Bukti dan penilaian preflight |
| --- | --- |
| Model resmi | Identifier `gemini-3.5-flash-lite` terdokumentasi sebagai model stabil dengan input PDF dan structured output. Batas terdokumentasi: input 1.048.576 token, output 65.536 token. [Model resmi](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite). |
| generateContent dan inline PDF | Google mendokumentasikan PDF inline melalui generateContent dengan `inlineData.mimeType=application/pdf` dan data base64. Contract adapter mengikuti bentuk ini; fixture hanya 799 byte. [Document understanding](https://ai.google.dev/gemini-api/docs/generate-content/document-processing). |
| JSON output | Flash-Lite tercantum mendukung structured output. Keyword schema aplikasi—object/array/string, properties, required, additionalProperties, items, minItems/maxItems—termasuk subset yang didokumentasikan. Tidak ada references, union, atau nullable tambahan dalam schema tersebut. [Structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output). |
| GenerationConfig | Referensi REST masih mencantumkan `responseMimeType`, `responseJsonSchema`, dan `maxOutputTokens`. Dokumentasi kini juga mengarahkan format REST baru ke responseFormat; tidak ditemukan instruksi spesifik Flash-Lite yang mewajibkan perubahan payload ini. Format yang ada dipertahankan. Ini pemeriksaan dokumenter, bukan bukti bahwa seluruh request diterima provider. [Referensi REST](https://ai.google.dev/api/generate-content). |
| Sampling, turn, dan thinking | Adapter tidak mengirim temperature/top-p/top-k, candidateCount, thinkingBudget, tools, maupun prefilled model turn. Panduan model menyebut default thinking minimal; konfigurasi thinking tidak ditambahkan. [Panduan migrasi Flash-Lite](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.6). |
| Limits yang dipakai | `maxOutputTokens=8192` berada di bawah limit metadata 65536. Timeout tetap 90000 ms; batas input/response aplikasi tetap. Tes ini tidak menguji PDF besar atau semua kondisi batas produksi. |

Metadata-only preflight dengan key yang sudah ada menghasilkan **HTTP 200** dalam **246 ms**, sebelum generation:

- Name: `models/gemini-3.5-flash-lite`.
- Version metadata: `3.5-flash-lite-07-2026`.
- Supported methods mencakup `generateContent`.
- Input/output limit: 1048576/65536 token.

Metadata membuktikan endpoint model tersedia untuk pemeriksaan tersebut; tidak membuktikan izin billing/quota atau keberhasilan generation. Tidak ditemukan ketidakcocokan terdokumentasi yang mengharuskan modifikasi request sebelum satu acceptance attempt. Namun HTTP 400 live berarti kompatibilitas end-to-end payload **belum terkonfirmasi**; penyebabnya tidak boleh disimpulkan dari status saja.

## 2. Perubahan persis di QA

QA baru menggunakan infrastruktur terisolasi yang sama:

`C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32`, port `5198`.

- Source disalin tanpa storage/auth/runtime asli; dependency disalin fisik dari QA sebelumnya, tanpa symlink/junction atau instalasi baru.
- D1/R2, registry Workers, auth, dan runtime dibuat di dalam QA. Data uji dan seluruh owner QA bersifat fiktif.
- Hanya QA yang dikonfigurasi dengan `GEMINI_MODEL=gemini-3.5-flash-lite`. File environment asli tidak diubah.
- Untuk regresi HTTP, provider mock dan key fiktif digunakan sementara. Sebelum live, mock diganti dengan **fixture observer provider M3.1f**, yang memanggil adapter asli dari backup QA.
- Runner live serta observer klien M3.1f tetap digunakan. Supplement QA hanya mengubah port dan assertion model dari harness M3.1g; payload aplikasi tidak diubah.
- Tes transport mock membandingkan request lengkap kedua model dan membuktikan **body identik byte demi byte**. Perbedaan request provider yang disengaja hanya identifier model pada URL. Prompt, schema, PDF contract, timeout, persistence, dan journal tetap sama.
- `gemini-3.6-flash` tidak dikonfigurasi maupun dipanggil.

Tidak ada file kode/config aplikasi asli yang dimodifikasi. Satu-satunya tambahan repository dalam M3.2 adalah laporan ini.

## 3. Validasi offline

Seluruh pemeriksaan berikut lulus sebelum generation nyata. Build dilakukan tanpa key Gemini nyata di environment QA.

| Pemeriksaan | Hasil |
| --- | --- |
| Root typecheck | PASS; diulang setelah pemasangan observer provider dan tetap lulus. |
| Root lint | PASS, 0 error; dua warning lama tetap ada pada import Case dan location.assign. Tidak ada rule yang dinonaktifkan. |
| Root production build | PASS. |
| gemini-analysis | PASS: PDF contract, structured schema/source validation, error, replay/concurrency, CAS dan persistence recovery, historical runs. |
| model-contract-offline | PASS: override Flash-Lite berfungsi; body kedua model identik, schema/prompt tetap, PDF base64 benar, Evidence kosong diterima, limit output/timeout tetap. Semua transport diintersep. |
| gemini-diagnostics | PASS, 23 skenario fase/timeout/cancellation/persistence/idempotency/sanitasi. |
| gemini-response-observer-test | PASS, 7 skenario observer klien. |
| gemini-workers | PASS, 20 penolakan redirect dan satu respons fixture sukses; sampling terlarang tidak dikirim. |
| gemini-diagnostics-workers | PASS, 4 probe native workerd dengan outbound lokal. |
| document-input dan analysis-view | PASS: ownership/multiple PDF/batas input/history/snapshot. |
| HTTP auth-access, workflow, analysis-workflow, document-readiness | PASS pada QA lokal. |
| HTTP gemini-workflow | PASS dengan provider mock: Run D1/R2, reload, Human Review, replay/concurrency, reference IDs, historical rules-v1 dan download PDF. |
| Auth restart verification | PASS sesudah restart QA. |

Hasil mock tidak dihitung sebagai keberhasilan Gemini nyata.

## 4. Jumlah request nyata dan fixture

| Jenis request | Jumlah |
| --- | ---: |
| Metadata-only preflight | 1 |
| Metadata bawaan adapter live | 1 |
| **generateContent nyata** | **1** |
| Generation retry/fallback | **0** |
| Panggilan Gemini 3.6 | **0** |

Satu startup/case baru, satu PDF valid **799 byte**, dan Evidence manual kosong digunakan. PDF memuat industrial software, ARR USD 100000, 12 pelanggan, serta retention/margin yang belum tersedia.

Request ID: `5b09d80a-426d-43e2-98dc-ed5c6d1959a3`.
Case QA: `CASE-2026-7B3CFC74`.

Jendela proses klien berdasarkan timestamp file: **10:36:10–10:36:16 UTC / 17:36:10–17:36:16 WIB**. Ini bukan timestamp internal Google.

## 5. Respons provider dan timeline fase

**Observed provider HTTP: 400. Observed application HTTP: 502. Sanitized application code: PROVIDER_ERROR.**

Pesan aplikasi: “Gemini could not complete this request. No automatic retry was made.”

Body error Google dibatalkan, tidak dikonsumsi/di-clone oleh observer. Karena itu nama status Google seperti INVALID_ARGUMENT, pesan rinci, atau field violation **tidak teramati pada M3.2**. Jangan mengambil detail dari percobaan model sebelumnya sebagai respons percobaan ini.

Server attempt: `c403ea14-944c-4eed-b68e-29e12d2f450d`.
Client attempt: `65817d35-c06f-4374-94a0-9ede2aac8c4f`.
Keduanya memakai correlation ID sama dengan request ID.

Waktu dalam ms; titik adalah pecahan, tanpa pemisah ribuan. t adalah elapsed record terminal. Clock server/klien mempunyai titik awal masing-masing. **H/B** = header diterima/body selesai; “—” berarti tidak berlaku atau tidak diketahui.

| Surface/seq | Fase | Outcome | t | Durasi | HTTP provider/aplikasi | H/B |
| --- | --- | --- | ---: | ---: | --- | --- |
| Server 7 | pdf_prepare | completed | 30 | 14 | —/— | — |
| Server 11 | journal_claim | completed | 43 | 6 | —/— | — |
| Server 13 | provider_prepare | completed | 44 | 0 | —/— | — |
| Server 16 | qa_metadata_headers | completed | 316 | 271 | 200/— | true/false |
| Server 19 | metadata_headers | completed | 316 | 271 | 200/— | true/false |
| Server 21 | metadata_body | completed | 317 | 1 | 200/— | true/true |
| Server 23 | metadata_json | completed | 317 | 0 | 200/— | true/true |
| Server 26 | qa_generation_headers | completed | 4337 | **4020** | **400**/— | true/false |
| Server 28 | qa_response_processing, generation | completed | 4338 | 0 | 400/— | true/false |
| Server 29 | generation_headers | completed | 4338 | **4021** | **400**/— | true/false |
| Server 31 | error_body_cancel | completed | 4346 | 8 | 400/— | true/false |
| Server 32 | provider_result | **failed** | 4347 | — | **400/502** | true/false |
| Server 34 | journal_failed | completed | 4360 | 13 | —/— | — |
| Server 35 | analysis_result | failed | 4360 | — | —/502 | — |
| Client 2 | qa_application_headers | completed | 4455.115 | 4455.068 | —/502 | true/false |
| Client 4 | qa_application_body | completed | 4455.648 | 0.432 | —/502 | true/true |

Fase metadata terakhir yang sukses: **metadata_json**, t=317. Header generation kemudian diterima, tetapi membawa penolakan HTTP 400. Secara transport, generation_headers dan cancellation berhasil selesai; **fase pertama yang mencatat failed adalah provider_result**, seq 32, setelah pemetaan penolakan provider. Ini bukan keberhasilan generation.

Tidak terjadi provider_deadline atau timeout/abort. Fase `generation_body`, `generation_json`, structured parsing/validation, service_validate, journal_ready, workspace_save dan journal_saved **tidak dimulai**. BodyComplete=false pada provider berarti error body tidak dibaca, bukan body stall yang terbukti.

Dibanding M3.1g, model ini menghasilkan header respons pada percobaan tersebut. Hal itu tidak membuktikan model sebelumnya adalah penyebab timeout atau bahwa Flash-Lite sudah cocok untuk workflow.

## 6. Structured output validation

Tidak ada output analisis untuk divalidasi secara live. Schema, source IDs output, grounding terhadap PDF, modelVersion hasil, dan usage generation **belum dapat diverifikasi**. Validasi offline tetap lulus, tetapi tidak menggantikan acceptance nyata.

## 7. Saved Run, reload, journal, dan idempotency

HTTP reload state serta pemeriksaan read-only D1/R2 QA menunjukkan:

- Satu dokumen pada case live.
- **0 Gemini Run** dan tidak ada partial Run.
- Journal `failed`, failureCode `PROVIDER_ERROR`, failureHttpStatus **502 aplikasi**, tanpa completedRun.
- Provider HTTP 400 tersimpan pada log fase; field status journal adalah hasil aplikasi, bukan status Google.
- Replay setelah kegagalan tidak dilakukan. Verifikasi replay saved Run tidak dapat dijalankan karena tidak ada Run sukses; idempotency telah lulus tes offline.
- Lima Run `rules-v1` dan semua case seed awal pada owner live tetap identik.

## 8. Human Review

**Belum diuji secara live**, sebab tidak ada saved Gemini Run yang dapat direview. Regresi Human Review dengan provider mock lulus sebelum percobaan nyata. Tidak ada review baru yang dipaksakan pada hasil gagal.

## 9. Keamanan dan integritas

- Key dibaca privat dari konfigurasi asli yang sudah diabaikan Git. Tidak ada key, authorization header, request body, PDF/base64, prompt, company context atau generated output dalam record diagnostik.
- Guard satu generation pada fixture provider serta guard satu initial analysis POST pada supplement digunakan. Tidak ada perubahan source selama generation.
- Scan log/hasil diagnostik tidak menemukan key.
- Setelah uji, server QA dihentikan, adapter asli QA dipulihkan byte-identik, secret Gemini sementara dan backup adapter QA dihapus. Port 5198 tidak lagi listen.
- **179 file konten/source dan 16 file runtime asli** cocok dengan snapshot. Set file runtime asli juga sama; credential asli tidak berubah.
- Tujuh tracked deletion, untracked `doc/`, serta semua perubahan Git sebelumnya dipertahankan.
- Tidak ada migrasi, staging, commit, push, deployment, billing change, atau Milestone 4.

Bukti lokal: [metadata-preflight](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/metadata-preflight.json>), [model-contract-offline](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/model-contract-offline.json>), [timeline lengkap](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/phase-timeline.json>), [journal](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/journal-verification.json>), [supplement acceptance](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/ient-src/outputs/acceptance-supplement.json>), [integritas](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/integrity-final.json>), dan [cleanup](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32/cleanup.json>). Log validasi berada di [direktori QA](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32>).

## 10. Rekomendasi kesesuaian model

Flash-Lite memiliki kapabilitas terdokumentasi yang relevan dan diposisikan untuk document parsing berbiaya rendah. Namun **belum layak dipromosikan menjadi model aplikasi asli berdasarkan M3.2**, karena request nyata ditolak dan workflow belum selesai.

Langkah terkecil berikutnya adalah memperoleh detail HTTP 400 dari log provider yang sudah tersedia, jika ada, lalu menilai contract yang ditolak. Bila memerlukan instrumentasi error baru atau generation berikutnya, susun langkah terpisah untuk ditinjau dan diotorisasi. Jangan menebak bahwa PDF, schema, response-format field, atau model adalah penyebab yang sudah terbukti.

Konfigurasi asli tetap seperti semula. Gemini 3.6 hanya kandidat masa depan; tidak diaktifkan atau diuji.

## 11. Verdict akhir

**BLOCKED — preflight dokumenter/metadata dan validasi offline lulus, tetapi satu generation Flash-Lite nyata ditolak HTTP 400. Belum ada structured analysis, saved Run, reload Run, atau Human Review live yang sukses.**

Tidak ada pengujian tambahan setelah penolakan tersebut.

