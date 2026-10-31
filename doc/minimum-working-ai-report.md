# Minimum Working AI — Berhasil di QA

**Status: PASS untuk alur minimum terisolasi. Aplikasi asli belum diubah.**

## 1. Apakah analisis PDF Gemini nyata berhasil?

**Ya.** Satu PDF fiktif 799 byte dianalisis melalui native inline PDF di Cloudflare Workers menggunakan `gemini-3.5-flash-lite`.

Request berisi instruksi singkat dan batas output 8192 token, tanpa JSON schema atau konfigurasi JSON output. Batas request/response dan timeout 90 detik dipertahankan.

## 2. Outcome provider

- **Tepat 1 generation nyata**, tanpa retry, fallback, atau generation tambahan.
- **HTTP 200**, respons selesai sekitar **16,9 detik**.
- ModelVersion: `gemini-3.5-flash-lite`; penggunaan **586 input + 226 output = 812 token**.
- Output memiliki Executive Summary, Findings, Risks, dan Diligence Questions, serta menyebut informasi khusus PDF: **ARR USD 100000 dan 12 pelanggan**.

Keberhasilan request sederhana ini tidak menetapkan penyebab spesifik HTTP 400 pada request lama.

## 3. Apakah hasil tersimpan dan dapat direview?

**Ya. Respons yang sama digunakan sampai selesai**, tanpa memanggil Gemini lagi.

- Saved Run: `GEMINI-TEXT-b9a49e48-20e0-4237-af6d-3492759dac8a`, **simulated: false**.
- Teks provider disimpan persis di `Run.assessment`; hash cocok dengan respons nyata. Field analisis terstruktur yang tidak dipetakan tetap kosong; tidak ada sitasi, interpretasi, atau counterargument buatan.
- Envelope provider asli, usage, dan provenance/source version tersimpan privat di R2 QA.
- **Reload identik dan satu Human Review tersimpan**, memakai workflow review yang sudah ada.
- Render teks dan kontrol review diverifikasi; duplicate save tidak membuat Run baru, dan save tanpa autentikasi ditolak.
- Lima Run historis `rules-v1` dan PDF asli tetap utuh. Tidak diperlukan perubahan model Run atau migrasi database.

Perubahan hanya di QA: [route minimum](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/ient-src/app/api/analysis/minimum/route.ts>), koneksi tombol existing, renderer plaintext, dan ekspor helper error. Typecheck, lint, production build, serta tes history relevan lulus; tersisa dua warning lint lama.

## 4. Blocker tersisa

**Tidak ada blocker pada alur minimum yang diuji.** Prototype saat ini dibatasi satu PDF dan hasil teks; promosi ke aplikasi asli belum diotorisasi.

Key Gemini sementara sudah dihapus dan server QA dihentikan. Source/config, credential, 16 file runtime asli, serta perubahan Git sebelumnya tetap terjaga. Tidak ada commit, push, atau deployment.

## 5. Langkah terkecil berikutnya

**Tinjau dan otorisasi promosi jalur minimum QA ke aplikasi lokal asli**, sambil mempertahankan history serta workflow lama. Tidak diperlukan generation tambahan untuk membuktikan hasil yang sudah tersimpan ini.

Bukti: [hasil nyata](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-minimum-ai/live-result.json>) · [save/reload/review](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-minimum-ai/saved-review-result.json>) · [render](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-minimum-ai/render-check.json>) · [provenance dan integritas](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-minimum-ai/final-proof.json>).

