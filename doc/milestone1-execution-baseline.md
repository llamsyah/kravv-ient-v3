# KRAVV-IENT V3 — Milestone 1: Execution Baseline

Tanggal verifikasi: 25 Oktober 2026 (Asia/Jakarta).

Milestone 1 selesai pada batas validasi di bawah. Implementasi berhenti pada stabilisasi; Milestone 2 belum dimulai.

## Tujuan produk yang dikunci

Company → Investment Case → Upload Documents → Automatic Text Extraction → Gemini Analysis → Saved Results → Human Review.

Manual Evidence tetap tersedia sebagai input tambahan, bukan prasyarat Gemini. Integrasi berikutnya harus dapat menganalisis teks dokumen hasil ekstraksi secara langsung bersama konteks Company dan Case. Ini menggantikan asumsi audit M0 bahwa pengguna harus mencatat evidence sebelum Gemini.

Ekstraksi dan Gemini belum diimplementasikan. Mesin saat ini tetap `rules-v1`.

## Berkas yang berubah

| Berkas | Perubahan |
| --- | --- |
| `package.json` | Setup, dev, typecheck, dan build menunjuk `ient-src`; menambahkan root lint. Dev meneruskan argumen seperti port QA. Typecheck tidak mengeluarkan berkas atau cache incremental. |
| `README.md` | Path source/runtime, perintah root, isolasi pengujian, dan tujuan produk yang disetujui. |
| `ient-src/README.md` | Setup/typecheck/lint, batas pengujian QA, referensi baseline, dan Evidence opsional untuk Gemini mendatang. |
| `ient-src/app/workspace.tsx` | Sinkronisasi ref melalui effect; inisialisasi async yang dibatalkan bila effect dibersihkan; helper efek browser untuk perubahan hash. Menghapus import dan helper yang tidak digunakan pada berkas yang sama. |
| `ient-src/tests/analysis-view.mjs` | Mengganti nama variabel lokal `module` menjadi `compiledModule`; isi assertions tetap. |
| `milestone1-execution-baseline.md` | Laporan hasil dan batas verifikasi ini. |

Tidak ada aturan lint yang dinonaktifkan. Perubahan hash tetap memakai operasi browser yang sama, dengan perilaku navigasi diperiksa di browser QA.

## Lingkungan dan isolasi

- Windows; Node.js `v24.15.0`, npm `11.12.1`.
- Source asli: `C:\Users\PIXWAR\OneDrive\Documents\CODE\KRAVV-IENT VC PROJECT`.
- Salinan QA: `C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\qa-m1`.
- Salinan mengambil berkas working tree yang dilacak dan masih ada, tanpa direktori source lama, Git, credential, environment file, database, atau dokumen runtime asli.
- Dependensi terpasang disalin secara independen ke QA, tanpa junction/symlink kembali ke aplikasi asli. Tidak ada instalasi atau upgrade dependensi pada checkout asli; lockfile tetap.
- Dev QA: `npm run dev -- --port 5187 --hostname 127.0.0.1` dari root QA. Registry/log runtime diarahkan secara eksplisit ke direktori QA.
- Uji API menggunakan `TEST_BASE_URL=http://127.0.0.1:5187` dan dijalankan dari subfolder aplikasi QA. Semua akun, kasus, dan upload baru merupakan data fiktif QA.
- Pembatasan koneksi lokal awal menyebabkan `EACCES`; server dan tes kemudian berhasil melalui izin eksekusi untuk koneksi loopback. Tidak ada perubahan konfigurasi keamanan aplikasi.
- Tidak menjalankan generator atau migrasi skema. Database QA kosong diinisialisasi oleh mekanisme lokal yang sudah ada.

## Hasil verifikasi

| Pemeriksaan | Hasil dan batas |
| --- | --- |
| Root setup | PASS untuk `npm run setup -- --dry-run --ignore-scripts --offline --cache .npm-cache` di QA; path prefix dan resolusi lockfile valid. Bukan bukti instalasi baru penuh dari registry. |
| `npm run typecheck` | PASS pada source asli, tanpa emit/incremental cache. |
| `npm run lint` | PASS pada source asli dan QA: 0 error, 2 warning. |
| `npm run build` | PASS di root QA, seluruh 5 tahap Vinext dan output tiga route. Ada warning informasional plugin timings. |
| `node tests/auth-access.mjs` | PASS: initialization, hash-only credential storage, device/session binding, recovery, sign-out, isolasi owner, origin/host/header guard, dan penolakan akses anonim. |
| Restart server nyata | PASS: server QA dihentikan, proses baru dijalankan pada port sama, lalu `node tests/auth-access.mjs --verify-restart` memulihkan identitas dan hash state workspace yang persis sama; probe dihapus oleh tes. |
| `node tests/workflow.mjs` | PASS: upload/download byte-identik, evidence, snapshot, disagreement, diligence, recommendation/decision terpisah, role gate, portfolio, monitoring, reload, riwayat keputusan, stale revision, dan isolasi dokumen antar-owner. |
| `node tests/analysis-workflow.mjs` | PASS: context, dua upload, mixed-status evidence, run kosong dan tiga run tersimpan, snapshot/review historis, diligence, role gate, reload, serta lima kasus fixture awal tidak berubah. |
| `node tests/analysis-view.mjs` | PASS: status grouping, evidence delta, snapshot isolation, dan atribusi diligence historis. |
| Browser QA | PASS: initialization lewat form, dashboard sesudah pemuatan async, buka kasus, tab Evidence dan URL hash, reload pada deep link, kembali ke Dashboard, browser Back, dan Ctrl+K. Pemeriksaan terarah ini bukan audit seluruh UI. |
| Preservasi runtime asli | PASS: himpunan path, ukuran, dan SHA-256 seluruh 16 berkas di `.wrangler` dan `.sites-runtime` asli identik sebelum/sesudah pengujian. Tidak menyalin atau menguji data bisnis asli. |
| Diff whitespace | PASS; tidak ada error whitespace. |

Warning lint yang dipertahankan:

1. Import tipe `Case` tidak digunakan pada API workspace; tidak disentuh untuk menjaga lingkup API.
2. Penggunaan `location.assign('/')` pada jalur 401 workspace; mempertahankan perilaku navigasi login yang ada.

## Source, data, dan perubahan Git yang dipertahankan

Tujuh tracked deletion yang sudah ada sebelum tugas tetap ada, seluruhnya di `KRAVV-IENT-Phase1-source`: `assistant-intents.ts`, `assistant-workspace.tsx`, `assistant.css`, `layout.tsx`, `workspace-shell.tsx`, `workspace.tsx`, dan `tests/assistant-intents.mjs`. Tidak dipulihkan, dihapus ulang, atau dipentaskan.

Direktori `doc/` tetap untracked dan tidak diedit. Dokumen current-state di dalamnya masih memuat checkpoint/path historis; README dan laporan ini mengidentifikasi baseline eksekusi saat ini tanpa mengubah dokumen pengguna tersebut.

Model, mesin `rules-v1`, fixtures, API workspace/dokumen, penyimpanan, skema, dan kode autentikasi tetap. Riwayat analisis/review/keputusan serta bisnis Portfolio tidak diubah. Tidak ada staging, commit, push, publikasi, atau deployment.

## Batas dan sisa pekerjaan

- Instalasi baru penuh memakai `npm run setup` dan unduhan registry belum diuji; dependensi terkunci yang tersedia disalin ke QA, lalu setup diperiksa dengan dry-run offline.
- Pengujian penuh menggunakan development server lokal. Worker produksi berhasil dibangun, tetapi login hosted dan runtime produksi tidak diuji pada milestone ini.
- Tidak mengimpor record legacy asli ke QA. Suite memeriksa penolakan owner legacy yang tidak ada; validasi isi akun legacy asli berada di luar batas isolasi ini.
- Pemeriksaan browser berfokus pada inisialisasi dan navigasi yang terdampak perubahan lint. Bukan sertifikasi seluruh browser, mobile, atau lingkungan managed-linux.
- Teks extraction, provenance dokumen untuk analisis langsung, kontrak Gemini, secret, timeout/idempotensi, serta label hasil nyata tetap pekerjaan milestone berikutnya yang memerlukan persetujuan terpisah.
- Artefak QA tetap terpisah untuk penelusuran; server dan tab QA dihentikan setelah validasi. Bukti uji API berada pada `ient-src/outputs` di salinan QA; screenshot navigasi bernama `browser-navigation.png`.

Milestone 1 tidak memiliki blocker pada validasi lokal yang dijalankan. Batas instalasi baru dan produksi di atas tetap eksplisit.
