# Investment Analyst Prompt v2 & Bilingual Foundation

**Verdict: PASS — implementasi dan verifikasi offline.** Tidak ada panggilan generation atau metadata Gemini nyata. Kepatuhan dan peningkatan mutu keluaran model belum dibuktikan melalui pengujian langsung.

## Perubahan file

| File | Perubahan |
| --- | --- |
| `ient-src/lib/minimum-analysis-prompt.ts` | Modul baru untuk prinsip analisis bersama, presentasi dua bahasa, allowlist bahasa, dan versi `minimum-pdf-text-v2`. |
| `ient-src/app/api/analysis/minimum/route.ts` | Memakai prompt terpusat, mencatat bahasa pada provenance journal baru, dan memakai versi prompt dari journal saat menyimpan respons. |
| `ient-src/tests/minimum-analysis-prompt.mjs` | Pemeriksaan offline kontrak bahasa, aturan finansial, format, keselamatan dokumen, dan penolakan instruksi bahasa arbitrer. |
| `ient-src/tests/minimum-analysis.mjs` | Memperluas regresi yang sudah ada untuk payload v2, provenance bahasa, pemilihan English internal, dan replay journal lama. |

## Struktur prompt dan bahasa

Prinsip bersama mencakup pembedaan klaim manajemen, data yang dilaporkan, estimasi turunan, interpretasi, dan informasi yang belum tersedia; penalaran investasi yang seimbang; kontra-argumen; serta prioritas verifikasi. Prompt melarang penciptaan angka, benchmark, sumber, nomor halaman, skor, dan keputusan investasi otomatis.

Aturan finansial mempertahankan mata uang, periode, dan satuan asli; membedakan juta/jt, miliar/milyar, triliun, serta `M` berdasarkan konteks dokumen. Contoh MRR Rp 480 juta dan ARR Rp 5,76 M dijelaskan sebagai aturan notasi, bukan data perusahaan. Angka berulang harus diperiksa lintas bagian; konflik yang tidak terselesaikan harus ditandai. Isi PDF tetap diperlakukan sebagai data tidak tepercaya.

Default adalah **`id-ID`**. Enam heading: Ringkasan Eksekutif; Temuan Utama; Risiko dan Kontra-Argumen; Informasi yang Belum Terverifikasi; Pertanyaan Due Diligence; Kesimpulan Sementara. Temuan material memakai Fakta / Data, Interpretasi, Implikasi bagi Investor, dan Ketidakpastian. Istilah investasi Inggris yang lazim dapat dipertahankan.

**`en-US`** tersedia melalui `getMinimumAnalysisPrompt('en-US')`, dengan prinsip yang sama dan heading/label setara dalam English. Nilai selain dua bahasa tersebut ditolak saat runtime. Endpoint publik tetap tidak menerima parameter bahasa. Tidak ada UI bahasa, terjemahan UI, atau penyimpanan preferensi baru.

## Hasil validasi

- Typecheck, lint, dan production build: **PASS**. Lint menyisakan dua warning lama; build dijalankan pada salinan QA terisolasi dengan source aplikasi yang sama.
- Kontrak prompt/bahasa: **PASS**; prinsip finansial dan keselamatan sama untuk kedua bahasa, enam heading sesuai bahasa, serta input bahasa arbitrer ditolak.
- **32 skenario route/workflow/rendering offline PASS**, menggunakan fixture PDF fiktif dan respons QA nyata yang sebelumnya direkam di luar repository. Mencakup autentikasi, origin, kepemilikan, batas PDF, persistence non-simulasi, Human Review, timeout, idempotency/replay, dan pemulihan penyimpanan.
- Regresi histori/analysis view: **PASS**. Journal v1 tanpa field bahasa tetap dapat disimpan dan direplay dengan teks, instruksi, dan versi v1; tidak diterjemahkan atau digenerasi ulang.
- Model tetap `gemini-3.5-flash-lite`; native PDF, bentuk request, `maxOutputTokens: 8192`, limit respons, dan timeout 90 detik tetap. Tidak ada JSON schema, temperature, top-p, atau top-k baru.

## Batasan dan penyambungan preferensi global kelak

Prompt merupakan instruksi untuk model, bukan validator kebenaran angka atau jaminan keluaran mengikuti semua heading. Pengujian ulang respons lama membuktikan kompatibilitas penyimpanan/rendering, bukan mutu hasil v2. Alur tetap satu PDF, plaintext, dan tidak mengirim Evidence manual atau catatan case.

Saat preferensi bahasa global kelak diotorisasi, validasi nilainya di server terhadap allowlist, lalu panggil builder untuk **request baru** dengan bahasa tersebut. Ikat pilihan bahasa ke intent/idempotency request baru dan bekukan bahasa, versi, serta instruksi di provenance. Tangani kompatibilitas hash journal lama secara eksplisit. Replay harus memakai journal asli; saved Run harus selalu dirender apa adanya. Jangan memasukkan instruksi bahasa bebas ke prompt.

Kredensial dan konfigurasi asli tidak disentuh. Hash 22 file runtime asli dan perubahan Git sebelumnya tetap terjaga. Tidak ada migrasi, staging, commit, push, deployment, atau perubahan data bisnis.
