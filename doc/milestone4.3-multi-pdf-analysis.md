# M4.3 — Multi-Document Gemini Analysis

Tanggal: 27 Oktober 2026. **Verdict: PARTIAL.** Implementasi multi-PDF dan seluruh regresi terkait lulus; batas upload multipart Vinext yang sudah ada menghalangi upload file besar dari UI lokal. Batas tersebut tidak dinaikkan. **Generation Gemini nyata: 0; metadata nyata: 0.**

## Perubahan

Path berikut relatif terhadap `ient-src/`; total 15 file implementasi/test, ditambah laporan ini.

| File | Perubahan |
| --- | --- |
| `app/api/analysis/minimum/route.ts` | Menerima 1–5 PDF, membentuk satu request, membekukan intent sumber, dan menyimpan provenance pada Run baru. |
| `lib/minimum-analysis.ts` (baru) | Versi kontrak input, instruksi kolektif singkat, dan tipe provenance plaintext. |
| `lib/model.ts` | Field JSON opsional `Run.minimum`; tanpa migrasi atau penulisan ulang Run lama. |
| `lib/document-input.ts` | Feedback validasi pilihan di browser; konstanta batas M2 tetap. |
| `app/document-readiness.tsx` | Checkbox 1–5 PDF, filename/ukuran, jumlah/total pilihan, dan error yang dapat ditindaklanjuti. |
| `app/analysis-workspace.tsx`, `app/workspace.tsx` | Aksi multi-PDF dan penyimpanan pilihan/konteks dalam state workspace selama navigasi tab; daftar sumber Run tersimpan. |
| `lib/analysis-presentation.ts`, `app/analysis-report.css` | Membaca count/model dari provenance baru dan menampilkan sumber secara ringkas. |
| `lib/localization-messages.json` | Label dan error baru ID/EN. |
| `tests/minimum-analysis.mjs`, `tests/analysis-presentation.mjs` | Memperluas regresi adapter, provenance, batas, historis, dan presentasi. |
| `tests/multi-pdf-workflow.mjs`, `tests/minimum-workers.mjs` (baru) | Workflow QA D1/R2 dan probe workerd dengan transport mock. |
| `tests/fixtures/minimum-transport.mock.ts.fixture` | Fixture transport multi-PDF, hanya untuk pemasangan eksplisit di QA. Tidak dipasang pada route aplikasi lokal. |

## Input, request, dan provenance

Menggunakan kembali `prepareCasePdfInput` M2 tanpa mengubah implementasi servernya: autentikasi, kepemilikan case, resolusi seluruh ID sebelum pembacaan bytes, R2 ber-prefix owner, deteksi duplikat, ketersediaan/ukuran objek, dan pemeriksaan header/EOF PDF. Batas tetap **5 file, 10 MiB/file, 12 MiB total**. Browser memberi feedback awal; server selalu memvalidasi ulang. Evidence manual tetap opsional.

Satu POST ke endpoint `v1beta/models/gemini-3.5-flash-lite:generateContent` berisi:

1. Instruksi singkat untuk membaca sumber secara kolektif, membedakan pernyataan yang dilaporkan/ketidakpastian/perbedaan angka, dan memperlakukan nama/ID sebagai data tak tepercaya.
2. Pasangan label JSON `SOURCE-n`/document ID/filename dan native `inlineData: application/pdf` untuk setiap PDF, mengikuti urutan pilihan.
3. Instruksi Investment Analyst Prompt v2 dalam locale terpilih.

Tetap plaintext/Markdown, `maxOutputTokens: 8192`, timeout bersama 90 detik, request maksimal 20.000.000 byte, dan batas respons yang ada. Tidak menambahkan JSON schema, sampling parameter, fallback, atau retry otomatis. Model dan konfigurasi asli tidak berubah.

Run baru menyimpan `minimum`: request ID, model/model version, prompt/input version, locale, document ID/filename/ukuran, metadata sumber, ETag jika tersedia, urutan dan source label. Usage hanya menerima angka token nonnegatif yang valid dari respons provider; nilai hilang tidak diisi. Teks output tetap literal, `simulated: false`, tanpa fabrikasi findings/evidence/citation. PDF asli tidak diduplikasi.

Journal tetap privat dengan atomic claim dan status `started/generated/saved/failed`. Intent baru `minimum-multi-pdf-v1` mengikat case/nama, urutan ID, locale, model/prompt version, konteks sumber, metadata dan ETag yang dibekukan. Replay menggunakan snapshot journal, bukan daftar dokumen case saat ini; sumber yang berubah pada request baru menghasilkan intent berbeda. Journal lama tanpa versi atau dengan `locale-v1` tetap dapat dipulihkan tanpa generation baru dan tanpa backfill Run historis.

Analysis memakai provenance Run untuk count dan daftar sumber, mempertahankan enam bagian M4.2/fallback, inspector asli, dan Human Review. Run lama tanpa provenance tetap menampilkan keadaan tidak tersedia. Decision tetap referensi ringkas, bukan laporan penuh atau keputusan AI.

## Hasil pengujian offline

| Pemeriksaan | Hasil |
| --- | --- |
| Root `npm run typecheck`, `npm run lint` | PASS di aplikasi lokal; lint 0 error dan 2 warning lama (`Case` tidak digunakan; `location.assign` saat sesi tidak terautentikasi). |
| Root `npm run build` | PASS di QA tanpa transport mock terpasang. Seluruh 170 source aplikasi yang sudah ada dan semua file baru yang dipromosikan cocok dengan aplikasi lokal. |
| `tests/minimum-analysis.mjs` | PASS: **48 skenario**, termasuk 1/2/5 PDF dalam satu payload, setiap PDF tepat sekali, ownership/format/batas, locale, source-version/order intent, timeout, atomic claim, save/recovery/replay, journal lama, dan Human Review. Batas 10 MiB + 2 MiB juga lulus pada transport mock. |
| `tests/document-input.mjs` | PASS: regresi M2, termasuk unavailable/truncated PDF, duplikat, owner/case, ukuran, urutan dan proyeksi metadata. |
| `tests/multi-pdf-workflow.mjs` | PASS pada QA D1/R2: tiga generation POST **mock** untuk 1/2/5 PDF, replay/save tidak menambah generation, reload/provenance/ETag/review, rules-v1, case historis, serta download byte-identik. |
| `tests/minimum-workers.mjs` | PASS di workerd: lima PDF total **12.582.912 byte**, payload **16.784.012 byte**, satu outbound mock; Run tersimpan dan replay tidak mengulang request. Storage fixture memori, bukan data asli. |
| `tests/analysis-presentation.mjs` | PASS: **13 kelompok**, termasuk sumber multi-PDF pada dua locale, count/order dari snapshot, M4.2, v1/rules-v1/structured historis, fallback, keamanan Markdown dan Decision ringkas. |
| `tests/localization.mjs`, `tests/analysis-view.mjs`, `tests/gemini-analysis.mjs`, `tests/gemini-workers.mjs` | PASS: lokalisasi, snapshot/historis, adapter terstruktur, redirect Workers dan error sanitization. Semua transport offline. |
| Browser QA | PASS: pilihan lima file bertahan setelah pindah tab, file keenam dinonaktifkan, PDF invalid mendapat error Indonesia, satu aksi UI menghasilkan satu request **mock** tambahan, lima sumber/ukuran tersimpan tampil, enam bagian terbaca, ganti bahasa, Human Review tersimpan setelah reload, dan Decision membuka Run tepat. Console error kosong. |

QA memakai source copy fisik, D1/R2 baru, data fiktif, dan key palsu; transport tidak meneruskan request ke Google. Tiga panggilan mock workflow ditambah satu dari UI terkonfirmasi di log. Probe workerd dan unit test memakai mock tersendiri. Server/tab QA sudah ditutup; helper sementara dihapus sebelum build/promosi. Tidak ada credential atau runtime QA yang disalin ke repository.

## Keterbatasan terverifikasi

**Upload lokal besar belum kompatibel dengan batas input yang ditargetkan.** Upload multipart PDF fiktif 2 MiB pada QA mendapat HTTP **413 / Payload Too Large**. Vinext yang terpasang menjalankan `handleProgressiveServerActionRequest` untuk multipart sebelum route API, dengan default `maxActionBodySize` **1 MiB**, walaupun route dokumen memiliki batas aplikasi 20 MiB. Bukti kode lokal: `node_modules/vinext/dist/server/app-server-action-execution.js` dan `dist/entries/app-rsc-entry.js`. Tidak ada perubahan dependency, konfigurasi atau batas untuk melewati kegagalan ini.

Karena itu workflow upload→analisis diverifikasi dengan PDF kecil; kapasitas analisis 12 MiB diverifikasi terpisah pada workerd. Ini belum membuktikan upload besar end-to-end melalui UI lokal. Perbaikan dispatch multipart Vinext perlu ditinjau tersendiri; tidak dilakukan pada milestone ini.

Belum ada penerimaan Gemini multi-PDF nyata sesuai larangan milestone. Pemeriksaan PDF tetap sebatas envelope M2, bukan parsing/dekripsi. Pilihan UI bertahan selama navigasi dalam sesi workspace yang sedang terbuka, tidak dijanjikan setelah reload halaman. Metadata sumber bukan sitasi halaman atau bukti verifikasi independen. Tidak ada reconciliation, confidence score, evidence verification otomatis, atau keputusan investasi AI.

## Integritas dan uji live berikutnya

Baseline/final menunjukkan **13 workspace asli beserta revisi dan isinya identik**, file runtime/dokumen asli dan hash secret tetap, source di luar daftar perubahan tetap identik, tujuh tracked deletion lama dan `doc/` terjaga, serta tidak ada staging. Pembacaan database asli hanya melalui salinan privat di luar repository. Tidak ada migrasi, commit, push, deploy, atau M4.4.

Rencana berikut **belum dijalankan dan memerlukan otorisasi generation terpisah**:

1. Gunakan QA fisik baru, key privat server-side, model tetap, dua PDF fiktif kecil yang saling melengkapi (masing-masing di bawah batas upload lokal 1 MiB, termasuk overhead multipart).
2. Periksa metadata model bila diotorisasi, validasi kesiapan dua sumber, pilih locale, dan buat satu request ID baru.
3. Izinkan paling banyak **satu** `generateContent` POST; pertahankan prompt, batas, diagnostics dan tanpa fallback/retry.
4. Jika berhasil, periksa informasi spesifik kedua PDF, teks asli, `simulated: false`, identitas/urutan/ETag/locale/model pada Run, reload, Human Review, serta replay ID yang sama tanpa generation lagi. Jangan menganggap source label sebagai sitasi halaman tervalidasi.
5. Jika gagal, simpan diagnostik tersanitasi dan fase terakhir; berhenti tanpa request kedua atau perubahan spekulatif.

Bukti pengujian privat dan screenshot tersedia di folder visualisasi tugas `m43-validation`; laporan ini tidak menyertakan secrets atau dokumen bisnis.
