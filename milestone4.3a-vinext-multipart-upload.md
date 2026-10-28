# M4.3a — Vinext Multipart Upload Compatibility

27 Oktober 2026 — **PASS**. Batas multipart 1 MiB yang memblokir upload M4.3 sudah teratasi melalui rilis upstream. **Generation Gemini nyata: 0; metadata nyata: 0.**

## Versi dan perubahan minimum

Vinext terpasang sebelumnya `1.0.0-beta.5`; target dan versi lokal sekarang **`1.3.0`**. Changelog menempatkan fix multipart pada 1.3.0: [PR #3905](https://github.com/cloudflare/vinext/pull/3905) melewati progressive Server Actions untuk Route Handler, dilengkapi [PR #4037](https://github.com/cloudflare/vinext/pull/4037) setelah resolusi route akhir. Keduanya tercantum pada [changelog resmi](https://github.com/cloudflare/vinext/blob/main/packages/vinext/CHANGELOG.md) dan [release notes 1.3](https://vinext.dev/blog/vinext-1-3).

Versi dipatok tepat, tanpa mengambil rilis 1.3.1. Peer wajib dari metadata npm Vinext 1.3.0 juga diperbarui:

| Paket | Sebelum | Sekarang |
| --- | --- | --- |
| `vinext` | 1.0.0-beta.5 | 1.3.0 |
| `@vitejs/plugin-rsc` | 0.5.26 | 0.5.37 |
| `react`, `react-dom`, `react-server-dom-webpack` | 19.2.6 | 19.3.1 |

File yang berubah: `ient-src/package.json`, `ient-src/package-lock.json`, dan regresi baru `ient-src/tests/multipart-upload.mjs`, ditambah laporan ini. Instalasi memakai npm/lockfile, tanpa `--force` atau pengabaian peer dependency. Vite 8.0.13 dan Cloudflare Vite plugin 1.37.1 tetap; tidak diperlukan migrasi plugin atau perubahan source aplikasi.

Tidak ada patch manual `node_modules`, perubahan konfigurasi Server Actions, atau kenaikan limit. Default Server Actions pada paket target tetap **1.048.576 byte**. Request multipart Route Handler kini dapat mengikuti jalur aplikasi yang benar.

## Hasil QA nyata

QA menggunakan salinan fisik source, D1/R2 baru, akun dan dokumen fiktif, serta API key Gemini kosong. Upload, penyimpanan dan download **tidak dimock**.

| Pemeriksaan | Hasil |
| --- | --- |
| PDF 2 MiB / 2.097.152 byte | POST multipart **200**, metadata D1 tersimpan, objek R2 dapat diunduh; SHA-256 identik dengan input. |
| PDF 10 MiB / 10.485.760 byte | POST multipart **200**, D1/R2/download identik; melewati batas lama framework. |
| Dua PDF tersebut → readiness | **200**, tepat **12.582.912 byte**, urutan/identitas sumber benar; tidak mengubah revisi, case atau Run. |
| Validitas fixture | `pypdf` strict, `pdfinfo`, dan render Poppler lulus: PDF 1.4, satu halaman terbaca, tanpa enkripsi/JavaScript. Padding berupa komentar PDF dengan offset xref dihitung ulang. Tidak ada library PDF yang ditambahkan ke aplikasi. |
| Upload >20 MiB | **400** dari batas upload aplikasi yang tetap; state tidak berubah. |
| File >10 MiB tetapi ≤20 MiB | Upload generik tetap diterima; readiness menolak **413 / DOCUMENT_TOO_LARGE**. |
| Gabungan >12 MiB | **413 / INPUT_TOO_LARGE**. |
| PDF invalid / duplikat | Ditolak oleh readiness; file hilang/kosong ditolak upload **400**. Upload dokumen generik tetap mendukung format lain. |
| Security/concurrency | Upload tanpa autentikasi **401**, cross-origin ditolak **403**, revisi lama **409**, case tidak tersedia **400**; download/readiness lintas owner ditolak. |
| Browser | Hidrasi/navigasi, pilihan 2+10 MiB, readiness nyata dan pergantian ID/EN lulus; console error kosong. Tombol generation tidak dijalankan. |

## Regresi dan integritas

- Root `npm run typecheck` dan `npm run lint`: **PASS** pada aplikasi lokal; 0 error, dua warning lama (`Case` tidak digunakan dan `location.assign` saat sesi tidak terautentikasi).
- Root `npm run build`: **PASS** di QA dengan source/package identik; 173 file aplikasi yang sudah ada dan file regresi baru cocok dengan lokal. Build menampilkan peringatan upstream dynamic import dan tip penggunaan `vite`; tidak memerlukan perubahan source.
- `multipart-upload.mjs` dan regresi HTTP `document-readiness.mjs`: **PASS**, termasuk original download, ownership, limit, state dan Run historis.
- `minimum-analysis.mjs` (**48 skenario mock**), `analysis-presentation.mjs` (**13 kelompok**), `localization.mjs`, dan `gemini-analysis.mjs`: **PASS** dengan dependency baru.

Baseline/final memastikan isi dan revisi **13 workspace asli identik**, hash runtime/dokumen dan secret tetap, seluruh source di luar daftar perubahan tetap identik, tujuh tracked deletion lama dan `doc/` terjaga, serta tidak ada staging. Database asli hanya dibaca melalui salinan privat; mutasi pengujian hanya di QA.

Model, prompt, kontrak Gemini, timeout, journal/idempotensi, Human Review, dan schema database tidak diubah. Tidak ada commit, push, deploy, migrasi atau M4.4. Server/tab QA sudah ditutup. Fixture dan hasil privat tetap di luar repository pada folder visualisasi tugas `m43a-validation`.

Jika dev server lokal lama masih berjalan, restart melalui `npm run dev` dan muat ulang browser agar memakai dependency baru. Verifikasi ini mencakup server development QA dan build produksi; tidak mencakup deployment atau generation Gemini nyata.
