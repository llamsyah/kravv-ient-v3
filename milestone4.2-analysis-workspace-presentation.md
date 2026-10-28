# M4.2 — Analysis Workspace & Decision Separation

Tanggal: 27 Oktober 2026. **Verdict: PASS.** Perubahan presentasi sudah diterapkan ke aplikasi lokal dan diverifikasi menggunakan QA terisolasi. **Panggilan Gemini generation: 0; metadata: 0.**

## File yang berubah

Seluruh path berikut relatif terhadap `ient-src/`.

| File | Perubahan |
| --- | --- |
| `app/report-markdown.tsx` (baru) | Renderer Markdown aman dan pembatas URL/media. |
| `lib/analysis-presentation.ts` (baru) | Pengenalan heading ID/EN, pemotongan rentang teks tanpa perubahan isi, kutipan kesimpulan literal, dan pembacaan provenance tersimpan. |
| `app/plaintext-analysis.tsx` (baru) | Enam bagian analisis, navigasi bagian, fallback, serta inspector laporan asli. |
| `app/decision-analysis-reference.tsx` (baru) | Referensi Run ringkas beserta status review dan navigasi ke Run tersebut. |
| `app/analysis-report.css` (baru), `app/layout.tsx` | Tipografi, layout bagian yang bervariasi, fokus keyboard, tabel, dan stacking responsif dengan tema gelap yang ada. |
| `app/analysis-workspace.tsx` | Header Run dengan provenance aktual, Human Review ringkas, dan penggunaan renderer plaintext baru. Cabang historis tetap tersedia. |
| `app/workspace.tsx` | Pemisahan referensi AI, rekomendasi analis, dan keputusan manusia di Decision. Ringkasan case juga memakai referensi ringkas yang sama sehingga laporan lengkap berada di Analysis. |
| `lib/localization-messages.json` | Label baru melalui sistem lokalisasi M4.1. |
| `package.json`, `package-lock.json` | Dependensi renderer dipatok versinya; tidak ada perubahan versi paket lama. Instalasi memakai `--ignore-scripts`. |
| `tests/analysis-presentation.mjs`, `tests/analysis-presentation-workflow.mjs`, `tests/fixtures/analysis-reports.mjs` (baru) | Regresi presentasi dan workflow dengan fixture fiktif; workflow memiliki guard lingkungan QA. |
| `tests/minimum-analysis.mjs` | Menyesuaikan pemeriksaan HTML dengan tampilan Markdown. Pemeriksaan teks Run yang tersimpan tetap identik. |

Total: 15 file aplikasi/package/test ditambah laporan ini. Tidak ada salinan credential, runtime, database QA, atau respons privat provider yang dipromosikan.

## Renderer dan keamanan

Menggunakan `react-markdown@10.1.0` dan `remark-gfm@4.0.1`; `unified@11.0.5`/`remark-parse@11.0.0` membaca AST yang sama untuk batas bagian. Renderer menghasilkan elemen React, mendukung heading, emphasis, paragraf, daftar bertingkat, kutipan, code, dan tabel. Pilihan ini mengikuti [dokumentasi react-markdown](https://github.com/remarkjs/react-markdown) dan [remark-gfm](https://github.com/remarkjs/remark-gfm).

HTML mentah tetap berupa teks ter-escape; tidak memakai `rehype-raw` atau `dangerouslySetInnerHTML`. Tautan hanya HTTP(S) absolut tanpa credential/control character. Protokol berbahaya dan tautan relatif dinonaktifkan. Tautan eksternal menggunakan `noopener noreferrer nofollow` dan tanpa referrer. Gambar/media diganti label teks, tidak dimuat. Checkbox laporan bersifat noninteraktif. Pengujian mencakup script, HTML event handler, iframe, unsafe URL, dan tracking image.

## Analysis dan Decision

Run plaintext Prompt v2 dengan enam heading ID/EN yang cocok secara berurutan mendapat tampilan modular: ringkasan menonjol; temuan berupa kelompok item; risiko terpisah; ketidakpastian sebagai area verifikasi; pertanyaan diligence terorganisasi; dan kesimpulan tersendiri. Warna, navigasi, dan struktur workspace lama dipertahankan.

Pemisahan hanya untuk presentasi. Preamble, heading, paragraf penutup, whitespace, dan isi bagian diambil dari rentang teks asli. Pengujian memastikan penggabungan rentang kembali menghasilkan teks tersimpan persis. Heading hilang, berulang, urutan/nomor salah, bagian kosong, heading tambahan yang ambigu, atau referensi Markdown lintas bagian menggunakan fallback laporan lengkap. Inspector **Laporan asli lengkap / Full original report** tersedia untuk memeriksa output tersimpan apa adanya.

Header menampilkan Run, tanggal, jenis, model yang tercatat, status tersimpan, selector dan aksi persiapan analisis baru. Jumlah dokumen berasal dari provenance Run terstruktur atau snapshot evidence historis. Untuk Run Minimum AI, provenance dokumen memang belum ada pada objek Run; UI menyatakan ketidaktersediaannya, tanpa mengasumsikan satu dokumen atau memakai jumlah dokumen case saat ini.

Decision menampilkan identitas Run, tanggal/model, status analisis, status Human Review, dan maksimal 360 karakter awal paragraf kesimpulan yang terdeteksi dengan aman, ditambah elipsis bila terpotong. Ini kutipan literal yang whitespace-nya dinormalisasi, bukan ringkasan AI baru. Jika deteksi tidak aman, digunakan deskripsi netral. Tombol membuka **Run yang dirujuk**, termasuk ketika selector sebelumnya menunjuk Run lain. Rekomendasi analis dan keputusan akhir tetap menjadi catatan manusia terpisah dengan otorisasi yang ada.

## Kompatibilitas dan bahasa

- Plaintext v1 dan laporan tidak lengkap: fallback Markdown yang terbaca, dengan teks asli tetap tersedia.
- `rules-v1` dan Gemini terstruktur historis: renderer, evidence, sumber, dan diligence yang ada dipertahankan.
- Label baru tersedia dalam `id-ID` dan `en-US`. Bahasa UI tidak menerjemahkan atau meregenerasi isi Run. Laporan Inggris dikenali pada UI Indonesia dan sebaliknya.
- Model, prompt v2, route Minimum AI/structured, kontrak PDF, schema Run, journal/idempotensi, autentikasi, storage, dan API workspace tidak diubah. Tidak ada aktivasi multi-PDF.

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Root `npm run typecheck` | PASS pada aplikasi lokal. |
| Root `npm run lint` | PASS: 0 error; 2 warning lama (`Case` tidak digunakan pada API workspace dan `location.assign` pada sign-out). Tidak ada aturan yang dinonaktifkan. |
| Root `npm run build` | PASS di QA; 162 file source aplikasi yang sudah ada dan seluruh file baru yang dipromosikan cocok dengan aplikasi lokal. Build dilakukan di QA untuk melindungi runtime asli. |
| `node tests/analysis-presentation.mjs` | PASS: 12 kelompok pemeriksaan, termasuk ID/EN/CRLF, keamanan, kehilangan/duplikasi konten, fallback, Decision, metadata, dan renderer historis. |
| `node tests/localization.mjs` | PASS: dictionary, dua bahasa, shell/readiness, dan teks historis. |
| `node tests/minimum-analysis.mjs` | PASS: 35 skenario offline; memakai ulang respons nyata privat yang sudah tersedia. Persistence non-simulated Run, reload, review, provenance, ownership/origin, batas PDF, journal, concurrent claim, replay, dan recovery tetap lolos. Tidak mengirim respons tersebut ke provider. |
| `node tests/gemini-analysis.mjs`, `node tests/analysis-view.mjs` | PASS: regresi adapter terstruktur/persistence serta snapshot evidence dan atribusi historis; transport mock. |
| Workflow HTTP pada QA Workers/D1 | PASS: reload fixture dengan hash Run tetap, penyimpanan Human Review/rekomendasi/keputusan terpisah, Analyst ditolak untuk keputusan akhir, Partner diizinkan, case fiktif lain tetap identik. |
| Browser QA | PASS: ID/EN, inspector asli identik sebelum/sesudah ganti bahasa, fallback, v1, rules-v1, structured, navigasi Run tepat, simpan Human Review dari UI dan reload. Console error kosong. |
| Desktop/mobile | PASS: hierarki dan tabel terbaca; 1440/1600 px desktop dan 390 px mobile. Pada mobile, lebar dokumen 371 px ≤ viewport 390 px; bagian dan Decision tersusun satu kolom. |

Mutasi pengujian hanya pada workspace QA fiktif port 5210, dengan file QA berisi API key kosong. Server/tab QA milik tugas sudah ditutup. Server dan data aplikasi asli tidak dipakai untuk mutasi pengujian.

Verifikasi integritas terhadap baseline M4.2 memastikan isi record dan revisi **13 workspace asli identik**, blob dokumen tetap identik, hash secret tetap, serta seluruh source di luar daftar perubahan tetap identik. Pembacaan database dilakukan dari salinan privat di luar repository. Tujuh tracked deletion lama dan `doc/` dipertahankan; tidak ada staging/commit. Empat file registry dev server berubah selama pengujian; perubahan ini bukan record bisnis dan tidak direstorasi. Verifikasi ini berlaku terhadap baseline M4.2, bukan klaim retroaktif tentang milestone sebelumnya.

## Penggunaan dan batasan

Buka Investment Case → **Analisis**, pilih Run tersimpan. Gunakan navigasi bagian dan inspector laporan asli. Pada **Keputusan**, gunakan **Lihat analisis lengkap** untuk membuka Run rujukan; Human Review/rekomendasi/keputusan memakai alur lama.

Detektor heading sengaja konservatif; variasi heading yang tidak dikenali tetap mendapat laporan lengkap. Detektor tidak memvalidasi fakta atau menghasilkan sumber/counterargument baru. Jumlah dokumen Minimum AI tetap tidak tersedia tanpa provenance pada Run; tidak dilakukan migrasi untuk mengisinya. Uji browser memakai Chromium IAB dan fixture; belum mencakup semua browser, screen reader, atau setiap variasi laporan historis. Tidak ada generation nyata pada milestone ini.

Bukti visual dan hasil integritas tersimpan di luar repository pada folder `m42-validation` dalam workspace visualisasi tugas: `analysis-full.png`, `analysis-mobile-full.png`, `decision-desktop.png`, dan `integrity-result.json`. Tidak ada deploy, push, migrasi, atau pekerjaan multi-document lanjutan.
