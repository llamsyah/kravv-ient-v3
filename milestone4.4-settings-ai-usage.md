# M4.4 — Settings Fundamental & AI Usage Control Center

28 Oktober 2026 — **PASS** untuk implementasi lokal dan validasi offline/QA terisolasi.

## Preflight dan batas perubahan

Branch `main`, HEAD `e7f696db368cd358a2aa70eca182e861411bda84`; tidak ada staged/modified tracked files pada awal tugas. `doc/` dan 15 laporan historis untracked dipertahankan. Source lokal menjadi acuan.

Workspace sudah dimuat lewat API terautentikasi sesuai owner. Run Minimum AI menyimpan metadata opsional `minimum.usage`; structured Gemini memakai `gemini.usage`. Keduanya menggunakan `promptTokens`, `outputTokens`, `totalTokens`. Run lama dapat tidak memiliki usage/provenance. D1 menyimpan aggregate workspace JSON; tidak diperlukan migrasi.

Agregasi dilakukan di client atas state owner yang **sudah dimuat**, untuk menghindari API/statistik dan sinkronisasi tambahan. Fungsi tidak membaca journal, PDF, prompt atau respons provider. Autentikasi tetap ditegakkan oleh API workspace yang ada, bukan oleh fungsi agregasi.

## Perubahan per file

| File | Perubahan |
| --- | --- |
| `ient-src/app/settings-workspace.tsx` | Lima bagian Settings, metrik/cakupan token, model breakdown, recent Run, filter, identitas dan batas akses. Menggunakan callback role/navigasi dan Sign out existing. |
| `ient-src/app/settings.css` | Layout navy, navigasi bagian, metrik, tabel dengan scroll terbatas, fokus keyboard dan breakpoint responsif. |
| `ient-src/app/workspace.tsx` | Mengganti blok Settings lama dengan komponen baru, menyambungkan role existing dan tautan ke Run yang tepat; memperbarui deskripsi halaman. |
| `ient-src/app/layout.tsx` | Memuat stylesheet Settings. |
| `ient-src/lib/ai-usage.ts` | Proyeksi immutable, agregasi deterministik, deduplikasi, cakupan, timeframe dan daftar terbaru terbatas. |
| `ient-src/lib/settings-configuration.ts` | Deskripsi publik hanya baca; menggunakan konstanta PDF/prompt/bahasa existing. Literal model/output/timeout dicocokkan terhadap adapter oleh tes. |
| `ient-src/lib/localization-messages.json` | Label baru Indonesia/Inggris tanpa mengganti terjemahan existing. |
| `ient-src/tests/ai-usage.mjs` | Sebelas kelompok skenario agregasi. |
| `ient-src/tests/settings.mjs` | Rendering lima bagian dalam dua bahasa, config, empty/missing data, auth-mode, batas privasi dan label. |
| `ient-src/tests/settings-workflow.mjs` | Fixture QA guarded: dua owner, PDF asli, Run, review, seed metadata fiktif, locale/reload/ownership/signout. Seed hanya dilakukan saat server QA dihentikan. |
| `README.md`, `ient-src/README.md` | Petunjuk fitur dan referensi kontrak/test. |
| `milestone4.4-settings-ai-usage.md` | Laporan ini. |

Tidak ada perubahan pada route/provider/prompt/schema PDF analysis, model Run/storage, autentikasi, dependencies, database atau konfigurasi asli.

## Struktur Settings

- **Umum:** identitas, Workspace ID/email hosted yang tersedia, metode autentikasi, bahasa bersama, Sign out dan role demonstrasi.
- **Penggunaan AI:** All time/30 hari, jumlah Saved Run eligible, tiga metrik token dengan cakupan masing-masing, breakdown model, maksimal 10 Run terbaru dan navigasi ke Run asli.
- **Konfigurasi AI:** Minimum AI `gemini-3.5-flash-lite`, `minimum-pdf-text-v2`, 1–5 PDF, 10 MiB/file, 12 MiB total, 8.192 output tokens, 90 detik dan `id-ID`/`en-US`. Structured Gemini lama dijelaskan sebagai jalur terpisah. Tanpa selector model/editor key/kontrol palsu.
- **Keamanan & Akses:** Access Gate lokal, legacy yang belum terverifikasi, atau identitas ChatGPT/Sites; status pemuatan workspace terakhir, Sign out dan batas role prototipe.
- **Sistem & Tentang:** lingkungan yang dapat diketahui, D1/R2, pengiriman PDF hanya atas aksi analisis eksplisit, perbedaan AI/Human Review dan keterbatasan prototipe.

Bahasa menggunakan context dan cookie `kravv-locale` existing, default Indonesia, persistensi browser satu tahun. Tidak ada preferensi bahasa kedua atau penerjemahan/regenerasi Run historis.

## Kontrak agregasi AI Usage

1. Eligible: `simulated === false` dengan prefix versi `gemini-text:` atau `gemini:` dan ID Run tersedia. `rules-v1`, simulasi dan tipe tidak dikenali tidak dihitung.
2. Input hanya Saved Run. Request gagal, generation belum tersimpan dan journal tidak dibaca/dihitung; angka bukan seluruh request provider atau tagihan akun.
3. Deduplikasi workspace memakai ID Run dan request ID tersimpan dalam namespace Minimum/structured masing-masing. ID request plaintext lama dapat diambil dari format ID `GEMINI-TEXT-<UUID>`. Sebelum filter, kandidat diurutkan deterministik menurut `createdAt`, ID Run dan ID case. Record kanonis pertama dipakai; field duplikat tidak digabung atau direkayasa.
4. Tiap field token valid hanya bila number berupa safe integer nonnegatif. String, pecahan, negatif, null, NaN/infinity dan nilai di luar safe integer dianggap tidak tersedia. Nol tampil hanya jika benar-benar dilaporkan.
5. Input/output/total dijumlahkan **terpisah**, memakai BigInt agar jumlah besar tetap presisi. Setiap metrik menunjukkan jumlah Run pelapor dibanding jumlah Run eligible. Tanpa nilai yang dilaporkan, tampil **Tidak dilaporkan**, termasuk workspace kosong. Total provider tidak diturunkan dari input+output.
6. Model berasal dari metadata model tersimpan, lalu modelVersion/versi Run jika tersedia; tidak memakai model aktif sebagai pengganti histori. Jumlah PDF berasal dari ID unik di provenance tersimpan, tidak dari dokumen case saat ini. Provenance tidak tersedia/invalid tetap unknown.
7. All time mencakup histori tanpa tanggal. Last 30 days memakai interval inklusif `now − 30×24 jam` sampai `now` ketika tampilan Settings dibuka. Tanggal hilang/invalid/future dikecualikan. Tidak ada estimasi waktu atau token.
8. Proyeksi recent tidak memuat assessment, findings, bytes PDF, prompt atau isi journal. Urut terbaru, default 10 dan batas fungsi maksimum 50; pembatasan daftar tidak membatasi total. Tidak ada biaya perkiraan atau klaim billing.

## Validasi terverifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Typecheck, lint, production build source final | **PASS**. Lint: 0 error, dua warning lama. Build dilakukan pada source copy fisik QA; warning bundling nonfatal. |
| Agregasi baru | **11 kelompok PASS**: kosong/simulasi, complete/multi-model, historical/partial, valid zero/invalid values, replay, namespace, provenance, timeframe, immutable/order-independent, integer besar dan 1.001 Run dengan recent terbatas. |
| Rendering Settings/localization | **PASS**: lima bagian × dua bahasa, empty/unknown, config versus adapter, semua label baru, signout local/legacy/hosted, tanpa request atau output privat dalam monitoring. Regresi localization existing lulus. |
| AI/PDF/presentation existing | **PASS**: 48 skenario Minimum AI, structured adapter mock, input PDF dan 13 kelompok presentasi histori/Markdown/Decision. |
| Route dan persistence QA | **PASS**: dua owner; API anonymous/spoof ditolak; PDF lintas owner tidak tersedia; state owner sendiri, locale/reload, download, rules-v1, review dan Sign out tetap benar. |
| Data usage tersimpan QA | **PASS**: 4 Run fiktif tersimpan menghasilkan input 137 (3/4 pelapor), output 30 (2/4), total provider 209 (3/4), termasuk histori tanpa usage/provenance. Ini fixture offline, bukan generation baru. |
| Browser | **PASS**: filter, bahasa bersama/reload, role Partner→Analyst, keyboard activation, model hanya baca, tautan ke Run historis yang tepat, Sign out; log error kosong. Desktop dan viewport sempit aktual 469 CSS px diperiksa, lebar dokumen sama dengan viewport. Override viewport dipulihkan. |
| Workflow/auth existing | **PASS**: workflow bisnis, analysis/history dan auth-access termasuk server restart mengembalikan signed session dan workspace lengkap. |
| Integritas | **PASS**: Company/Case/PDF/Run/Human Review QA identik setelah interaksi; hanya dua revisi role demo yang diharapkan. Hash D1/R2, registry akses, signing key, secret dan `doc/` asli tetap identik. |

**Generation nyata: 0. Metadata provider: 0.** QA menggunakan key kosong, D1/R2 terpisah dan data fiktif; tes adapter memakai transport mock. Tidak menyalin credential asli atau respons provider privat. Bukti/screenshot/log QA tetap di luar repository. Server dan tab QA dihentikan setelah validasi.

## Keterbatasan dan M4.5

Usage menunjukkan histori tersimpan yang tersedia, bukan kuota live, seluruh percobaan provider, billing atau verifikasi independen. Usage/provenance yang dahulu tidak disimpan tidak dipulihkan. Konfigurasi tetap publik/hanya baca; tes mendeteksi jika literal adapter berubah. Section/filter Settings tidak dipersistenkan; bahasa tetap memakai mekanisme existing. Workspace aggregate masih dimuat utuh, belum sistem analytics skala produksi.

Status sesi adalah hasil load terakhir, bukan monitoring expiry real time. Mode hosted diverifikasi melalui rendering/kontrak existing, bukan login hosted live. Tidak ada klaim production readiness atau tenancy firma kolaboratif.

**Ditunda ke M4.5 Access Gate Hardening:** evaluasi rate limiting, pengelolaan/pergantian kredensial dan recovery, pencabutan perangkat/sesi, MFA serta penguatan batas akses. Tidak diimplementasikan di M4.4.

Tidak ada staging, commit, push, deployment, migrasi atau perubahan model. **Verdict akhir: PASS.**
