# M4.6 — Analysis Workspace & Report History

Tanggal: 28 Oktober 2026 (Asia/Jakarta). **Verdict: PASS**, dengan observasi hash fisik SQLite dan batas audit historis yang dijelaskan di bawah. Implementasi tersedia lokal untuk ditinjau.

## Baseline dan ruang lingkup

Branch `main`; baseline dan HEAD akhir tetap `5e040b8ff7c370f20127599a5f3126296400ac09`. Pemeriksaan langsung `origin/main` mengonfirmasi SHA yang sama. Working tree awal hanya memiliki `doc/` dan 15 laporan lama yang belum dilacak; semuanya dipertahankan. Index tetap kosong.

Penyebab masalah UI: `AnalysisWorkspace` sebelumnya memilih Readiness melalui `showReadiness || !run`, sedangkan Workspace menggunakan fallback `find(runId) || runs[0]`. Tujuan persiapan, pembacaan, dan history belum dibedakan. API Minimum sudah mengembalikan `runId`, tetapi UI belum menggunakannya.

## File yang berubah

| File | Perubahan |
| --- | --- |
| `ient-src/app/analysis-history.tsx` (baru) | Library, metadata tersimpan, filter ringan, pemilihan dua laporan dan compare. |
| `ient-src/app/analysis-history.css` (baru) | Navigasi internal, history, pembaca compare desktop/mobile dan focus state. |
| `ient-src/lib/report-history.ts` (baru) | Seleksi Run per Case, sorting salinan, pasangan compare, URL hash dan konfirmasi ID hasil simpan. |
| `ient-src/app/analysis-workspace.tsx` | Navigasi internal; reuse pembaca lama sebagai `SavedReport`; persiapan tetap terpisah; handoff memakai ID terkonfirmasi. |
| `ient-src/app/workspace.tsx` | Navigasi per Case/Run, reload hash, Overview/Decision/Dashboard/Settings, pengambilan `runId` respons Minimum. |
| `ient-src/app/layout.tsx` | Impor stylesheet M4.6. |
| `ient-src/lib/gemini-analysis.ts` | Tambahan tipe opsional `runId` pada hasil aksi UI; tidak mengubah request/provider/schema. |
| `ient-src/lib/localization-messages.json` | Label baru Indonesia/Inggris; terjemahan lama tetap. |
| `ient-src/tests/report-history.mjs` (baru) | Derivasi, SSR bilingual, Run historis, compare, missing/foreign Run dan immutability. |
| `ient-src/tests/report-history-workflow.mjs` (baru) | Harness terjaga untuk fixture QA, upload nyata, histori, Review, owner isolation dan persistensi. |
| Laporan ini (baru) | Hasil implementasi, verifikasi dan batasan. |

Komponen Settings, AI Usage, Overview, PlaintextAnalysis, Decision reference, model WorkspaceState, prompt, route API, provider, autentikasi, penyimpanan, konfigurasi runtime dan dependency diperiksa tetap identik dengan backup awal. Wiring callback di Workspace yang berubah menghubungkan komponen tersebut ke tujuan baru.

## Navigasi dan perilaku

- **Saved Reports:** default ketika Case memiliki Run; seluruh `Case.runs` ditampilkan terbaru dahulu tanpa mengubah array tersimpan. Filter All/Gemini/Simulated. Nama, waktu, jenis, model, prompt, jumlah sumber, Review dan referensi Run ditampilkan bila tersedia. Metadata yang tidak tersimpan ditandai belum dicatat.
- **New Analysis:** default pada Case tanpa Run, dengan empty-history state. PDF selection, batas 1–5 PDF/10 MiB per file/12 MiB gabungan, konteks, locale dan simulasi lama tetap. Berpindah history tidak menghapus pilihan persiapan dalam sesi Workspace yang sama. Tidak ada eksekusi otomatis.
- **Report Detail:** tujuan eksplisit `#case/{caseId}/Analysis/report/{runId}`. Run yang tidak ditemukan tidak digantikan oleh Run terbaru. Pembaca Markdown enam bagian, fallback plaintext, structured Gemini dan rules-v1 tetap digunakan. Original Markdown dapat dibuka; sumber dan versi berasal dari snapshot Run. Human Review selalu difilter dan disimpan untuk Run yang dipilih. Back to Saved Reports dan Start New Analysis tersedia.
- **Compare:** tepat dua Run berbeda dari Case yang sama. Metadata serta laporan asli ditampilkan berdampingan pada desktop lebar; ditumpuk pada layar lebih sempit. Review masing-masing tetap terpisah; tidak ada tombol membuat Review/diligence dari pembaca compare. Source snapshot yang hilang tidak diisi dari dokumen Case saat ini. Tidak ada semantic diff, ekstraksi metrik, kesimpulan otomatis atau AI baru.

Setelah Minimum berhasil, UI memverifikasi `runId` yang dikembalikan benar-benar ada dalam Case pada state hasil simpan dan sesuai request ID. Simulasi memilih satu Run baru dari selisih ID sebelum/sesudah respons simpan; tidak mengasumsikan indeks pertama. Kegagalan atau respons tidak terkonfirmasi tetap memakai jalur uncertain-save, request identity dan replay yang ada. Route, journal, deadline 90 detik serta kebijakan retry tidak diubah.

Overview Prepare AI membuka New Analysis; Review Saved AI membuka Run Gemini yang dimaksud, walaupun Run terbaru adalah simulasi. History membuka Saved Reports. Settings AI Usage, referensi Decision dan Review findings Dashboard membuka Case/Run spesifik. Hash mendukung reload serta navigasi browser; seleksi tidak dibawa ke Case lain. Tab Analysis generik kembali ke default history/persiapan yang sesuai.

## Validasi

| Pemeriksaan | Hasil |
| --- | --- |
| Root `npm run typecheck` | PASS. |
| Root `npm run lint` | PASS: 0 error; dua warning lama (`Case` tidak digunakan pada route workspace dan `location.assign`). |
| Root `npm run build` pada salinan QA | PASS, semua route selesai dibangun. Warning bundling upstream Vinext tetap ada. |
| `node tests/report-history.mjs` | PASS, 12 kelompok skenario. |
| `node tests/analysis-presentation.mjs` | PASS, 13 kelompok, termasuk original text, source snapshot, structured dan rules-v1. |
| `node tests/ai-usage.mjs` / `settings.mjs` | PASS: 11 kelompok usage dan seluruh bagian Settings. |
| `node tests/case-workflow.mjs` | PASS, 15 kelompok M4.5. |
| `node tests/localization.mjs` | PASS, kamus, SSR, forms, shell dan report/readiness bilingual. |
| `node tests/analysis-view.mjs` | PASS, status, snapshot dan atribusi diligence. |
| `node tests/minimum-analysis.mjs` | PASS, 48 skenario mocked, termasuk save/reload/review, replay, konflik revisi, uncertain save dan multi-PDF. |
| `node tests/minimum-analysis-prompt.mjs` / `gemini-analysis.mjs` | PASS, prompt/locale dan regresi adapter structured dengan transport mock. |
| `report-history-workflow --readonly / --verify` di QA | PASS, route nyata, source download byte-identical, 401 anonim, 404 owner lain, review lintas Case ditolak, seluruh Run lama utuh. |
| `analysis-workflow.mjs` / `workflow.mjs` di QA | PASS, histori, Review, diligence, rekomendasi, pembatasan keputusan, portfolio dan optimistic conflict. |
| Diff / pemeriksaan konten | PASS; tidak ada penghapusan tracked, index kosong, scan 10 file implementasi tidak menemukan key/token/PDF base64. |

Satu pemanggilan awal `localization-workflow.mjs` tanpa konfigurasi QA ditolak guard sebelum aksi; tidak dihitung sebagai PASS. Harness itu membutuhkan transport provider fixture khusus. Lokalisasi milestone ini diverifikasi melalui suite offline `localization.mjs` dan browser, tanpa memasang transport atau secret tambahan.

**Browser QA aktual:** Case kosong → New Analysis; satu Run → Saved Reports; empat Run campuran → history lengkap; membuka Run lama, reload URL tepat, original Markdown identik byte-for-byte, Review lama yang benar dan penambahan Review melalui form lama, reload Review, filter Gemini, compare campuran, penolakan pasangan identik/kurang dari dua, foreign Run di Case lain ditolak, Overview → persiapan/history/Run yang benar, Settings Usage → Run lama, Decision → Run referensi yang tepat, PDF readiness nyata tanpa Evidence, pilihan PDF/konteks bertahan ketika berpindah history, simulasi baru → detail ID hasil simpan. Console error browser kosong.

Desktop diuji pada viewport 1440 dan 1600 px; compare dua kolom terukur pada 1600 px. Mobile diuji dengan viewport 390 px dan lebar konten efektif 375 CSS px: `clientWidth = scrollWidth = 375`, compare satu kolom, navigasi keyboard Enter serta bahasa Indonesia/Inggris berfungsi. Viewport override dikembalikan. Screenshot dan fixture tetap privat di luar repository; server dan tab QA utama sudah ditutup.

## Integritas dan batasan

Sebelum perubahan, source dibackup dan salinan database lengkap dibuat di luar repository. Query SQLite hanya dijalankan pada salinan privat. QA menggunakan folder fisik, D1/R2 dan akun fiktif terpisah, dengan API key kosong; tidak menyalin secret, dokumen bisnis atau hasil provider asli ke QA.

Perbandingan awal/akhir M4.6 membuktikan **seluruh 14 workspace identik secara logis**, termasuk string state lengkap, owner dan revisi; `PRAGMA integrity_check` pada salinan akhir menghasilkan `ok`. Seluruh PDF/R2, registry akses/sesi/recovery, signing key, API key dan `doc/` cocok dengan hash awal. **Satu hash file utama SQLite berubah secara fisik; penyebabnya tidak ditetapkan.** Tidak ada restore/reset/reseed/penghapusan/migrasi database asli. Hasil logis 14 workspace bukan pembuktian retroaktif atas celah snapshot awal M4.5; batas audit lama itu tetap berlaku.

Riwayat Run, teks asli, timestamp, provenance, Review, pertanyaan, rekomendasi, keputusan, activity dan portfolio tidak ditulis ulang. Sorting hanya presentasi. Metadata historis yang hilang tetap hilang. Compare manual tidak menetapkan perubahan finansial atau kontradiksi dari teks bebas. Tidak ada search/pagination kompleks, Analysis Library global, chatbot, scoring, atau Investment Context Integration. PoC belum dinyatakan siap produksi.

**Gemini generation: 0. Gemini metadata: 0. Migrasi, deployment, staging, commit dan push: 0.** Prompt/model/timeout/schema/kredensial/dependency tidak berubah. Pekerjaan berhenti pada M4.6; implementasi lokal menunggu review.
