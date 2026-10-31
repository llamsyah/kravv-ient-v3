# Milestone 3 — Integrasi Analisis Gemini

Tanggal verifikasi: 26 Oktober 2026. Implementasi terbatas pada Milestone 3.

**Status: implementasi dan validasi mock selesai. Uji Gemini nyata TERTUNDA sesuai instruksi pengguna karena secret belum siap. Tidak ada klaim bahwa permintaan ke Gemini, akses model pada akun, atau kuota akun telah berhasil diverifikasi.**

## 1. Perubahan berkas

Semua jalur berikut relatif terhadap root repository. Working tree sudah berisi hasil Milestone 1/2 dan perubahan pengguna sebelum M3; daftar ini membedakan lingkup M3 dari perubahan terdahulu.

| Berkas | Perubahan M3 |
| --- | --- |
| `ient-src/lib/gemini-provider.server.ts` (baru) | Adapter REST Gemini di server: PDF inline, pengecekan akses model, batas payload, timeout, parsing dan validasi respons. |
| `ient-src/lib/gemini-analysis.ts` (baru) | Kontrak input provenance/output, Zod, JSON Schema, kode error, versi prompt. |
| `ient-src/lib/gemini-run.server.ts` (baru) | Orkestrasi autentikasi, persiapan PDF M2, snapshot, jurnal permintaan R2, penyimpanan Run dengan pemeriksaan revision. |
| `ient-src/app/api/analysis/gemini/route.ts` (baru) | Endpoint POST dengan pemeriksaan origin, respons privat tanpa cache, dan error tersanitasi. |
| `ient-src/lib/model.ts` | Tambahan tipe opsional `Run.gemini` dan `Finding.documentIds`; implementasi `rules-v1` tidak berubah. |
| `ient-src/app/analysis-workspace.tsx` | Aksi Gemini terpisah, pemilihan PDF, status proses/error, identitas retry, hasil dan navigasi ke review. |
| `ient-src/app/document-readiness.tsx` | Komponen M2 menerima pilihan dokumen dari Analysis; pemeriksaan readiness tetap opsional. |
| `ient-src/app/gemini-result.tsx` (baru) | Business overview, risiko, informasi kurang, pertanyaan diligence, sumber dan provenance. |
| `ient-src/app/workspace.tsx` | Pemanggilan endpoint Gemini, penerapan state tersimpan, reload saat konflik, label yang membedakan simulasi/Gemini. |
| `ient-src/cloudflare-env.d.ts` | Tipe binding secret/model opsional. |
| `ient-src/.gitignore`, `ient-src/.dev.vars.example` (baru) | Secret lokal diabaikan Git; contoh konfigurasi tanpa key. |
| `ient-src/tests/gemini-analysis.mjs` (baru) | Uji adapter dan layanan dengan provider/persistence tiruan di memori. |
| `ient-src/tests/gemini-workflow.mjs` (baru) | Regresi HTTP pada QA terisolasi dengan adapter tiruan eksplisit. |
| `ient-src/tests/fixtures/gemini-provider.mock.ts.fixture` (baru) | Fixture adapter yang hanya dipasang pada salinan QA; tidak diimpor aplikasi. |
| `ient-src/tests/fictional-pdf.mjs` (baru) | PDF startup fiktif untuk QA. |
| `ient-src/tests/gemini-live.mjs` (baru) | Uji opt-in satu permintaan analisis nyata, belum dijalankan. |
| `README.md`, `ient-src/README.md`, laporan ini | Konfigurasi, kontrak, hasil validasi dan batas kemampuan. |

Tidak ada dependency baru, migrasi SQL, perubahan parser PDF, atau perubahan API upload/download. `analysis.css`, skrip root, tes analysis-view, dan modul document-input termasuk pekerjaan M1/M2 yang telah ada. Tujuh tracked deletions pada direktori lama serta `doc/` tetap dipertahankan; tidak direstore, dihapus, distage, atau dicommit otomatis.

## 2. Provider dan konfigurasi

Adapter menggunakan `fetch` bawaan runtime Workers dan `node:buffer` yang sudah didukung konfigurasi `nodejs_compat`. Tidak menambahkan SDK, PDF parser, OCR, Files API upload, RAG atau indexing.

Konfigurasi lokal: salin `.dev.vars.example` menjadi `ient-src/.dev.vars` **hanya jika file tujuan belum ada**, isi key secara privat, lalu restart server. Jangan menimpa secret yang sudah ada atau menempelkan key ke chat. Untuk lingkungan hosted, binding server yang setara perlu disediakan terpisah; deployment tidak dilakukan.

| Binding | Perilaku |
| --- | --- |
| `GEMINI_API_KEY` | Wajib untuk permintaan baru; hanya dibaca di server. Tidak tersedia menghasilkan HTTP 503 `MISSING_API_KEY`. |
| `GEMINI_MODEL` | Opsional; default `gemini-3.8-flash`. Menerima ID model tanpa prefiks `models/`. |

Model default tercantum sebagai stable di [katalog resmi model](https://ai.google.dev/gemini-api/docs/models). [Harga resmi](https://ai.google.dev/gemini-api/docs/pricing) mencantumkan free-tier input/output untuk model tersebut. Itu tidak membuktikan eligibility, billing tier, atau sisa kuota project pengguna; [batas akun/project](https://ai.google.dev/gemini-api/docs/rate-limits) tetap harus diperiksa ketika secret tersedia.

Adapter melakukan GET metadata `https://generativelanguage.googleapis.com/v1beta/models/{model}` untuk memeriksa akses dan dukungan `generateContent`, lalu paling banyak satu POST ke endpoint yang sama dengan akhiran `:generateContent`. Key dikirim melalui header `x-goog-api-key`, bukan URL atau prompt. Tidak ada retry otomatis, perpindahan model, tools, atau external grounding. GET metadata bukan permintaan generation. Dukungan PDF/structured output model mengacu pada dokumentasi; pemeriksaan akun dan penerimaan payload nyata masih tertunda. Lihat [referensi API resmi](https://ai.google.dev/api/generate-content).

PDF asli dikirim sebagai `inlineData` dengan MIME `application/pdf`, disertai ID dan filename. Pendekatan ini mengikuti [native document understanding](https://ai.google.dev/gemini-api/docs/document-processing). Tidak ada salinan PDF tambahan di storage.

### Batas yang diterapkan

| Komponen | Batas |
| --- | --- |
| PDF M2 | 1–5 file; maksimum 10 MiB per file dan 12 MiB gabungan. |
| Company/Case/metadata/Evidence | Maksimum 128 KiB saat diserialisasi. |
| Body provider | Maksimum 20.000.000 byte UTF-8, termasuk base64, metadata, schema dan instruksi. |
| Waktu provider | Deadline total 90 detik untuk metadata dan generation. |
| Respons provider | Maksimum 256 KiB; metadata model maksimum 64 KiB. |
| Generation | `responseMimeType: application/json`, `responseJsonSchema`, `maxOutputTokens: 8192`, temperature 0.2. |
| Jurnal Run R2 | Maksimum 512 KiB untuk hasil yang akan disimpan. |

Base64 dihitung dengan `4 * ceil(byteLength / 3)` per file. Untuk batas 12 MiB, ukurannya sekitar 16,78 MB ditambah padding per file. Adapter memeriksa ukuran body final setelah seluruh bagian digabungkan. Batas aplikasi 20 MB konservatif terhadap panduan [inline file input](https://ai.google.dev/gemini-api/docs/file-input-methods); acceptance payload maksimum pada provider dan penggunaan memori Workers belum diuji secara live.

## 3. Kontrak input/output

### Endpoint aplikasi

`POST /api/analysis/gemini`, menggunakan identitas workspace yang sudah ada:

```json
{
  "caseId": "ID kasus yang dimiliki pengguna",
  "name": "Due Diligence",
  "documentIds": ["ID PDF pertama", "ID PDF kedua"],
  "requestId": "UUID unik untuk satu niat permintaan",
  "revision": 12
}
```

Body menggunakan validasi strict. ID dokumen harus unik. Server memanggil ulang `prepareCasePdfInput({caseId, documentIds})`; hasil readiness browser tidak dianggap bukti otorisasi. Seluruh dokumen harus tercatat pada kasus milik identitas aktif, tersedia di R2, sesuai ukuran, memiliki nama `.pdf` dan envelope PDF yang lolos pemeriksaan M2. Endpoint tidak menerima PDF bytes, storage key, atau identitas pemilik dari browser.

Input model mencakup Company, konteks Case (`name`, `stage`, `investmentStage`, `thesis`, `strategy`, `roundSize`, `checkSize`, `valuation`, `source`, `lead`, `notes`), `analysisContext` dari pilihan pengguna, PDF asli dengan metadata sumber, dan snapshot Evidence opsional. Nol Evidence diperbolehkan. Snapshot Company/Case, revision, ID sumber, filename, ukuran, metadata unggah dan ETag dipertahankan pada Run.

Respons sukses: `{state, runId, reused}`. State berasal dari penyimpanan yang dikonfirmasi. Error: `{code, error}` tanpa respons mentah provider atau credential. Kode mencakup `MISSING_API_KEY`, `MODEL_UNAVAILABLE`, `CREDENTIALS_REJECTED`, `QUOTA_EXCEEDED`, `TIMEOUT`, `PROVIDER_ERROR`, `INVALID_RESPONSE`, `INCOMPLETE_RESPONSE`, `INVALID_SOURCES`, `REVISION_CONFLICT`, dan kegagalan dokumen M2.

### Output model

| Field | Isi dan batas validasi server |
| --- | --- |
| `executiveSummary`, `businessOverview` | Masing-masing 1–4.000 karakter. |
| `findings` | 1–10 item: `observation` (1.500), `interpretation` (2.000), `uncertainty` (1.000), `counterargument` (1.200), `documentIds`, `evidenceIds`. |
| `risks` | Maksimum 8 item: `description` (1.500), `uncertainty` (1.000), `documentIds`. |
| `missingInformation` | Maksimum 8 string, masing-masing 1–1.000 karakter. |
| `diligenceQuestions` | Maksimum 8 item: `question` (1.000), `documentIds`. |

Field string wajib tidak boleh kosong. Setiap daftar referensi dibatasi 5 document IDs atau 50 evidence IDs. Zod menolak properti/struktur yang tidak sesuai. Semua ID sumber harus berasal dari input permintaan; ID rekaan ditolak sebelum penyimpanan. Respons generation harus selesai dengan `finishReason: STOP`; respons terpotong/terblokir tidak menjadi Run parsial.

Instruksi sistem membedakan fakta yang dilaporkan sumber, interpretasi, ketidakpastian dan counterargument; melarang fabrikasi metrik/sumber dan keputusan investasi mandiri. Konten dokumen/context diperlakukan sebagai data tidak tepercaya. Validasi bentuk dan ID tidak membuktikan kebenaran klaim atau bahwa kutipan benar-benar mendukung kesimpulan. Human Review tetap diperlukan.

## 4. Penyimpanan dan kompatibilitas historis

Run baru memiliki ID `GEMINI-{requestId}`, `simulated: false`, versi `gemini:{modelVersion}:vc-pdf-v1`, Finding yang kompatibel, snapshot Evidence, serta `gemini` berisi result/provenance/model/prompt version/token usage jika tersedia. Case, run, review, recommendation, decision dan activity terdahulu tidak direwrite. Human Review tetap merujuk `runId` melalui mekanisme lama. `rules-v1` dan fixture historis tetap tersedia sebagai simulasi terpisah.

Penyimpanan menggunakan JSON workspace pada D1 yang sudah ada, dengan field tambahan opsional. Tidak mengubah schema SQL atau memigrasi record lama. Snapshot menyimpan metadata dan ETag, bukan PDF bytes atau base64. Download tetap melalui endpoint dokumen yang sudah terautentikasi; tautan tidak menjadi public URL.

Untuk melindungi permintaan yang mungkin berbayar, R2 yang sudah ada menyimpan jurnal JSON kecil pada `{owner}/analysis-requests/{requestId}.json`. Claim conditional `If-None-Match: *` membatasi satu generation untuk request ID yang sama, termasuk permintaan paralel. Mekanisme ini mengikuti [conditional R2 put](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) dan telah diuji pada R2 lokal melalui HTTP.

Hasil valid ditulis sebagai jurnal `ready` sebelum penyimpanan D1 dengan compare-and-swap revision. Jika workspace berubah saat model berjalan, server menolak save dengan HTTP 409 dan mempertahankan hasil dari snapshot asli. Setelah reload, retry **ID yang sama** memakai revision terbaru untuk menyimpan hasil itu tanpa generation ulang. Jika respons save hilang, server mencari Run yang sudah tersimpan untuk mencegah duplikasi. D1 adalah sumber kebenaran keberhasilan save.

UI mempertahankan request ID pada ref dan secara best effort pada sessionStorage, sehingga retry setelah respons tidak pasti dapat memeriksa/save permintaan yang sama. Penyimpanan browser hanya berisi identitas permintaan dan pilihan konteks/ID dokumen. Pilihan PDF perlu dipilih kembali setelah reload. Aksi eksplisit memulai request baru memberi tahu bahwa pemanggilan provider lain dapat terjadi. Tidak ada retry provider otomatis.

Keterbatasan crash: jurnal yang berhenti pada `started` tidak dapat memulihkan respons provider yang belum tersimpan. Retry ID yang sama tidak melakukan generation ulang; pengguna harus memilih request baru secara eksplisit. Ini belum merupakan sistem pekerjaan durable, dan jurnal belum memiliki kebijakan retensi/cleanup.

## 5. Hasil validasi

QA menggunakan salinan source terpisah di `C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\qa-m3`, port 5189, dengan D1, R2, Access Gate, secret dummy, akun dan PDF fiktif sendiri. Runtime/credential workspace asli tidak disalin. Dependency yang sudah tersedia digunakan kembali melalui salinan QA, tanpa pemasangan dependency baru. Server QA telah dihentikan dan adapter aslinya dipulihkan setelah uji mock.

| Pemeriksaan | Hasil |
| --- | --- |
| Root `npm run typecheck` | Lulus. |
| Root `npm run lint` | Lulus: 0 error, 2 warning lama. |
| Root `npm run build` pada salinan QA dengan adapter asli | Lulus, termasuk route `/api/analysis/gemini`. |
| `tests/gemini-analysis.mjs` | Lulus dengan transport/provider/persistence tiruan; tidak mengakses Google. |
| `tests/gemini-workflow.mjs` | Lulus HTTP + D1/R2 lokal dengan fixture provider tiruan eksplisit. |
| `tests/auth-access.mjs` dan `--verify-restart` setelah restart QA | Lulus. |
| `tests/workflow.mjs`, `tests/analysis-workflow.mjs`, `tests/analysis-view.mjs` | Lulus; workflow historis dan snapshot lama dipertahankan. |
| `tests/document-input.mjs`, `tests/document-readiness.mjs` | Lulus; termasuk multi-PDF, ownership, format/availability, metadata dan byte download. |
| Adapter asli tanpa key melalui HTTP | Lulus: 503 `MISSING_API_KEY`, state workspace tidak berubah, tidak ada panggilan provider. |
| Browser QA dengan provider tiruan | Lulus: pilih PDF tanpa Evidence, simpan hasil, tambah review, reload dan buka Run/review yang sama; tidak ada console error/warning yang tercatat. |
| Akses HTTP file secret dummy | Ditolak 403 melalui path `.dev.vars` dan `/@fs/.../.dev.vars`; isi secret tidak terkirim. |
| Pemeriksaan bundle client | Tidak ditemukan endpoint provider, header key, atau secret dummy yang diperiksa. |
| `git diff --check`, staging | Lulus; staging kosong. |
| Uji Gemini nyata | **BELUM DIJALANKAN** — pengguna meminta ditunda karena secret belum siap. |

Dua warning lama: import `Case` tidak terpakai pada `app/api/workspace/route.ts` dan penggunaan `location.assign` pada navigasi login yang sudah ada. Tidak menonaktifkan lint atau mengubah autentikasi untuk menghilangkannya.

Cakupan negatif mock: JSON envelope/analysis tidak valid, field wajib hilang, output terpotong, respons terlalu besar, ID sumber rekaan, missing key, quota, provider failure, timeout, perubahan revision selama generation, save gagal, respons save hilang, retry identik dan claim paralel. Kegagalan tidak menyimpan Run parsial; retry ID yang sama tidak menambah generation. Tes HTTP tambahan memverifikasi kasus tanpa Evidence, ownership lintas pengguna, Human Review, immutabilitas historis dan byte PDF asli.

Perbandingan SHA-256 terhadap snapshot awal M3 menunjukkan **27 berkas yang dilindungi dan 16 berkas runtime asli tidak berubah**, termasuk database lokal, blob PDF, registry credential dan signing key. Source schema, migrasi, storage, auth, API workspace/download dan `doc/` yang diperiksa tetap sama. Tidak ada stage, commit, push, atau deploy. Bukti JSON dan screenshot mock tersimpan pada folder `ient-src/outputs` milik QA, bukan runtime asli.

### Mengulang pengujian

Uji offline: dari `ient-src`, jalankan `node tests/gemini-analysis.mjs`. Ini tidak membutuhkan key atau server.

Untuk HTTP mock, buat salinan QA dari working source, kecualikan runtime, secret `.env*`/`.dev.vars*`, output, `.git`, build cache, dan dependency source. Gunakan dependency QA yang sudah tersedia, atau jalankan setup secara eksplisit di QA jika diperlukan. Buat `qa-origin.json` pada root QA dengan `{ "qa": "path absolut root QA", "source": "path absolut source asli", "port": 5189 }`. Semua tes HTTP berikut harus dijalankan dari `ient-src` QA dan server pada port tersebut.

1. Pada QA saja, salin `lib/gemini-provider.server.ts` menjadi `lib/gemini-provider.actual.server.ts`.
2. Salin `tests/fixtures/gemini-provider.mock.ts.fixture` menjadi `lib/gemini-provider.server.ts` di QA. Fixture mengekspor config adapter asli dan menghasilkan respons tiruan; tidak ada sakelar mock pada aplikasi utama.
3. Buat `.dev.vars` QA dengan `GEMINI_API_KEY=qa-mock-secret`; mulai server QA pada `127.0.0.1:5189`.
4. Set `TEST_BASE_URL=http://127.0.0.1:5189` dan `GEMINI_QA_MOCK=1`, lalu jalankan `node tests/gemini-workflow.mjs`. Script menolak berjalan tanpa marker, port yang sesuai, opt-in dan fixture mock.
5. Hentikan server QA, pulihkan adapter asli, dan kosongkan key dummy sebelum build akhir atau uji lain.

Uji live tetap tertunda. Saat disetujui untuk dijalankan dan secret/kuota siap, gunakan adapter asli pada QA terisolasi dan key lokal QA; set `GEMINI_LIVE_TEST=1` serta `TEST_BASE_URL` sesuai marker, lalu jalankan `node tests/gemini-live.mjs`. Script mengirim satu POST analisis dengan PDF fiktif, tanpa retry; adapter melakukan GET metadata lalu paling banyak satu generation. Keberhasilan hanya dicatat jika Run tervalidasi tersimpan dan dapat dibuka kembali. Tidak mengasumsikan kuota dari status free tier. Jangan menjalankannya bersamaan dengan suite mock.

## 6. Batas yang diketahui dan pekerjaan lanjutan

- **Gate validasi yang tersisa:** satu uji nyata untuk akses model, penerimaan native PDF/JSON Schema, penyimpanan hasil nyata dan kegunaan hasil. Billing tier/kuota perlu diperiksa pada project; belum diverifikasi pada akun pengguna.
- PDF M2 hanya melalui pemeriksaan envelope; dokumen terenkripsi, rusak secara internal, kompleks atau terlalu panjang dapat ditolak provider. Tidak ada parsing halaman/OCR. Tidak semua file pada batas byte pasti memenuhi batas token/halaman model.
- Timeout tidak membuktikan provider belum memproses atau menagih request. Tidak ada retry otomatis. Recovery crash pada jurnal `started`, kebijakan retensi jurnal dan pekerjaan durable belum dibuat.
- Validasi schema/ID tidak membuktikan groundedness, akurasi finansial, ketahanan mutlak terhadap prompt injection, atau kelengkapan diligence. Temuan tidak membuat keputusan investasi otomatis.
- Output 8.192 token dapat terpotong; server menolak hasil yang tidak lengkap. Payload maksimum dan latensi model belum diuji live. Produksi Workers/hosted identity belum diuji end-to-end atau dideploy.
- Milestone 4 yang dapat direncanakan setelah review: evaluasi kualitas hasil nyata dengan dokumen fiktif, perbaikan keterbacaan/penelusuran sumber dan provenance, handoff pertanyaan diligence secara eksplisit, dan penyempurnaan pesan retry/error. Perubahan tersebut belum dimulai.

Milestone 3 berhenti pada implementasi dan validasi di atas. Uji live tetap ditandai tertunda, bukan lulus.
