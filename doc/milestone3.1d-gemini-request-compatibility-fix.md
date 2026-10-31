# M3.1d — Gemini 3.8 Request Compatibility Fix

26 Oktober 2026 (Asia/Jakarta). **Verdict: PARTIAL.** Koreksi minimum dan validasi offline lulus; acceptance nyata terhenti oleh timeout 90 detik.

## Koreksi yang diterapkan

- `ient-src/lib/gemini-provider.server.ts:59`: hanya menghapus **`temperature: 0.2`** dari `generationConfig`.
- `ient-src/tests/gemini-analysis.mjs`: memastikan `temperature`, `topP`, `topK`, `top_p`, dan `top_k` tidak ada pada generation config maupun root request.
- `ient-src/tests/gemini-workers.mjs`: pemeriksaan yang sama terhadap payload nyata runtime workerd, dengan transport tes lokal.

Perbandingan adapter sebelum/sesudah membuktikan perubahan produksi hanya penghapusan parameter tersebut. Model tetap **`gemini-3.8-flash`**. Prompt, versi prompt, PDF input, schema, source validation, persistence, batas ukuran/token, timeout dan redirect guard tetap sama. Tidak menambahkan dependency atau mengubah modul lain.

## Hasil offline

| Pemeriksaan | Hasil |
| --- | --- |
| Root typecheck | PASS |
| Root lint | PASS: 0 error, 2 warning lama |
| Root production build pada QA dengan adapter asli | PASS |
| `gemini-analysis.mjs` | PASS: kontrak request, error, source IDs, revision, idempotency, persistence dan historis |
| `gemini-workers.mjs` | PASS: parameter sampling tidak terkirim, 20 kasus redirect ditolak, fixture sukses pada native workerd; 0 request Google |
| `document-input.mjs`, `analysis-view.mjs` | PASS |
| `auth-access.mjs`, termasuk setelah restart | PASS |
| `workflow.mjs`, `analysis-workflow.mjs`, `document-readiness.mjs` | PASS pada data fiktif QA |

Dua warning lama terkait import `Case` tidak terpakai dan navigasi login `location.assign`; tidak dinonaktifkan atau diubah. Regresi tidak memakai workspace bisnis asli.

## Satu percobaan live

| Item | Hasil terverifikasi |
| --- | --- |
| Model | `gemini-3.8-flash`, tanpa switching/fallback |
| Metadata | HTTP **200**, baik preflight maupun GET adapter Workers |
| Generation nyata | **1 percobaan pengiriman POST generateContent**, tanpa retry |
| Request ID baru | `c82b5987-7680-4d3b-9454-035e02d66e65` |
| Input | Company/Case fiktif, satu PDF 799 byte, tanpa manual Evidence |
| Generation config yang benar-benar dikirim | Hanya `maxOutputTokens`, `responseJsonSchema`, `responseMimeType` |
| Schema | Hash sama persis dengan schema M3.1c; tidak dimodifikasi |
| Hasil aplikasi | **HTTP 504 / TIMEOUT**, sekitar 90,2 detik |
| Status HTTP generation dari Google | **Tidak terkonfirmasi**; tidak ada respons generation yang tercatat sebelum timeout |
| Token usage | Tidak tersedia |

PDF yang dikirim memiliki SHA-256 `359ee6c56bfa6d42ea03ca44528318ddefea41cffa4a6fdeac0fc9f16c4eb1c5`, sama dengan fixture percobaan terdahulu. Hash schema yang dikirim: `f7a4beb9d96b0b6d175adf425d4ca1f958130490296a9e33a12eafdb6018620e`.

Diagnostik tersanitasi aplikasi:

> Gemini timed out. No retry was made; the provider may still have processed it. Another call requires a new explicit request.

504 ini berasal dari batas waktu aplikasi, **bukan status HTTP yang diklaim berasal dari Google**. Provider mungkin tetap memproses request; penerimaan/penyelesaian dan biaya tidak dapat dipastikan dari timeout ini. Tidak ada request generation tambahan, pergantian model, perubahan billing, atau workaround schema.

## Structured output, persistence dan Human Review

Kasus QA: `CASE-2026-ECD0E657`. Pembacaan D1 QA setelah penghentian server menunjukkan **1 dokumen, 0 Evidence, 0 Run, 0 Review**. Jurnal R2 berstatus `failed` dengan kode `TIMEOUT`; tidak ada Run parsial.

Tidak ada output untuk parsing JSON/Zod, validasi source references, penilaian kualitas, atau penyimpanan model provenance/token usage pada Run nyata. Reload Run sukses dan Human Review terhadap Run nyata **belum terverifikasi**. Regresi offline review/historis lulus, tetapi tidak dianggap sebagai pengganti acceptance live.

Tidak muncul respons 400 yang dapat diperiksa pada percobaan ini. Karena tidak ada respons generation yang berhasil, penghapusan temperature **belum membuktikan secara live** bahwa penyebab 400 terdahulu sudah teratasi.

## Perlindungan dan penutupan

QA M3.1a yang terisolasi dipakai kembali pada port 5193 dengan akun/kasus fiktif baru. Pengamatan QA meneruskan adapter asli/native fetch, membatasi generation menjadi satu, dan hanya mencatat metadata teknis tersanitasi. Script live yang sudah ada tidak diubah.

- Hash **16 berkas runtime bisnis asli tetap sama**; konfigurasi secret asli tidak berubah.
- Perubahan source hanya tiga berkas yang disebutkan di atas; schema, prompt dan workflow lain dipertahankan.
- Key tidak ditemukan pada log yang diperiksa atau bundle client; baris isi PDF yang diperiksa tidak muncul pada log.
- Server QA dikonfirmasi berhenti, secret sementara QA dihapus, adapter QA dipulihkan dan laporan QA sebelumnya dikembalikan.
- Perubahan Git sebelumnya terjaga; staging kosong. Tidak ada migrasi, commit, push, deployment atau pekerjaan Milestone 4.

**PARTIAL:** implementasi dan offline validation PASS; jalur hasil Gemini tersimpan → reload → Human Review masih terblokir timeout. Tidak ada pengulangan atau koreksi tambahan setelah kegagalan. Retest lain memerlukan otorisasi baru.

Bukti pada `C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\qa-m31d`: `offline-validation.json`, `metadata-preflight.json`, `final-outcome.json`, `build.log`, serta laporan live dan `persistence-after-timeout.json` di `outputs`.
