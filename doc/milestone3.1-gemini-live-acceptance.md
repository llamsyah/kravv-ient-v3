# Milestone 3.1 — Gemini Live Acceptance Test

Tanggal: 26 Oktober 2026 (Asia/Jakarta). **Verdict: BLOCKED.**

Preflight model menggunakan key lokal berhasil, tetapi workflow aplikasi terhenti oleh ketidakcocokan opsi `fetch` dengan Cloudflare Workers. **Jumlah permintaan nyata `generateContent`: 0.** PDF belum dikirim ke Google dan acceptance end-to-end belum lulus. Tidak dilakukan retry analisis, pergantian model, atau perubahan billing/kuota.

## Ringkasan hasil

| Pemeriksaan | Hasil terverifikasi |
| --- | --- |
| Model yang dikonfigurasi | `gemini-3.8-flash`; tidak diganti. |
| Model metadata resmi dengan key pengguna | HTTP **200**, nama `models/gemini-3.8-flash`, metadata version `3.0`. |
| Dukungan `generateContent` | Terdaftar dalam `supportedGenerationMethods`, bersama `countTokens`, `createCachedContent`, `batchGenerateContent`. |
| PDF dan structured output | Didukung menurut dokumentasi resmi model; penerimaan payload nyata belum diuji. |
| Percobaan analisis melalui aplikasi | **1** POST ke endpoint aplikasi, menggunakan script live yang sudah ada. |
| Generation nyata | **0** POST ke Google `:generateContent`. |
| Hasil endpoint aplikasi | HTTP **502**, kode `PROVIDER_UNAVAILABLE`. |
| Status HTTP Google dari adapter Workers | Tidak ada: runtime melempar TypeError sebelum HTTP metadata dikirim. |
| Structured JSON / Zod hasil nyata | Belum tercapai. |
| Run Gemini tersimpan / reload | Tidak ada Run Gemini tersimpan; D1 QA menunjukkan 0 run pada kasus uji. Reload Run nyata belum dapat dinilai. |
| Human Review untuk Run Gemini nyata | Belum dapat diuji karena Run nyata belum terbentuk. Bukti mock M3 tidak dihitung sebagai acceptance live. |
| Mutu analisis / atribusi sumber | Belum dapat dinilai karena tidak ada output model. |

Metadata model mengonfirmasi akses dan method generation pada akun ini. Dukungan input PDF dan structured output dirujuk dari [dokumentasi resmi model](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash); metadata GET tidak membuktikan bahwa payload PDF/JSON Schema aplikasi telah diterima. Angka kuota, billing tier dan keberhasilan generation tidak disimpulkan dari HTTP 200 metadata. Endpoint GET mengikuti [referensi Models API](https://ai.google.dev/api/models).

## Preflight credential dan isolasi

Pada pemeriksaan awal, key tersimpan pada `ient-src/.dev.vars.example`. Key dipindahkan secara lokal ke `ient-src/.dev.vars` dengan copy eksklusif, kemudian nilai key pada template dikosongkan. Pilihan model dipertahankan. `.dev.vars` terkonfirmasi diabaikan Git dan tidak tercatat sebagai tracked file. Key tidak ditampilkan pada terminal, chat, source adapter, laporan, atau hasil metadata.

QA baru dibuat di:

`C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\qa-m31`

Server hanya menggunakan `127.0.0.1:5191`, sesuai `qa-origin.json`. Source disalin tanpa `.wrangler`, `.sites-runtime`, secret, output, atau data bisnis asli. Dependency disalin dari QA M3 yang sudah ada; tidak menjalankan instalasi dependency. D1, R2, registry akses dan signing key QA dibuat baru. Hanya dua setting Gemini yang diperlukan dimuat ke file secret sementara QA.

`tests/gemini-live.mjs` tidak diubah dan dijalankan dengan `GEMINI_LIVE_TEST=1` serta `TEST_BASE_URL` yang sesuai marker. QA memakai adapter asli yang identik dengan source. Pengamatan transport khusus QA meneruskan panggilan ke adapter asli dan native `fetch` tanpa mengganti respons; tidak ada provider mock. Pengamatan hanya mencatat method, jumlah generation, status HTTP dan hash/ukuran PDF bila mencapai POST. Guard pengamatan menolak generation kedua sebelum network.

Setelah pengujian, server QA dihentikan, adapter QA dikembalikan ke salinan asli, dan file secret sementara QA dihapus. Key asli tetap tersedia pada `.dev.vars` lokal yang diabaikan Git.

## Urutan percobaan dan penyebab kegagalan

1. GET metadata resmi dari proses preflight berhasil dengan HTTP 200. Belum ada generation pada tahap ini.
2. Script live membuat workspace, Company dan Investment Case fiktif, lalu mengunggah PDF fiktif 799 byte tanpa Evidence manual. Kasus QA: `CASE-2026-42E68D15`.
3. Endpoint aplikasi memvalidasi request, identitas, kasus dan input PDF, lalu membuat jurnal permintaan pada R2 QA.
4. Adapter mencoba GET metadata menggunakan `redirect: 'error'`. Workers melempar TypeError sebelum mengirim HTTP. Tidak mencapai POST generation.
5. Endpoint aplikasi mengembalikan error tersanitasi: `The Gemini connection failed. No automatic retry was made.` dengan HTTP 502 / `PROVIDER_UNAVAILABLE`.
6. Script live berakhir gagal. Tidak dijalankan ulang. Diagnostik lanjutan hanya mengakses halaman QA lokal, tanpa key atau koneksi Gemini.

Lokasi penyebab pada source: `ient-src/lib/gemini-provider.server.ts:65` dan `:69`. Kedua panggilan provider memakai `redirect: 'error'`.

Pada instance workerd sementara, GET halaman QA lokal dengan opsi tersebut menghasilkan TypeError yang menyatakan hanya `follow` atau `manual` didukung. GET lokal yang sama dengan `redirect: 'manual'` menghasilkan HTTP 200. Ini mengisolasi ketidakcocokan runtime tanpa menambah permintaan ke Google. [Dokumentasi Cloudflare Request](https://developers.cloudflare.com/workers/runtime-apis/request/) juga menyatakan mode `error` tidak diimplementasikan dan melempar TypeError saat konstruksi Request.

**Klasifikasi:** blocker kompatibilitas runtime pada adapter, sebelum HTTP provider. Tidak ada respons Google yang dapat diklasifikasikan sebagai quota exhaustion, penolakan credential, unsupported PDF, atau invalid model output. Pemeriksaan metadata yang sukses juga tidak membuktikan kuota generation tersedia.

Error aplikasi saat ini menyederhanakan TypeError tersebut menjadi `PROVIDER_UNAVAILABLE`. Pesan itu aman terhadap kebocoran detail, tetapi kurang spesifik untuk diagnosis runtime.

## Verifikasi sesudah kegagalan

| Aspek | Hasil |
| --- | --- |
| PDF pada R2 QA | Ditemukan byte yang sama persis dengan fixture `fictionalPdf()`, ukuran 799 byte. |
| PDF SHA-256 | `359ee6c56bfa6d42ea03ca44528318ddefea41cffa4a6fdeac0fc9f16c4eb1c5` |
| Dokumen pada D1 QA | Satu `fictional-live.pdf` pada kasus uji. |
| Run/review parsial | 0 run dan 0 review pada kasus uji, dikonfirmasi melalui pembacaan D1 QA. |
| Jurnal R2 QA | Status `failed`, kode `PROVIDER_UNAVAILABLE`; tidak ada hasil generation yang disimpan. |
| Akses anonim | Download dokumen dan endpoint analisis ditolak HTTP 401. |
| Akses pemilik lain | Download dokumen kasus uji dan endpoint analisis ditolak HTTP 404. Permintaan ditolak sebelum provider. |
| Akses file secret lewat HTTP | `.dev.vars` dan path `/@fs/.../.dev.vars` ditolak 403; isi key tidak terkirim. |
| Log QA yang diperiksa | Key tidak ditemukan dalam `server.log` atau `live-test.log`; baris isi PDF fiktif yang diperiksa tidak muncul. |
| Historis `rules-v1` | Implementasi fungsi tidak berubah dibanding HEAD; `tests/analysis-view.mjs` lulus. Tidak mengklaim ulang seluruh suite M3. |
| Pemeriksaan tipe pada QA | Lulus, termasuk instrumentasi pengamatan khusus tes. |
| Data asli | SHA-256 16 berkas runtime asli sama dengan snapshot awal M3.1. Tidak ada perubahan database, blob, registry credential atau signing key asli yang diperiksa. |
| Source/Git | Source aplikasi sama dengan salinan awal QA setelah pemulihan adapter; status Git lama tetap sama sebelum penambahan laporan ini, staging kosong. |

Tidak ada schema migration, perubahan fitur, refactor, commit, push, deployment, atau aktivasi billing. Pemindahan credential dari template ke file ignored merupakan penataan secret lokal; konfigurasi model dan nilai key dipertahankan.

## Penilaian kualitas

- **Keberhasilan teknis:** preflight model, pembuatan kasus/dokumen QA, autentikasi/ownership, serta kegagalan tanpa Run parsial terverifikasi. Jalur generation → hasil tersimpan → reload → review belum terverifikasi.
- **Kualitas output:** belum dapat dinilai. Dokumen fiktif menyatakan ARR USD 100.000 dan 12 pelanggan, dengan retention/margin/konsentrasi pelanggan belum diberikan; belum ada respons model untuk dibandingkan.
- **Kualitas atribusi sumber:** belum dapat dinilai; tidak ada referensi hasil nyata untuk divalidasi. Lolos schema pada tes mock sebelumnya tidak membuktikan akurasi faktual atau dukungan sumber pada hasil live.
- **Provenance/token usage:** metadata sumber input tersedia pada QA, tetapi belum ada Run nyata untuk memverifikasi penyimpanan identitas provider, prompt version, ETag dan token usage pada hasil generation.

## Koreksi minimum yang direkomendasikan — belum diterapkan

1. Ganti dua opsi `redirect: 'error'` menjadi `redirect: 'manual'` pada GET metadata dan POST generation. Tetap tolak respons redirect/HTTP non-success; jangan mengikuti redirect atau meneruskan key ke tujuan lain. Pemeriksaan `response.ok` yang sudah ada menolak status 3xx.
2. Tambahkan regresi yang berjalan pada Workers/workerd dan memeriksa redirect ditolak tanpa mengikuti tujuan. Mock berbasis Node pada M3 tidak mendeteksi perbedaan runtime ini.
3. Setelah koreksi ditinjau dan diotorisasi, jalankan lagi acceptance terisolasi dengan maksimum satu generation nyata. Request ID yang sudah memiliki jurnal `failed` akan mengembalikan kegagalan tersimpan; percobaan baru perlu dipilih secara eksplisit. Jangan menganggap retry ID lama akan menjalankan model.

Tidak ada koreksi source atau pengulangan analisis dilakukan pada milestone verifikasi ini. Tidak memulai Milestone 4.

## Bukti lokal

Di root QA: `metadata-preflight.json`, `runtime-redirect-check.json`, `final-outcome.json`, `preservation-final.json`, serta log yang sudah diperiksa.

Di `ient-src/outputs` QA: `gemini-live-validation.json`, `live-acceptance-supplement.json`, `qa-case-after-failure.json`, `security-after-failure.json`.

Field `attempted: true` pada laporan script lama berarti endpoint analisis aplikasi dicoba. Itu **bukan bukti** bahwa generation dikirim: observasi transport pada uji ini menunjukkan **0** POST `generateContent` dan hanya percobaan GET Workers yang gagal sebelum network.

**Verdict akhir: BLOCKED — preflight akun/model berhasil, tetapi implementasi belum dapat menjalankan acceptance Gemini nyata pada runtime Workers saat ini.**
