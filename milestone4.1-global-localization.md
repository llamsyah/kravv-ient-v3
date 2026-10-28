# M4.1 — Global Localization & Language Switch

**Verdict: PARTIAL.** Implementasi dan seluruh uji fungsional lulus: UI aktif mendukung Bahasa Indonesia sebagai default dan English (US). Verifikasi kesamaan seluruh data bisnis asli belum dapat ditutup karena hash file SQLite asli berubah saat server asli tetap aktif. Tidak ada generation atau metadata Gemini nyata yang dilakukan oleh pekerjaan ini.

## File yang berubah

Semua path berikut relatif terhadap `ient-src/`:

| Kelompok | File |
| --- | --- |
| Fondasi baru | `lib/localization.mjs`, `lib/localization.d.mts`, `lib/localization-messages.json`, `app/localization.tsx` |
| Rendering awal dan sign-in | `app/layout.tsx`, `app/page.tsx`, `app/sign-in.tsx` (baru) |
| Workspace dan form | `app/workspace-shell.tsx`, `app/workspace.tsx`, `app/forms.ts`, `app/surface-ui.tsx`, `app/ui.tsx` |
| Analisis dan dokumen | `app/analysis-workspace.tsx`, `app/document-readiness.tsx`, `app/gemini-result.tsx`, `app/api/analysis/minimum/route.ts`, `app/api/documents/route.ts` |
| Access Gate lokal | `build/access-pages.mjs`, `build/access-gate.ts` |
| Kontrol dan layout | `components/ui/dialog.tsx`, `app/surface.css` |
| Tes | `tests/localization.mjs` dan `tests/localization-workflow.mjs` (baru), `tests/minimum-analysis.mjs` |

Laporan ini adalah file tambahan di root repository. Tidak ada dependensi baru.

## Arsitektur dan perilaku bahasa

Satu katalog terpusat menyimpan key berupa teks English yang terbaca dan padanan Indonesianya. `t(key, params)` bertipe mengikuti katalog, dengan placeholder, fallback yang terbaca, pemetaan label enum, serta error tersanitasi. `Intl` memformat tanggal dan angka; helper mata uang tersedia tanpa menafsirkan ulang nilai finansial tersimpan.

Preferensi browser disimpan pada cookie `kravv-locale` selama satu tahun, `Path=/`, `SameSite=Lax`, dan `Secure` pada HTTPS. Cookie hanya memuat `id-ID` atau `en-US`, tanpa secrets atau data bisnis. Cookie tidak valid/ambigu kembali ke Indonesian. Server membaca preferensi yang sama untuk HTML `lang`, metadata, dan initial React context, sehingga tidak membutuhkan pergantian bahasa sesudah hydration.

Switch **Indonesia / English** berada di header global, halaman autentikasi/loading, dan dialog aktif agar tetap dapat dijangkau saat modal terbuka. Perubahan langsung memperbarui UI dan `document.lang`, tanpa reload atau reset form. Label, aria-label, tombol penutup, dan validasi form mengikuti bahasa pilihan.

## Cakupan dan konten historis

Terjemahan mencakup navigasi, dashboard, perusahaan, Investment Case, dokumen/upload, evidence, analisis, histori Run, Human Review, due diligence, keputusan, portofolio, pengaturan, empty/loading states, pesan sukses/error, sign-in ChatGPT, serta tujuh tampilan Access Gate lokal. Penyesuaian CSS terbatas menjaga kontrol tetap terjangkau pada layar sempit; tabel dan tab dapat digulir horizontal secara sengaja.

Nama perusahaan/file, isi PDF, angka finansial asli, catatan pengguna, nama/teks Run, rationale review, dan teks aktivitas tersimpan **tidak diterjemahkan**. Karena itu konten historis berbahasa Inggris tetap dapat muncul di UI Indonesian. Label enum diterjemahkan tanpa mengubah value yang dikirim/disimpan. Istilah seperti Dashboard, Deal Flow, Investment Case, Evidence, Human Review, Due Diligence, ARR/MRR, dan identifier teknis sengaja dipertahankan jika relevan. Komponen library yang tidak digunakan bukan bagian layar aktif.

## Integrasi Gemini dan replay

Request baru Minimum AI mengirim `locale`, divalidasi menggunakan allowlist prompt yang sudah tersedia. Locale API yang hilang memakai `id-ID`; nilai eksplisit yang tidak didukung atau malformed ditolak. Locale menjadi bagian hash intent baru dengan penanda `intentVersion: locale-v1`.

Journal menyimpan bahasa, versi prompt, dan instruksi yang dibekukan. Journal v1/v2 lama tetap memakai hash lama dan respons aslinya; pergantian bahasa UI tidak menerjemahkan atau menggenerasi ulang Run. Pemeriksaan ulang request yang belum pasti mempertahankan locale awal dan menampilkannya di UI. Model `gemini-3.5-flash-lite`, prompt v2, native PDF, plaintext, limit, timeout 90 detik, autentikasi/ownership, persistence, dan implementasi structured lama tetap dipertahankan.

## Verifikasi

- Typecheck, lint, production build: **PASS**. Build memakai source aplikasi yang sama di QA terisolasi; dua warning lint lama tetap ada, tanpa error.
- Tes localization: **PASS** untuk default/allowlist/cookie, placeholder/fallback, format angka/tanggal/mata uang, seluruh konfigurasi form, tujuh halaman Access Gate, rendering bilingual, konten historis, dan cakupan literal UI aktif.
- **35 kelompok regresi Minimum AI PASS**, termasuk locale-aware idempotency, malformed input, replay journal v1/v2, timeout, persistence, reload, Human Review, dan histori. Regresi prompt v2 dan analysis view juga **PASS**.
- HTTP QA Workers/D1/R2: **PASS** untuk locale SSR, upload/download, error download bilingual, saved Run, reload, Human Review, ownership, dan autentikasi. Transport memakai respons QA nyata yang sudah direkam, tanpa meneruskan jaringan ke Google.
- Browser: ID → EN → ID dan reload **PASS**; nama perusahaan/draft, pilihan Seed/PDF, serta teks review bertahan. Pengiriman dari UI English teramati sebagai prompt `en-US` pada transport offline. Human Review disimpan lalu dimuat ulang tanpa generation baru. Desktop dan mobile diuji; pada viewport CSS mobile 390 px, halaman analisis tidak melebar setelah penyesuaian responsif. Tidak ada hydration error saat pengujian halaman stabil.

## Integritas dan batasan

Secrets/konfigurasi model, prompt builder, provider structured, dan perubahan Git sebelumnya tetap utuh. Dari 22 file runtime awal, 17 tetap identik, termasuk file R2/upload yang tercatat pada baseline. Empat file `.wrangler/registry/` dan satu file database D1 `.sqlite` memiliki hash berbeda. Server asli port 5173 terverifikasi sudah aktif sejak sebelum milestone; server tersebut tidak dihentikan. Asal perubahan SQLite belum dapat dipastikan sebagai metadata/checkpoint atau perubahan record. Baseline awal hanya memuat hash fisik sehingga kesamaan seluruh record bisnis tidak dapat dibuktikan.

Seluruh operasi tulis pengujian diarahkan ke QA port 5200 dengan folder D1/R2/auth terpisah. Pemeriksaan SQLite read-only tidak menemukan owner/fixture M4.1 di database asli. Tidak ada data asli yang dipulihkan, dihapus, atau ditimpa untuk memaksakan kecocokan hash. Tidak ada staging, commit, push, deployment, atau migrasi. Server QA dihentikan dan fake dev vars/transport sementara dihapus. Respons privat tetap di luar repository.

Dua file pendamping SQLite `-wal`/`-shm` yang belum ada pada baseline juga teramati selama pemeriksaan read-only. File tersebut dipertahankan; tidak dilakukan pembersihan runtime asli.

Preferensi berlaku untuk browser/perangkat ini, bukan sinkronisasi akun. Kepatuhan keluaran Gemini terhadap bahasa pilihan belum diuji melalui generation nyata. Uji browser menggunakan Chromium, bukan seluruh kombinasi browser/perangkat. String protokol API/log tetap stabil; pesan yang ditampilkan UI dilokalkan. Perubahan katalog yang juga digunakan Access Gate dapat memicu restart Vite saat development; restart `npm run dev` dan reload sekali bila aplikasi sedang terbuka ketika source diperbarui.

Untuk menutup keterbatasan integritas, diperlukan pembandingan record terhadap backup/logical snapshot sebelum milestone. Tidak ada klaim bahwa perubahan hash SQLite membuktikan kehilangan data; penyebab dan kesamaan record tetap belum terverifikasi.

Berhenti setelah M4.1; tidak ada milestone lanjutan yang dijalankan.
