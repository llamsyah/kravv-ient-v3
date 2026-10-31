# Milestone 3.1a — Workers Fetch Fix & Live Retest

26 Oktober 2026 (Asia/Jakarta). **Verdict keseluruhan: PARTIAL.** Perbaikan dan validasi offline lulus; acceptance Gemini nyata gagal karena provider mengembalikan HTTP 503. Tidak ada retry.

## 1. Perubahan kode

- `ient-src/lib/gemini-provider.server.ts:66` dan `:70`: kedua request memakai `redirect: 'manual'`.
- `ient-src/lib/gemini-provider.server.ts:41`: penolakan eksplisit seluruh HTTP 300–399 melalui `PROVIDER_REDIRECT` / HTTP aplikasi 502. Respons redirect tidak diikuti, body dibatalkan melalui penanganan non-success yang sudah ada, dan credential tidak diteruskan ke tujuan redirect.
- `ient-src/tests/gemini-analysis.mjs`: transport tes memastikan kedua request memakai mode `manual`.
- `ient-src/tests/gemini-workers.mjs` (baru): regresi pada workerd asli dengan semua koneksi keluar ditangani handler tes lokal.

Timeout, batas request/response, autentikasi, validasi sumber/Zod, persistence dan sanitasi error lain tetap dipertahankan. Tidak ada dependency baru, schema migration atau refactor modul lain.

## 2. Regresi redirect

**Lulus 20 kasus**: metadata dan generation masing-masing diuji dengan status 300, 301, 302, 303, 304, 305, 306, 307, 308, 399. Semuanya menghasilkan `PROVIDER_REDIRECT`; tidak ada akses ke tujuan redirect atau penerusan credential. Respons tidak membocorkan body, lokasi redirect atau key dummy.

Kasus sukses dengan native fetch workerd juga lulus. Suite ini sepenuhnya offline terhadap Google, menggunakan fixture dan key dummy; tidak menghabiskan jatah generation nyata.

## 3. Validasi offline

| Pemeriksaan | Hasil |
| --- | --- |
| Root `npm run typecheck` | PASS |
| Root `npm run lint` | PASS: 0 error, 2 warning lama |
| Root `npm run build`, pada salinan QA dengan adapter asli | PASS |
| `gemini-analysis.mjs`, `gemini-workers.mjs` | PASS |
| `document-input.mjs`, `analysis-view.mjs` | PASS |
| `auth-access.mjs`, termasuk verifikasi setelah restart | PASS |
| `workflow.mjs`, `analysis-workflow.mjs`, `document-readiness.mjs` | PASS |

Regresi HTTP menggunakan D1/R2 dan akun fiktif QA tanpa key Gemini. Upload/download, multi-PDF, ownership, snapshot historis, review serta workflow lama lulus. Dua warning lama tetap terkait import `Case` yang tidak dipakai dan navigasi login `location.assign`; tidak dinonaktifkan atau diubah.

## 4. Ketersediaan model dan isolasi

Model tetap **`gemini-3.8-flash`**. GET metadata resmi memakai key pengguna menghasilkan **HTTP 200**, mendukung `generateContent`. GET metadata melalui adapter Workers yang diperbaiki juga menghasilkan **HTTP 200**.

QA baru berada di `C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\qa-m31a`, menggunakan port 5193, marker QA yang sesuai, serta runtime baru tanpa data/credential bisnis asli. Dependency yang sudah tersedia disalin tanpa instalasi.

Script `tests/gemini-live.mjs` tetap tidak diubah, dijalankan dengan opt-in dan adapter asli. Pengamatan transport khusus QA meneruskan native fetch tanpa mengganti respons, menghitung panggilan, dan mencatat status serta hash/ukuran PDF. Key dan isi PDF tidak dicatat. Adapter QA dipulihkan setelah pengujian.

## 5. Jumlah generation dan hasil live

**Tepat 1 request nyata `generateContent` dikirim.** Tidak ada retry atau pergantian model.

PDF fiktif `fictional-live.pdf`, 799 byte, dikirim sebagai native inline PDF. Hash payload cocok dengan fixture dan byte tersimpan di R2 QA:

`359ee6c56bfa6d42ea03ca44528318ddefea41cffa4a6fdeac0fc9f16c4eb1c5`

Google mengembalikan **HTTP 503 / `UNAVAILABLE`** dengan pesan tersanitasi:

> This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.

Endpoint aplikasi mengembalikan **HTTP 502 / `PROVIDER_ERROR`**, sesuai pemetaan error yang sudah ada. Klasifikasi: ketidaktersediaan sementara provider karena permintaan tinggi. Tidak ada bukti bahwa kegagalan disebabkan PDF, schema output, atau kuota. Metadata sukses tidak membuktikan billing tier atau sisa kuota.

## 6. Persistence dan Human Review

Kasus fiktif: `CASE-2026-A4CE69FD`. Pemeriksaan D1 QA setelah kegagalan menunjukkan satu dokumen, **0 Run dan 0 Review**; jurnal R2 berstatus `failed`. Tidak ada hasil parsial.

PDF berhasil dikirim, tetapi belum ada output model untuk validasi JSON/Zod, penilaian atribusi sumber, penyimpanan provenance/token usage pada Run, reload hasil nyata, atau Human Review terhadap Run nyata. Semua tahap tersebut **belum lulus acceptance live**. Regresi offline tidak digunakan sebagai pengganti bukti live.

## 7. Perlindungan data dan credential

Hash 16 berkas runtime asli tidak berubah. Sebanyak 27 berkas terlindungi, termasuk schema, storage, autentikasi, endpoint dokumen/workspace dan `doc/`, tetap sama. Perubahan source sejak M3.1 hanya adapter, satu assertion tes lama, dan tes workerd baru. Perubahan Git sebelumnya terjaga; staging kosong.

Key asli tidak ditimpa dan tetap berada di `.dev.vars` yang diabaikan Git. Key serta isi PDF yang diperiksa tidak ditemukan dalam log QA; bundle client juga diperiksa. Server QA dihentikan dan secret sementara QA dihapus. Tidak ada commit, push, deployment, perubahan billing/kuota, atau pekerjaan Milestone 4.

## 8. Verdict dan tindak lanjut

**PARTIAL:** fix Workers dan seluruh validasi offline PASS; acceptance live **FAIL karena HTTP 503 provider**. Tidak ada perubahan source lanjutan untuk mengatasi respons tersebut.

Langkah berikut terkecil adalah satu retest terisolasi pada model yang sama ketika tersedia, hanya setelah otorisasi baru. Jangan mengulang request otomatis atau menganggap Run/review nyata telah terbukti.

Bukti pada root QA: `offline-validation.json`, `metadata-preflight.json`, `final-live-outcome.json`, `preservation-final.json`, `source-changes-from-m31.json`. Hasil script dan pemeriksaan D1 tersedia di `ient-src/outputs` QA. Log hanya digunakan sebagai bukti lokal yang telah diperiksa.
