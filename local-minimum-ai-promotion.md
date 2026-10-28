# Promosi Minimum Working AI ke Aplikasi Lokal

**Verdict: PASS — integrasi lokal dan verifikasi offline selesai.** Tidak ada generation atau metadata Gemini nyata selama promosi ini. Respons nyata yang sebelumnya berhasil di QA digunakan kembali hanya dalam pengujian terisolasi.

## File dan perubahan

| File | Perubahan minimum |
| --- | --- |
| `ient-src/app/api/analysis/minimum/route.ts` | Route plaintext hasil promosi QA: satu PDF, model tetap `gemini-3.5-flash-lite`, instruksi pendek yang sudah terbukti, tanpa schema output. |
| `ient-src/app/workspace.tsx` | Tombol analisis mengarah ke route minimum; pesan setelah upload menjelaskan bahwa Evidence manual opsional. |
| `ient-src/app/analysis-workspace.tsx` | Pemilihan satu PDF, identitas request terpisah, renderer teks asli, label non-simulasi, dan akses Human Review. Renderer historis tetap tersedia. |
| `ient-src/app/document-readiness.tsx` | Batas pilihan opsional; alur minimum memakai satu PDF, perilaku bawaan multi-dokumen tetap tersedia. |
| `ient-src/lib/gemini-provider.server.ts` | Mengekspor tiga helper pembacaan respons dan error yang sudah ada; implementasi provider structured tidak diubah. |

Regresi ditambahkan melalui `ient-src/tests/minimum-analysis.mjs`, `ient-src/tests/minimum-workflow.mjs`, dan fixture transport offline `ient-src/tests/fixtures/minimum-transport.mock.ts.fixture`. Fixture tidak menyimpan respons privat atau kredensial.

Route mempertahankan autentikasi, pemeriksaan origin dan kepemilikan case/PDF, batas input, timeout 90 detik, error tersanitasi, serta penyimpanan D1/R2. Journal memakai klaim atomik per request ID, pemeriksaan kesesuaian intent, dan pemulihan penyimpanan tanpa generation ulang. Batas satu panggilan sepanjang umur eksperimen QA tidak dibawa ke aplikasi; request ID independen tetap dapat dipakai.

Output asli disimpan dalam `Run.assessment`, dengan `simulated: false`; `findings` dan `evidence` tetap kosong. Tidak dibuat interpretasi, sumber per klaim, atau validasi structured fiktif. Respons provider dan provenance disimpan dalam journal privat pemilik workspace.

## Validasi

- Typecheck **PASS**; lint **PASS**, tanpa error dan dengan dua warning lama.
- Production build **PASS**, dijalankan pada salinan QA terisolasi dengan source aplikasi hasil promosi yang sama.
- **29 skenario terfokus PASS**: autentikasi/origin, kepemilikan, validasi PDF, timeout, response/error, klaim bersamaan, replay, pemulihan penyimpanan, dan rendering.
- Uji HTTP pada Workers dengan D1/R2 QA **PASS**: respons nyata lama disimpan non-simulasi, reload, Human Review, replay tanpa duplikasi, request independen, histori rules-v1, dan download PDF identik.
- Regresi adapter structured, input dokumen, dan tampilan historis **PASS**.

Transport QA menggunakan respons yang sudah direkam dan tidak meneruskan panggilan ke Google. Server QA dihentikan dan konfigurasi transport sementara dihapus. File respons privat tetap di luar repository.

## Cara menggunakan

Jalankan `npm run dev` dari root, lalu masuk menggunakan akun lokal yang tersedia. Buka **Company → Investment Case → Evidence → Upload document**, kemudian **Analysis**, pilih satu PDF, dan tekan **Run Gemini PDF analysis**. Hasil tersimpan ditandai **Gemini · PDF text**; tekan **Review analysis** untuk Human Review. Menekan tombol generation akan membuat panggilan Gemini nyata; langkah itu tidak dijalankan selama promosi ini.

## Batasan dan integritas

Alur minimum hanya menerima satu PDF maksimal 10 MiB. Output berupa teks; tidak ada structured findings atau sitasi per klaim yang divalidasi. Evidence manual dan catatan case tidak dikirim dalam request minimum. Timeout tetap 90 detik dan tidak ada retry otomatis. Implementasi structured lama dan simulasi rules-v1 tetap dipertahankan.

API key, `.dev.vars`, dan konfigurasi model lama tidak diubah; model minimum ditentukan khusus di route baru. Seluruh 16 file runtime asli yang tercatat pada baseline tetap identik. Data bisnis, histori Run, PDF asli, dan perubahan Git sebelumnya dipertahankan. Tidak ada migrasi, staging, commit, push, atau deployment. Respons/data QA tidak dimasukkan ke workspace bisnis lokal.
