# M4.3b — Multi-PDF Live Acceptance

27 Oktober 2026 — **PASS**.

## Request dan hasil provider

- **Tepat 1 POST `generateContent` nyata**, berisi dua native inline PDF; tanpa retry atau fallback. Gate atomik pada R2 QA membatasi transport maksimum satu generation, termasuk bila proses mengalami hot reload.
- Model/model version: **`gemini-3.5-flash-lite`**; prompt `minimum-pdf-text-v2`, locale `id-ID`, Markdown, batas input/output dan timeout 90 detik tetap.
- Provider **HTTP 200**; header diterima setelah **7.243 ms**, body selesai dibaca sekitar **1 ms** berikutnya. Aplikasi **HTTP 200**, sekitar **7,4 detik** keseluruhan.
- Usage provider: 2.190 prompt tokens, 1.760 output tokens, total 3.950. Tidak ada metadata request atau generation tambahan.

## Bukti kedua PDF dianalisis

Kedua PDF valid satu halaman diunggah melalui multipart route asli, tersimpan di R2 QA, dan hasil download cocok dengan hash input. Keduanya dipilih melalui Analysis UI; tidak ada Evidence manual wajib.

| Sumber | Fakta berbeda yang muncul pada hasil nyata |
| --- | --- |
| `commercial-alpha-742.pdf` — 914 byte, SOURCE-1 | ARR **USD 840.000**, **28 pelanggan pembayar**, konsentrasi pelanggan terbesar **22%**, dan **6 pilot** yang belum masuk ARR/pelanggan pembayar. |
| `operations-bravo-319.pdf` — 989 byte, SOURCE-2 | OPEX **USD 95.000/bulan**, kas **USD 570.000**, overdue **75 hari dari 2 pelanggan**, serta hosting tunggal tanpa recovery plan teruji. |

Angka-angka tersebut tampil bersama pada ringkasan eksekutif, lalu dibahas dalam temuan/risiko. Fakta sumber diperiksa terhadap teks PDF dan output tersimpan; bukan sekadar pemeriksaan nama file. Label SOURCE-1/2 sesuai input, bukan sitasi halaman atau klaim verifikasi independen.

## Persistence, UI, dan review

Run tersimpan: `GEMINI-TEXT-56b0dd12-9537-4bd8-8a60-0ee3e81aba9b`.

- Tepat satu Run baru **`simulated: false`**, tanpa fabrikasi field findings/evidence terstruktur.
- Provenance menyimpan kedua ID/filename/ukuran, **kedua ETag**, urutan 1/2, source label, request ID, model, prompt version, locale dan usage. Identik setelah reload dan Human Review; tidak bergantung pada daftar dokumen case saat ini.
- **Enam bagian Analysis** tampil; inspector Markdown asli cocok persis dengan teks Run tersimpan.
- Human Review **Add Context** berhasil disimpan dari UI dan tetap ada setelah reload. Review dicatat terpisah tanpa mengubah output AI.
- Decision hanya menampilkan identitas/status/review dan kutipan singkat kesimpulan. Navigasi membuka Run yang tepat; laporan penuh tetap di Analysis.
- Replay request ID asli mengembalikan **`reused: true`**, tanpa duplikasi Run dan tanpa generation kedua. Counter transport tetap satu.
- Run rules-v1 sebelum pengujian dan seluruh case historis QA tetap identik. Kedua PDF tetap dapat diunduh dengan bytes identik.

## Batasan dan integritas

Ini membuktikan alur nyata **dua PDF kecil**, bukan kapasitas maksimum, ketahanan terhadap seluruh variasi PDF, atau keandalan provider pada banyak percobaan.

Human Review mencatat bahwa istilah model **“piutang macet”** lebih kuat daripada fakta overdue 75 hari, dan asumsi keandalan hosting belum dibuktikan sumber. Estimasi enam bulan merupakan cash/OPEX tanpa inflow, bukan net cash burn/runway tervalidasi. Output asli dipertahankan; tidak dilakukan perbaikan prompt atau generation tambahan.

QA memakai source copy fisik pada port 5213, Vinext 1.3.0, D1/R2 terpisah dan credential privat. Observer QA memeriksa jumlah/hash PDF, membatasi request dan mencatat status/waktu header; response asli dikembalikan tanpa clone atau pembacaan body respons, timer tambahan maupun retry. Prompt, schema, model dan kontrak request asli dicocokkan sebelum generation.

Pemeriksaan akhir memastikan **13 workspace asli beserta revisi/isinya identik**, dokumen/runtime dan hash secret tetap, source aplikasi serta perubahan Git sebelumnya terjaga. Tidak ditemukan key atau base64 PDF pada log diagnostik/Run. Tidak ada source aplikasi yang dipromosikan atau diubah; hanya laporan ini ditambahkan ke repository.

Server/tab QA telah ditutup dan salinan key sementara dihapus. Run, PDF, journal respons provider dan bukti penerimaan tetap privat di folder visualisasi tugas `m43b-live` (`acceptance-result.json`, `saved-run.private.json`, `analysis.private.md`, screenshot, dan storage QA). Tidak ada commit, push, deploy, migrasi, atau M4.4.
