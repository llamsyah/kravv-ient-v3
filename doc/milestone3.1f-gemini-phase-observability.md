# M3.1f — Gemini Phase-Level Observability

Tanggal: 26 Oktober 2026. **Verdict: PASS untuk observability dan validasi offline.** Penyebab latensi Google masih belum diketahui. Milestone ini tidak membuktikan keberhasilan analisis live.

**Permintaan Gemini nyata: 0 generation, 0 metadata.** Semua respons provider berasal dari transport mock atau handler outbound lokal workerd. Tidak ada pergantian model, perubahan timeout, prompt, schema, retry, migrasi, staging, commit, push, atau deployment.

## 1. File dan perubahan

Empat file yang sudah ada diperbarui, enam file baru ditambahkan; laporan ini merupakan satu file tambahan.

| File | Perubahan |
| --- | --- |
| [gemini-diagnostics.server.ts](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/lib/gemini-diagnostics.server.ts>) — baru | Logger JSON dengan proyeksi field dan allowlist fase/error; UUID korelasi, UUID attempt, sequence, timing, span, serta penutupan fase aktif saat deadline. Kegagalan logger ditelan. |
| [gemini-provider.server.ts](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/lib/gemini-provider.server.ts>) | Instrumentasi persiapan request, metadata, generation, body, parsing, validasi, cancellation, dan hasil provider. Transport, request body, batas ukuran, manual redirect, pemetaan error, dan satu timer bersama dipertahankan. |
| [gemini-run.server.ts](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/lib/gemini-run.server.ts>) | Instrumentasi pembacaan workspace, persiapan PDF, journal, validasi ulang, penyimpanan D1, pemulihan save, dan hasil aplikasi. Format/key journal, atomic claim, request ID, serta urutan persistensi tidak berubah. |
| [gemini-provider.observer.ts.fixture](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/fixtures/gemini-provider.observer.ts.fixture>) — baru | Pengganti observer provider khusus QA. Status/receipt header dicatat langsung; respons asli diteruskan tanpa clone atau pembacaan body diagnostik. Guard satu POST per proses dan batas tujuan tetap tersedia. |
| [gemini-response-observer.mjs](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/gemini-response-observer.mjs>) — baru | Observer klien QA menggunakan sanitizer yang sama. Status aplikasi dicatat sebelum satu pembacaan JSON asli; respons/error diteruskan tanpa retry atau timer baru. |
| [gemini-live.mjs](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/gemini-live.mjs>) | Runner live diarahkan melalui observer klien baru. **Runner ini tidak dijalankan pada M3.1f.** Opt-in dan pembatasan QA yang sudah ada tetap berlaku. |
| [gemini-analysis.mjs](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/gemini-analysis.mjs>) | Loader mock mengikuti dependency diagnostik baru dan meneruskan trace ke adapter asli. Cakupan regresi lama dipertahankan. |
| [gemini-diagnostics.mjs](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/gemini-diagnostics.mjs>) — baru | 23 skenario fase, clock, timeout, cancellation, error, replay, persistence, observer, dan sanitasi. |
| [gemini-diagnostics-workers.mjs](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/gemini-diagnostics-workers.mjs>) — baru | Empat probe native workerd dengan observer provider dan outbound yang sepenuhnya lokal. |
| [gemini-response-observer-test.mjs](<C:/Users/PIXWAR/OneDrive/Documents/CODE/KRAVV-IENT VC PROJECT/ient-src/tests/gemini-response-observer-test.mjs>) — baru | Tujuh skenario observer klien: header bertahan ketika body macet/abort, pemisahan header wait, serta respons/error asli. |

Observer provider baru merupakan fixture yang dapat diperiksa di repository. Installer observer lama di artefak milestone sebelumnya dipertahankan sebagai bukti historis; jangan memakainya untuk uji berikutnya karena masih memuat pembacaan clone diagnostik lama. Instal fixture baru hanya pada salinan QA.

## 2. Fase diagnostik

| Kelompok | Nama fase |
| --- | --- |
| Alur aplikasi | `analysis`, `analysis_result`, `workspace_read`, `pdf_prepare`, `context_read` |
| Provider | `provider_prepare`, `metadata_headers`, `metadata_body`, `metadata_json`, `generation_headers`, `generation_body`, `generation_json` |
| Structured output | `structured_parse`, `structured_validate`, `service_validate` |
| Penyimpanan | `journal_read`, `journal_claim`, `journal_ready`, `workspace_save`, `save_recovery`, `journal_saved`, `journal_failed` |
| Hasil/cancellation | `error_body_cancel`, `provider_deadline`, `provider_result` |
| Observer provider QA | `qa_metadata_headers`, `qa_generation_headers`, `qa_response_processing` |
| Observer klien QA | `qa_application_headers`, `qa_application_body` |

Record berjenis `gemini.phase.v1` berisi UUID `correlationId` (request ID valid), UUID `attemptId`, sequence, fase, event, dan `elapsedMs`; span juga memiliki `phaseMs`. Event terminal: `completed`, `failed`, `timeout`, atau `aborted`. `performance.now()` dipakai bila tersedia, dengan fallback wall clock yang diklem agar tidak mundur. Clock virtual hanya untuk tes.

Field opsional dibatasi pada `providerHttpStatus`, `applicationHttpStatus`, `headersReceived`, `bodyComplete`, `signalAborted`, dan kode error yang dikenal. Nilai maupun nama header mentah tidak dicatat.

- `*_headers.completed` berarti objek Response sudah diterima, bukan body selesai atau analisis berhasil.
- Pada adapter, `bodyComplete=true` berarti pembacaan hingga EOF selesai; parsing/validasi memiliki fase tersendiri. Pada klien QA, flag ini baru true setelah pembacaan JSON asli selesai. Cancel body error tidak dianggap pembacaan body selesai.
- `provider_result.completed` belum berarti Run tersimpan. Penyimpanan dan `analysis_result` harus diperiksa terpisah.
- `applicationHttpStatus` pada hasil service adalah status hasil aplikasi; `qa_application_headers` mencatat status yang benar-benar diterima klien.
- Contoh timeout setelah header: `generation_headers.completed: providerHttpStatus=200`, lalu `generation_body.timeout: headersReceived=true, bodyComplete=false, providerHttpStatus=200, applicationHttpStatus=504`. Ini tidak diklaim sebagai HTTP 504 dari Google.
- Deadline menutup span aktif secara langsung, termasuk ketika transport belum menolak Promise. Jika proses dihentikan platform, record start terakhir tetap menunjukkan fase terakhir yang diketahui.

Observer provider kini hanya mengukur receipt header dan penyerahan respons asli; tidak ada lagi body diagnostik yang berpotensi macet. Observer klien membedakan penantian header dari pembacaan JSON aplikasi. Record header yang sudah dikeluarkan tidak dihapus atau ditimpa ketika pembacaan body gagal.

## 3. Validasi offline

Semua perintah berikut lulus pada salinan QA terisolasi:
`C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m31a`.
Dependency yang sudah terpasang digunakan; tidak ada instalasi dependency.

| Pemeriksaan | Hasil |
| --- | --- |
| Root `npm run typecheck` | PASS; fixture observer provider juga pernah disalin sebagai file TS QA sementara dan lolos pemeriksaan tipe, lalu dihapus. |
| Root `npm run lint` | PASS, 0 error; dua warning lama: import `Case` tidak dipakai dan navigasi `location.assign()`. Tidak ada aturan lint yang dinonaktifkan. |
| Root `npm run build` | PASS, production build selesai. |
| `gemini-analysis.mjs` | PASS: native PDF contract, schema/source validation, error, concurrency, replay, CAS/recovery save, dan historical runs. |
| `gemini-diagnostics.mjs` | PASS, 23 skenario. |
| `gemini-response-observer-test.mjs` | PASS, 7 skenario. HTTP 200/400/503 tetap tercatat saat body macet dan kemudian diabort. |
| `gemini-diagnostics-workers.mjs` | PASS, 4 probe: metadata wait, generation header wait, body macet setelah HTTP 200, serta HTTP 400 dengan body terbuka. |
| `gemini-workers.mjs` | PASS: 20 kasus redirect metadata/generation ditolak dan satu respons lengkap sukses; tidak ada forwarding credential atau parameter sampling terlarang. |
| `document-input.mjs`, `analysis-view.mjs` | PASS: ownership, beberapa PDF, batas input, file hilang/invalid, serta snapshot/history. |
| HTTP `auth-access.mjs`, `workflow.mjs`, `analysis-workflow.mjs`, `document-readiness.mjs` | PASS dengan adapter asli tanpa key di QA. |
| HTTP `gemini-workflow.mjs` | PASS dengan fixture provider mock: Run tersimpan melalui D1/R2, GET reload, Human Review, replay/concurrency, source IDs, historical rules-v1 dan bytes PDF tetap benar. |
| `auth-access.mjs --verify-restart` | PASS setelah server QA benar-benar direstart; sesi, owner, dan complete workspace pulih. |
| Perbandingan adapter sebelum/sesudah | PASS untuk enam skenario sukses/error; request body identik byte demi byte, hasil/error yang diamati sama. |

Bukti lokal: [folder log dan integrity](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m31f>), khususnya [diagnostics.log](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m31f/diagnostics.log>), [qa-observer.log](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m31f/qa-observer.log>), [workers-diagnostics.log](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m31f/workers-diagnostics.log>), dan [integrity-final.json](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m31f/integrity-final.json>).

## 4. Timeout dan cancellation

Satu timer produksi **90.000 ms** tetap dimulai sesudah serialisasi request dan dibersihkan pada finally. Signal yang sama dipakai metadata dan generation. Tidak ada reset, tambahan durasi, atau deadline baru. Persiapan dokumen serta persistensi tetap di luar timer provider.

Clock virtual membuktikan metadata 89.000 ms menyisakan 1.000 ms untuk generation. Timeout sebelum header, metadata body, dan generation body semuanya menghasilkan klasifikasi TIMEOUT/aplikasi 504 sesuai perilaku lama, dengan fase yang benar. Abort eksternal yang bukan deadline internal tetap dipetakan ke PROVIDER_UNAVAILABLE/502; diagnostik menandainya aborted.

Empat probe workerd memakai timeout **fixture 1.000 ms**, sambil mengassert konfigurasi produksi tetap 90.000 ms. Ini tidak mengubah konfigurasi aplikasi. Tes juga memastikan timer dibersihkan setelah selesai, prep/save tetap berada di luar budget provider, dan logger yang melempar tidak mengubah keberhasilan request.

## 5. Keamanan dan idempotency

- Proyeksi field/allowlist diuji dengan sentinel key fiktif, nama file, etag, company data, error mentah, base64, prompt, dan output. Tidak ada nilai tersebut di record diagnostik. Pesan provider, stack, URL, header, request body, PDF, dan hasil lengkap tidak dilog.
- Request ID tidak berubah. Trace attempt baru hanya membedakan eksekusi/replay log; tidak disimpan sebagai jurnal baru.
- Replay ID setelah timeout tidak memanggil provider lagi. Jika penulisan failed journal gagal, claim started tetap mencegah generation duplikat. Saved replay tidak menambah Run atau mengubah revision.
- Kegagalan finalisasi saved journal tetap tidak mengubah hasil D1 yang sudah sukses menjadi error. Run/review historis, CAS, dan save recovery tetap lolos regresi.
- Hash **16 file runtime asli** dan hash file secret asli sama dengan baseline. Empat file lama yang berubah hanya adapter, orchestrator, loader tes adapter, dan runner QA live; file sumber lama lainnya dalam snapshot tidak berubah. Key tidak ditampilkan atau ditimpa.
- Tujuh tracked deletion, direktori untracked `doc/`, dan semua status Git sebelumnya dipertahankan. Tidak ada staging atau commit.
- Server QA sudah dihentikan; fixture provider mock dan secret fiktif QA sudah dibersihkan, adapter asli dipulihkan. Runtime asli tidak dijalankan untuk tes.

## 6. Keterbatasan

Belum ada bukti live baru untuk menentukan sumber latensi Google maupun apakah request sebelumnya selesai di sisi provider. Abort lokal bukan bukti pembatalan provider dan idempotency aplikasi bukan jaminan exactly-once dari Google.

Timing adalah waktu yang diamati runtime; resolusi clock Workers, penjadwalan event loop, dan overhead logging membatasi presisi. Logger tidak menunggu layanan eksternal dan exception sink ditelan, tetapi penulisan console sinkron tetap memiliki overhead. Jika isolate dihentikan mendadak, event terminal mungkin tidak sempat dikeluarkan. Tidak ditambahkan penyimpanan log durable, background job, atau cancellation propagation dari browser.

Body error provider sengaja tidak dibaca oleh observer: tersedia HTTP status serta klasifikasi adapter, bukan pesan error Google yang bebas. Fase JSON/validasi sinkron tetap tunduk pada penjadwalan timer yang sama seperti sebelumnya. M3.1f tidak menyelesaikan latensi, mengoptimalkan request, atau memperpanjang deadline.

## 7. Usulan satu uji live berikutnya — belum dieksekusi

1. Tunggu otorisasi terpisah. Gunakan salinan QA terisolasi dan snapshot integritas; pertahankan model `gemini-3.8-flash`, prompt, schema, serta timeout 90 detik.
2. Simpan salinan adapter aktual sebagai `gemini-provider.actual.server.ts` **di QA saja**, lalu pasang fixture observer provider baru sebagai adapter QA. Gunakan runner klien QA yang telah diperbarui; jangan jalankan installer observer historis. Periksa hash adapter, konfigurasi privat, dan guard satu generation sebelum memulai proses QA baru.
3. Buat company/case dan satu PDF kecil fiktif tanpa Evidence manual wajib. Gunakan satu request ID baru. Key hanya dimuat privat di QA; tidak dicetak atau ditimpa di workspace asli.
4. Jalankan satu analysis POST. Metadata GET bawaan adapter memeriksa akses dan dukungan generateContent; setelah itu maksimal **satu** generateContent POST. Tidak ada retry, fallback, perubahan model/billing, atau pengulangan otomatis.
5. Kelompokkan log berdasarkan correlationId, attemptId, dan sequence. Bedakan metadata headers/body, generation headers/body, parse/validation, persistensi/finalisasi, serta header/body aplikasi pada klien. Jangan menyimpulkan provider tidak menerima request hanya karena aplikasi timeout.
6. Jika sukses, periksa schema dan source IDs, saved Run, reload, Human Review, replay tanpa generation tambahan, serta hash PDF/data asli. Jika gagal, berhenti dan laporkan status provider yang benar-benar teramati, flag header/body, fase terakhir, dan klasifikasi tersanitasi. Tidak mengulang generation.
7. Hentikan QA, pulihkan adapter QA, bersihkan hanya secret QA sementara, dan verifikasi integritas kembali. Tidak deploy atau memulai Milestone 4.

**Final verdict: PASS.** Implementasi observability dan seluruh validasi offline selesai. Uji live tetap menunggu otorisasi terpisah.

