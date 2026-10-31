# Milestone 3.1c — Audit Kontrak Request dan Kompatibilitas Model Gemini

Tanggal audit: **26 Oktober 2026, Asia/Jakarta**.

**Verdict: LIKELY.** Ada ketidaksesuaian parameter yang terverifikasi dengan panduan model; penyebab pasti respons 400 M3.1b belum terbukti.

## 1. Ringkasan eksekutif

1. Request adapter masih mengirim **`generationConfig.temperature: 0.2`**. Panduan migrasi resmi `gemini-3.8-flash` meminta penghapusan parameter sampling deprecated, termasuk `temperature`. Ini adalah tersangka utama HTTP 400. Panduan generasi sebelumnya menjelaskan bahwa parameter tersebut diabaikan pada sebagian model dan dapat menjadi HTTP 400 pada generasi berikutnya; karena respons M3.1b tidak menyebut field, hubungan sebab-akibat belum dikonfirmasi. [Panduan 3.8](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.8), [perubahan parameter 3.6/3.5](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.6).
2. **`gemini-3.8-flash` merupakan ID resmi**, mendukung PDF dan structured output menurut dokumentasi. Metadata tersimpan juga membuktikan akses `generateContent` pada percobaan sebelumnya. Tidak ada dasar menyatakan model ini fiktif atau tidak mendukung PDF. Namun, itu tidak memvalidasi seluruh konfigurasi request. [Spesifikasi 3.8](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash).
3. Schema berukuran **1.384 byte**, menggunakan tujuh keyword yang didokumentasikan, dan lolos kompilasi JSON Schema lokal. Nested array dengan `evidenceIds.maxItems: 50` tetap menjadi kemungkinan masalah kompleksitas constrained decoding, bukan bukti penyebab 400.
4. PDF fiktif lolos parser Poppler, tidak terenkripsi, satu halaman; base64 kembali menjadi byte yang sama dan hash cocok dengan diagnostik M3.1b. **Tidak ada bukti yang menunjuk PDF sebagai penyebab.**
5. Koreksi minimum yang diusulkan: **hapus `temperature` saja terlebih dahulu**, pertahankan model/schema/endpoint untuk uji kausal berikutnya. Keputusan model untuk prototype adalah keputusan terpisah: **utama `gemini-3.5-flash-lite`, fallback `gemini-3.6-flash`**, setelah otorisasi dan validasi akun. Tidak ada model yang diganti pada audit ini.

Default 3.8 dipilih Codex saat M3, bukan persyaratan produk dari pengguna. Pemilihan itu belum disertai penyesuaian parameter khusus model yang diperlukan. Audit ini mengoreksi penilaian kompatibilitas tersebut, tanpa mengubah implementasi.

**Batas pelaksanaan:** 0 generation nyata; 0 panggilan metadata akun baru; tidak menjalankan server aplikasi. Aktivitas jaringan hanya membaca dokumentasi publik. Tidak mengubah source, konfigurasi, API key, data aplikasi, atau hasil historis. Hanya laporan dan artefak analisis fiktif dibuat.

## 2. Kontrak request yang ada

### Sumber dan rekonstruksi

| Berkas | Peran |
| --- | --- |
| `ient-src/lib/gemini-provider.server.ts:48–85` | Serialisasi request, transport, parsing respons. |
| `ient-src/lib/gemini-analysis.ts:43–54` | Schema yang dikirim ke provider. |
| `ient-src/lib/gemini-analysis.ts:7–17` | Zod untuk hasil yang diterima aplikasi. |
| `ient-src/lib/gemini-run.server.ts` | Snapshot Company/Case/Evidence, persiapan PDF M2, persistence. |
| `ient-src/lib/document-input.server.ts` | Otorisasi dan byte PDF asli dari R2. |
| `ient-src/tests/fictional-pdf.mjs` | Fixture PDF 799 byte, sama dengan dokumen pada live test. |

Adapter asli direkonstruksi **di memori**, menggunakan Company/Case/metadata fiktif dan transport lokal pengganti. Native network fetch diblokir pada proses rekonstruksi. Tidak membaca credential untuk menjalankan adapter, tidak mengakses R2/D1, dan tidak memanggil Google. Respons fixture hanya memungkinkan audit serialisasi; itu bukan hasil LLM.

Artefak lengkap:

- [Request lengkap dengan header tersamarkan](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/audit-m31c/request-fictional-full.json>).
- [Body JSON lengkap](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/audit-m31c/request-body-fictional.json>).
- [JSON Schema lengkap yang sekarang dikirim](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/audit-m31c/response-schema-current.json>).

JSON tersebut persis hasil serialisasi kode **untuk input audit fiktif ini**. Full body historis M3.1b tidak disimpan; tidak mengklaim seluruh byte/context historis identik.

### Endpoint dan bentuk payload

```text
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent
Content-Type: application/json
x-goog-api-key: [REDACTED]
```

Opsi fetch: `redirect: 'manual'`; timeout total 90 detik. Opsi ini bukan field JSON atau header HTTP. Adapter menolak HTTP 3xx dan tidak melakukan retry/fallback.

Bentuk berikut memakai simbol untuk nilai panjang; JSON lengkap yang benar-benar direkonstruksi tersedia pada lampiran di atas:

```javascript
{
  systemInstruction: {parts: [{text: SYSTEM_INSTRUCTION_VC_PDF_V1}]},
  contents: [{
    role: 'user',
    parts: [
      {text: JSON.stringify({
        documentId: 'pdf-fictional-audit',
        originalFilename: 'fictional-live.pdf'
      })},
      {inlineData: {
        mimeType: 'application/pdf',
        data: PDF_BASE64_1068_CHARACTERS
      }},
      {text: 'Analyze these untrusted inputs using the system rules:\n' +
        JSON.stringify({company, case: caseContext,
          documents: sourceMetadata, manualEvidence: []})}
    ]
  }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseJsonSchema: EXACT_SCHEMA_FROM_ATTACHMENT,
    maxOutputTokens: 8192,
    temperature: 0.2
  }
}
```

Untuk beberapa PDF, pasangan text metadata + `inlineData` diulang sebelum text konteks terakhir. Metadata mencakup document ID, filename, MIME, ukuran, sumber, ETag; Company/Case dan Evidence opsional dikirim sebagai text JSON, bukan sebagai parameter API baru. Tidak ada model turn yang diprefill, tools, candidate count, `topP`, `topK`, thinking budget, atau cached content.

### Hasil pengukuran offline

| Ukuran/pemeriksaan | Hasil |
| --- | --- |
| Body contoh fiktif | 5.008 byte UTF-8; ukuran historis persis tidak tersedia. |
| Context JSON contoh | 819 byte. |
| PDF | 799 byte, PDF 1.4, 1 halaman, tidak terenkripsi. |
| Base64 | 1.068 karakter; decode identik dengan byte awal. Tidak memakai prefix data URL. |
| SHA-256 PDF | `359ee6c56bfa6d42ea03ca44528318ddefea41cffa4a6fdeac0fc9f16c4eb1c5` — sama dengan log M3.1b. |
| Struktur PDF | Xref konsisten dan `pdfinfo` berhasil; tidak membuktikan penerimaan parser Google. |
| Schema | 1.384 byte; 4 object schema; total 17 required-property slots; kedalaman container maksimum 4. |

## 3. Perbandingan kontrak dengan dokumentasi resmi

### Envelope, PDF dan parameter generation

| Aspek | Penilaian |
| --- | --- |
| Endpoint/version | Route `/v1beta/models/{model}:generateContent` sesuai API resmi. Tidak perlu memindahkan aplikasi ke Interactions API hanya karena contoh dokumentasi umum kini menggunakannya. |
| `systemInstruction` | Berisi text parts saja; tidak ditemukan part multimodal pada system instruction. |
| `contents` / `parts` | Satu user turn dengan text dan byte inline; text terakhir tidak kosong. Tidak melanggar aturan larangan model-prefill. |
| `inlineData` | `mimeType: application/pdf` dan base64 standar mengikuti contoh resmi generateContent; camelCase ini valid. |
| `generationConfig` | Posisi dan tipe object sesuai kontrak REST. Parameter umum pada API reference belum tentu dapat dikonfigurasi pada semua model. |
| `temperature: 0.2` | Tipe/angka valid pada kontrak generik, tetapi bertentangan dengan instruksi migrasi khusus 3.8 untuk menghapus sampling parameters. Kandidat utama. |
| `maxOutputTokens: 8192` | Integer, lebih rendah dari batas output 65.536 pada metadata tersimpan. Tidak ditemukan bukti out-of-range. |
| Thinking | Tidak dikirim; model memakai default. Dapat memengaruhi latensi/token dan hasil terpotong, tetapi tidak ada bukti bahwa ketidakhadirannya menyebabkan 400. |
| Mode redirect | `manual`, dengan penolakan 3xx; blocker Workers lama sudah ditangani. |

Dasar envelope adalah [referensi generateContent/GenerationConfig](https://ai.google.dev/api/generate-content?hl=en); representasi PDF sesuai [panduan PDF khusus generateContent](https://ai.google.dev/gemini-api/docs/generate-content/document-processing). Aturan prefill/sampling mengikuti [panduan 3.8](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.8), bukan sekadar contoh konfigurasi generik.

### `responseSchema` versus `responseJsonSchema`

Implementasi hanya mengirim `responseJsonSchema` bersama `responseMimeType: application/json`; **tidak** mengirim `responseSchema`. Keduanya bukan nama yang dapat dipertukarkan begitu saja: `responseSchema` memakai tipe Schema subset OpenAPI, sedangkan jalur JSON Schema memiliki representasi dan dukungan keyword berbeda. Tidak ada konflik dua schema sekaligus pada request ini.

API reference masih mencantumkan wire field `responseJsonSchema`. Proto resmi juga memetakan field JSON Schema berurutan ke nama JSON itu. Dokumentasi REST terbaru menawarkan `generationConfig.responseFormat.text.schema` dan menandai jalur lama tertentu deprecated; keterangan alias pada reference kurang jelas. Ini adalah risiko kompatibilitas yang perlu dicatat, **bukan bukti bahwa field saat ini pasti ditolak**. Jangan mengubahnya menjadi `responseSchema`, `_responseJsonSchema`, atau format Interactions tanpa penilaian terpisah. [Proto resmi Google](https://github.com/googleapis/googleapis/blob/master/google/ai/generativelanguage/v1beta/generative_service.proto), [contoh REST structured output saat ini](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en).

### Audit schema

Seluruh properti pada setiap object diwajibkan; object melarang properti tambahan. String length bounds hanya ada pada Zod aplikasi, tidak dikirim ke Google.

| Jalur array | Minimum eksplisit | Maksimum |
| --- | --- | --- |
| `findings` | 1 | 10 |
| `findings[].documentIds` | Tidak ada | 5 |
| `findings[].evidenceIds` | Tidak ada | 50 |
| `risks` | Tidak ada | 8 |
| `risks[].documentIds` | Tidak ada | 5 |
| `missingInformation` | Tidak ada | 8 |
| `diligenceQuestions` | Tidak ada | 8 |
| `diligenceQuestions[].documentIds` | Tidak ada | 5 |

Keyword yang benar-benar dikirim: `type`, `properties`, `required`, `additionalProperties`, `items`, `minItems`, `maxItems`. Tidak ada enum, `$ref`, `$defs`, recursive reference, `anyOf`, `oneOf`, nullable union, optional-property branching, `minLength`, `maxLength`, regex, atau numeric range. Kompilasi Ajv lokal berhasil; keyword tersebut juga tercantum dalam dokumentasi subset JSON Schema. Itu belum merupakan validasi grammar compiler Google.

Google mendokumentasikan kemungkinan 400 akibat grammar kompleks, termasuk batas besar pada nested arrays. Batas 50 evidence IDs tetap dikirim meskipun Evidence kosong. Secara kontrak terdapat hingga 630 slot referensi jika seluruh daftar diisi maksimum; **angka ini bukan jumlah grammar states**. Schema kecil dan semua properties required mengurangi alasan menuduh kompleksitas sebagai penyebab yang sudah pasti. [Dukungan/limit schema](https://ai.google.dev/gemini-api/docs/structured-output), [panduan generateContent](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en).

Referensi document/evidence tidak dibatasi enum pada provider; whitelist sumber diperiksa server setelah respons. Ini risiko validasi hasil, bukan ketidakabsahan request.

## 4. Diagnostik M3.1b dan penilaian penyebab 400

Bukti yang tersedia pada `qa-m31b/final-outcome.json`, `metadata-preflight.json`, `server.log`, dan laporan script menunjukkan:

- GET metadata: 200; nama `models/gemini-3.8-flash`, `generateContent` didukung, input 1.048.576 dan output 65.536 token.
- Satu POST generation: **400 / INVALID_ARGUMENT**, pesan `Request contains an invalid argument.`
- PDF inline: 799 byte dan hash sama dengan fixture audit.
- Endpoint aplikasi memetakannya menjadi 502 / `PROVIDER_ERROR`; tidak ada Run parsial.

Observer QA hanya menyimpan HTTP status, `error.status`, dan `error.message` yang disamarkan/dibatasi. **`error.details`, field violations, dan full provider error tidak dipertahankan.** Adapter produksi membatalkan body error dan mengembalikan pesan statis. Tidak boleh menyimpulkan Google tidak pernah mengirim detail tambahan; bukti itu tidak tersedia untuk audit retrospektif ini.

| Dugaan | Klasifikasi | Bukti dan batas kesimpulan |
| --- | --- | --- |
| Request masih membawa parameter sampling deprecated | **CONFIRMED** sebagai temuan kontrak | Source dan rekonstruksi mengirim `temperature: 0.2`; panduan 3.8 meminta penghapusannya. |
| `temperature` menyebabkan 400 M3.1b | **STRONGLY SUSPECTED** | Cocok dengan perubahan model/API. Tidak ada field-specific error atau eksperimen terkontrol untuk membuktikannya. |
| Nested-array grammar terlalu kompleks | **POSSIBLE** | Batas 50 pada nested evidence references dan dokumentasi grammar rejection; tidak ada pesan complexity spesifik. |
| Perilaku alias/jalur legacy JSON output pada deployment model | **POSSIBLE** | Dokumentasi terbaru mendorong `responseFormat`; field lama masih terdaftar. Belum ada bukti penolakan alias pada request ini. |
| Keyword `additionalProperties`, `minItems`, `maxItems` tidak didukung sama sekali | **NOT SUPPORTED BY EVIDENCE** | Ada dalam daftar dukungan untuk jalur JSON Schema; request bukan `responseSchema` OpenAPI. |
| Schema tidak valid secara sintaks/tipe JSON Schema | **NOT SUPPORTED BY EVIDENCE** | JSON dapat diparse dan schema lolos Ajv. Batas provider-specific belum terbukti. |
| ID model tidak resmi/tidak mendukung generation | **NOT SUPPORTED BY EVIDENCE** | ID resmi dan metadata tersimpan 200 dengan method yang sesuai. |
| Model tidak mendukung PDF/structured output | **NOT SUPPORTED BY EVIDENCE** | Kedua fitur didokumentasikan; penerimaan konfigurasi gabungan tetap belum terbukti secara live. |
| PDF korup, encrypted, atau base64 rusak | **NOT SUPPORTED BY EVIDENCE** | Poppler berhasil, tidak terenkripsi, round-trip base64 dan hash konsisten. Bukan jaminan parser Google. |
| Ukuran 799-byte fixture melewati batas | **NOT SUPPORTED BY EVIDENCE** | Jauh di bawah limit; source juga membatasi payload final. |
| Token output 8.192 di luar batas | **NOT SUPPORTED BY EVIDENCE** | Di bawah batas metadata 65.536. Truncation setelah HTTP 200 merupakan masalah lain. |
| Akhir turn berupa model-prefill / candidate count tidak didukung | **NOT SUPPORTED BY EVIDENCE** | Request berakhir pada user text dan tidak mengirim candidate count. |
| Key salah, quota habis atau 503 menjelaskan 400 ini | **NOT SUPPORTED BY EVIDENCE** | Tidak ada respons credential/quota atau 503 pada M3.1b. Akses metadata bukan bukti kuota generation. |
| 503 M3.1a berasal dari high demand | **CONFIRMED** untuk percobaan tersebut | Respons terdahulu memang menyebut high demand; tidak menjelaskan field invalid pada M3.1b. |

503 sebelumnya tidak membuktikan seluruh request valid: gangguan provider mungkin muncul sebelum validasi parameter selesai. Urutan internal itu **tidak diketahui**, sehingga tidak dipakai sebagai bukti penyebab.

## 5. Penilaian `gemini-3.8-flash`

| Pertanyaan | Kesimpulan |
| --- | --- |
| ID resmi/tersedia? | Ya menurut katalog/model page dan metadata historis. Tidak melakukan GET akun baru pada audit ini. |
| `generateContent`? | Ya, terdokumentasi dan terdapat pada metadata tersimpan. |
| Native PDF dan JSON structured output? | Ya secara dokumentasi. Belum ada live acceptance sukses pada aplikasi ini. |
| Konfigurasi sekarang sesuai? | **Belum sepenuhnya**: `temperature` harus dihapus menurut panduan migrasi; schema/format masih membutuhkan acceptance. |
| Batas model cukup? | Input 1.048.576/output 65.536 token memadai untuk konfigurasi output 8.192; ukuran byte tidak menentukan jumlah token/halaman. |
| Cocok untuk prototype kecil? | Mampu secara fitur, tetapi reasoning/default medium dan kemampuan agentic lanjut belum dibutuhkan oleh workflow ini. Lebih mahal daripada Flash-Lite yang dibandingkan di bawah. |
| Stabil/reliable? | Label model stable terkonfirmasi; keberhasilan demo, latensi 90 detik dan availability akun belum terbukti. Satu 503 bukan ukuran reliabilitas komparatif yang cukup. |

Sumber spesifikasi: [model 3.8](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash); default thinking dan konfigurasi mengikuti [panduan 3.8](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.8).

Dokumen resmi mendukung multi-PDF dengan batas total halaman/context; batas PDF hingga 50 MB/1.000 halaman tidak berarti request inline tanpa batas. Aplikasi sengaja lebih kecil: 5 file, 10 MiB/file, 12 MiB gabungan, body final 20.000.000 byte. Batas byte tidak menjamin seluruh dokumen bisnis memenuhi context/token/halaman model. [PDF dan multi-document](https://ai.google.dev/gemini-api/docs/document-processing).

## 6. Perbandingan tiga alternatif resmi

Semua alternatif berikut mempunyai ID stable eksplisit, PDF input dan structured output dalam model page. Dukungan multi-document mengikuti mekanisme API PDF, dalam batas context. **Akses, quota, biaya aktual akun, kualitas analisis VC dan reliabilitas demo belum diuji untuk ketiganya.**

| Model alternatif | Input/output token maksimum | Fokus yang didokumentasikan | Penilaian untuk prototype |
| --- | --- | --- | --- |
| [`gemini-3.5-flash-lite`](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) | 1.048.576 / 65.536 | Latensi/biaya rendah, document parsing dan ekstraksi. Stable, pembaruan Juli 2026. | Pilihan utama yang diusulkan: kebutuhan PDF + JSON terpenuhi tanpa membayar kemampuan agentic tingkat lanjut. Nuansa analisis perlu evaluasi manusia. |
| [`gemini-3.6-flash`](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash) | 1.048.576 / 65.536 | Penalaran multimodal lebih kompleks; previous generation yang tetap tersedia untuk produksi. Stable. | Fallback yang diusulkan bila mutu penalaran Lite tidak cukup. Lebih mahal; belum terbukti lebih tersedia pada akun ini. |
| [`gemini-3.1-flash-lite`](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite) | 1.048.576 / 65.536 | Ekstraksi/tugas ringan bervolume tinggi. Stable, pembaruan Mei 2026. | Alternatif paling murah pada tabel harga saat ini, tetapi kualitas sintesis lintas dokumen belum diuji. Tidak dipilih otomatis hanya karena lebih lama/murah. |

### Harga untuk perbandingan

Tarif **Standard paid per 1 juta token**, USD, berdasarkan halaman pricing pada tanggal audit; bukan estimasi tagihan akun:

| Model | Input text/image | Output termasuk thinking |
| --- | --- | --- |
| 3.8 Flash (baseline) | $0,75 sampai 31 Desember 2026; kemudian $1,50 | $3,75 sampai tanggal tersebut; kemudian $7,50 |
| 3.6 Flash | $0,75 sampai 31 Desember 2026; kemudian $1,50 | $3,75 sampai tanggal tersebut; kemudian $7,50 |
| 3.5 Flash-Lite | $0,30 | $2,50 |
| 3.1 Flash-Lite | $0,25 | $1,50 |

Halaman resmi mencantumkan free-tier token untuk model-model tersebut; eligibility dan batas akun tidak diverifikasi. Harga introductory membuat 3.6 dan 3.8 sama pada tanggal audit—tidak mengklaim 3.6 lebih murah saat ini. [Pricing resmi](https://ai.google.dev/gemini-api/docs/pricing). Rate limit berlaku menurut project/model/tier, bukan jaminan service availability; label stable tidak menjamin demo bebas 503. [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

Tidak merekomendasikan 2.5 sebagai default akun baru: katalog saat ini membatasi akses keluarga 2.5 kepada pengguna yang telah aktif memakainya sebelumnya. Alias `latest`, preview, Pro dan model audio/image tidak diperlukan untuk kebutuhan ini. [Katalog model](https://ai.google.dev/gemini-api/docs/models).

## 7. Rekomendasi primary dan fallback

**Primary yang diusulkan: `gemini-3.5-flash-lite`.** Alasannya adalah kombinasi fitur PDF/JSON, fokus ekstraksi dokumen, dan biaya lebih rendah untuk prototype dengan Human Review. Ini rekomendasi kesesuaian tugas/biaya, bukan klaim reliabilitas atau akurasi yang telah diukur.

**Fallback yang diusulkan: `gemini-3.6-flash`.** Gunakan hanya melalui keputusan eksplisit bila evaluasi kualitas Lite atau akses akun mengharuskannya. Tidak ada routing/fallback otomatis. Kedua pilihan memerlukan penghapusan sampling parameters menurut panduan model, sehingga **mengganti nama model saja bukan koreksi kontrak yang memadai**. [Panduan 3.6/3.5](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.6).

Tidak memilih 3.8 hanya karena paling baru/kuat. Namun, untuk menguji penyebab 400 secara terkontrol, percobaan diagnostik berikut sebaiknya tetap memakai **3.8 yang sekarang dikonfigurasi**, dengan satu perubahan request saja. Keputusan mengganti model produk dilakukan terpisah agar dua variabel tidak berubah sekaligus.

## 8. Koreksi minimum yang diusulkan — belum diterapkan

1. **Request dahulu:** hapus `temperature: 0.2` di pembentukan body pada `lib/gemini-provider.server.ts:59`. Pertahankan `responseMimeType`, `responseJsonSchema`, `maxOutputTokens`, PDF, endpoint, timeout, redirect guard dan Zod. Tidak mengganti schema atau model pada langkah diagnostik pertama.
2. **Diagnostik QA:** sebelum acceptance berikut, siapkan pencatatan error berbatas dengan allowlist `code`, `status`, pesan tersamarkan, serta field violations bila tersedia. Jangan menyimpan headers, key, full prompt/PDF, atau seluruh error body sembarangan. Ini usulan instrumentasi QA, bukan perubahan respons publik aplikasi.
3. **Schema hanya jika bukti mengarah ke sana:** kurangi/hilangkan batas nested array provider yang menambah grammar complexity, khususnya evidence references 50, sambil mempertahankan batas penerimaan Zod. Pertimbangkan format REST `responseFormat` dalam perubahan terpisah jika diagnosis menunjukkan masalah jalur legacy. Jangan menerapkan semua hipotesis sekaligus.
4. **Model terpisah:** adopsi rekomendasi primary/fallback hanya setelah ditinjau dan diotorisasi. Switching saja belum terbukti memperbaiki 400; melakukan keduanya sekaligus menghilangkan kemampuan mengisolasi penyebab.

[Contoh payload usulan tanpa temperature](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/audit-m31c/request-body-proposed-no-temperature.json>) hanya artefak fiktif offline. Tidak dikirim atau diterapkan pada source/config.

## 9. Rencana acceptance berikutnya — tidak dieksekusi

**Memerlukan otorisasi baru untuk koreksi dan satu generation.**

1. Terapkan hanya penghapusan temperature beserta assertion regresi yang memastikan parameter tidak dikirim. Jalankan typecheck, lint, build, adapter tests, workerd redirect tests dan regresi document/persistence/auth yang relevan pada QA.
2. Gunakan salinan/runtime QA terpisah, adapter asli, secret lokal privat dan model tetap `gemini-3.8-flash`. Verifikasi metadata model. Tidak mengubah billing, quota atau konfigurasi model produksi.
3. Buat Company/Case fiktif baru, unggah fixture 799-byte yang sama, tanpa manual Evidence. Rekam hash PDF, input revision dan request ID UUID baru; jangan menggunakan jurnal failed lama.
4. Bandingkan request baru dengan rekonstruksi: satu-satunya perubahan generation config adalah **temperature tidak ada**. Pasang penghitung transport yang menolak generation kedua sebelum network.
5. Kirim **tepat satu POST analisis aplikasi dan paling banyak satu POST generateContent**. Satu PDF cukup untuk diagnosis; tidak menambah multi-PDF atau eksperimen model pada percobaan yang sama.
6. Jika HTTP 200: periksa `finishReason: STOP`, parsing JSON, Zod, whitelist ID sumber; nilai keterkaitan klaim dengan fixture secara manual. Verifikasi `simulated: false`, model/prompt version, input ETag/context, token usage bila tersedia, Run tersimpan dan dapat dibuka ulang, serta Human Review yang merujuk Run tersebut. Bandingkan data historis sebelum/sesudah.
7. Jika 400: simpan hanya detail error tersanitasi yang diizinkan, pastikan tidak ada Run parsial, lalu berhenti untuk audit ulang. Jika 503/429/timeout, juga berhenti. Tidak ada retry, model lain, atau perubahan tambahan dalam turn tersebut.
8. Hentikan QA, hapus secret temporer QA, dan bandingkan hash runtime/config/source asli serta status Git. Laporkan hasil dan kualitas secara terpisah; keberhasilan satu fixture tidak membuktikan akurasi finansial umum.

Jika penghapusan temperature menghasilkan sukses pada model/schema yang sama, dukungan terhadap hipotesis meningkat kuat; itu belum menguji reliabilitas produksi. Jika tetap 400, gunakan detail field baru untuk menentukan perubahan schema/format/model pada milestone yang diotorisasi berikutnya.

## 10. Verdict akhir dan integritas

**LIKELY — ketidakcocokan parameter request adalah kandidat utama; `temperature` paling kuat didukung bukti. ROOT CAUSE CONFIRMED belum dapat dinyatakan.** Tidak tersedia full error field-specific atau hasil perbandingan generation tanpa temperature. Tidak ada bukti yang cukup untuk menyalahkan PDF, meniadakan keberadaan model 3.8, atau menjamin switching model akan menyelesaikan masalah.

Audit tidak menjalankan generation atau metadata akun baru, tidak menerapkan koreksi, tidak mengganti model/API key, tidak memodifikasi data, dan tidak memulai Milestone 4. Tidak ada staging, commit, push atau deploy. Integritas 142 berkas source aplikasi, 16 berkas runtime asli, konfigurasi secret dan working-tree lama diperiksa terhadap snapshot audit.

Artefak tambahan di folder audit yang sama: `offline-summary.json`, `schema-check.json`, `fictional.pdf`, `reconstruct.mjs`. Semua request/context di artefak rekonstruksi adalah fiktif; header credential disamarkan. Evaluasi schema lokal dan Poppler tidak menggantikan acceptance provider.
