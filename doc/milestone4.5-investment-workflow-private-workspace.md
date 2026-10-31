# M4.5 — Investment Workflow & Private Workspace Experience

28 Oktober 2026 — **PARTIAL**. Implementasi lokal dan validasi fungsional lulus; pembuktian integritas seluruh 14 workspace terhadap keadaan awal M4.5 belum lengkap. Tidak ada data yang direstore/ditimpa untuk menghilangkan perbedaan tersebut.

## 1. Preflight dan baseline

Branch `main`, HEAD `e7f696db368cd358a2aa70eca182e861411bda84`. M4.4 sudah ada sebagai perubahan lokal uncommitted dan menjadi bagian baseline tugas ini. Source sebelum M4.5 dicadangkan di luar repository. Index tetap kosong, HEAD tidak berubah. `doc/`, laporan historis, secrets dan runtime tidak dipublikasikan.

## 2. Audit workflow existing

Company dapat memiliki beberapa Investment Case. Overview menyimpan konteks, Evidence menggabungkan ledger dengan dokumen, Analysis menjalankan Minimum AI atau simulasi dan membuka histori, Diligence mencatat pertanyaan, Decision menyimpan rekomendasi/keputusan manusia, Activity mempertahankan peristiwa. Portfolio dan Settings M4.4 sudah berfungsi. API menggunakan owner-scoped workspace dan optimistic revision; role merupakan demonstrasi pemilik yang sama.

Discovery mencakup shell, Dashboard, Deal Flow, Companies, Overview, Documents/Evidence, Analysis/Saved Run/Human Review, Diligence, Decision/Activity, Portfolio, Settings, Access Gate, localization, model dan action API. Perubahan dibatasi pada friksi yang ditemukan; struktur navigasi utama dan backend dipakai kembali.

## 3. Friksi terverifikasi

- Upload berada setelah ledger Evidence; petunjuk berantai lama memberi kesan Evidence wajib sebelum AI.
- Overview memiliki shortcut generik, tanpa saran langkah yang diturunkan dari record.
- Simulasi terbaru dapat menutupi referensi AI yang lebih lama dan belum direview.
- Pemberitahuan perubahan Evidence manual tidak tepat untuk Minimum AI yang tidak mengirim Evidence.
- Company dengan beberapa case sulit dibedakan pada daftar tanpa nama case.
- Header Run analysis bersaing dengan aksi kontekstual; role penuh tidak terlihat jelas pada layar sempit.
- Identitas portal belum cukup menjelaskan konteks internal Venture Capital dan keterbatasan workspace per operator.

## 4. Information architecture akhir

Global: Dashboard, Deal Flow, Companies, Portfolio, Documents, Settings tetap. Case: Overview, Evidence, Analysis, Diligence, Decision, Activity tetap. Tidak ada destinasi kosong atau tab baru.

Overview menjadi command center: identitas perusahaan/case, tahap pendanaan, stage peluang, enam indikator pekerjaan, next action, konteks investasi, Evidence tercatat, diligence dan referensi penilaian manusia. Indikator pekerjaan dipisahkan dari stage peluang; tidak ada completion percentage atau status workflow baru yang dipersistenkan.

## 5. Workflow yang diimplementasikan

- Next action berasal dari record: review AI yang belum direview, diligence terbuka, keputusan yang sudah tercatat, persiapan AI bila ada kandidat PDF tanpa AI, pengumpulan sumber, atau rekomendasi/keputusan. Ini saran navigasi, bukan gating baru. Pekerjaan dapat ditinjau ulang dalam urutan lain.
- Dokumen tampil sebelum ledger Evidence, dengan upload existing dan jalur langsung ke persiapan AI. Anchor membawa pengguna ke dokumen atau ledger yang tepat dalam tab existing.
- Kandidat PDF dihitung dari metadata file asli, ekstensi dan batas per file. Ini **bukan** bukti R2 tersedia, format valid, atau readiness terverifikasi; server tetap memeriksa semuanya.
- Saved AI terbaru dipilih dari histori existing yang newest-first, dengan `simulated: false` dan versi Gemini; simulasi terbaru tidak menyembunyikannya. Semua Run tetap dapat dipilih, dengan suffix ID yang lebih berguna pada selector.
- Setelah laporan, pengguna dapat memeriksa sumber, membuka form Evidence manual atau pertanyaan diligence, dan melakukan Human Review terhadap Run yang tepat. Tidak ada klaim/pertanyaan yang dibuat otomatis.
- Pemberitahuan delta Evidence hanya dipertahankan untuk jalur yang memakai snapshot Evidence, bukan Minimum AI plaintext.
- Rekomendasi, Human Review dan keputusan tetap berbeda. Recommendation recorded tidak berarti keputusan disetujui; adanya keputusan tidak disimpulkan dari stage atau AI.
- Nama case ditambahkan pada daftar case dan konteks dokumen. Referensi Overview/Decision memakai AI tersimpan bila tersedia. Portfolio dan Activity tidak dihapus.

## 6. Private workspace dan role

Portal menampilkan restricted investment workspace, konteks Venture Capital, serta penjelasan setup lokal per operator. Workspace ID, Access Phrase, Recovery Key, recovery, initialization dan Sign out memakai mekanisme existing. Tidak dibuat public signup, employee account, MFA, approval queue atau kontrol keamanan baru.

Shell menampilkan Investment Analyst, Investment Partner atau Administrator dengan label **Role demo**. Enum tersimpan `Analyst/Partner/Admin` dan permission API tidak berubah. Ini tanggung jawab organisasi yang didemonstrasikan, bukan hierarki wajib, identitas karyawan terpisah atau administrasi multi-user. Tidak ada nama badan hukum pelanggan yang dikarang.

## 7. File perubahan M4.5

| File | Perubahan |
| --- | --- |
| `ient-src/lib/case-workflow.ts` | Derivasi immutable next action, kandidat PDF, AI/review dan label tanggung jawab role. |
| `ient-src/app/case-workflow-overview.tsx` | Command center dan navigasi indikator/next action. |
| `ient-src/app/workflow.css` | Layout, indikator, handoff, role chip dan breakpoint. |
| `ient-src/app/workspace.tsx` | Integrasi Overview, source-first Evidence, anchor, Dashboard review, konteks case dan Decision guidance. Baris integrasi Settings M4.4 dipertahankan. |
| `ient-src/app/analysis-workspace.tsx` | Handoff manual opsional, pemberitahuan Evidence yang sesuai jalur, suffix histori Run. |
| `ient-src/app/decision-analysis-reference.tsx` | Label simulasi lama yang eksplisit. |
| `ient-src/app/workspace-shell.tsx` | Identitas internal VC dan role demo yang terlihat. |
| `ient-src/app/surface-ui.tsx` | Panduan Evidence: satu dokumen utama, referensi tambahan manual. |
| `ient-src/app/layout.tsx` | Memuat stylesheet workflow, mempertahankan Settings. |
| `ient-src/build/access-pages.mjs` | Copy/presentasi portal; kontrol autentikasi existing tetap. |
| `ient-src/lib/localization-messages.json` | Label bilingual ditambahkan; nilai terjemahan M4.4 dipertahankan. |
| `ient-src/tests/case-workflow.mjs` | 15 kelompok derivasi/rendering, histori, role dan portal bilingual. |
| `ient-src/tests/fixtures/workflow-cases.mjs` | Delapan skenario yang jelas fiktif, bukan respons provider nyata. |
| `ient-src/tests/workflow-experience.mjs` | Test guarded QA: real upload/readiness, ownership, histori dan permission. |
| `milestone4.5-investment-workflow-private-workspace.md` | Laporan ini. |

Tidak ada perubahan request Gemini, prompt, model, timeout, PDF limits, Saved Run/schema, API bisnis, storage, auth gate/store, dependencies atau migrasi. Core file Settings/usage M4.4 cocok byte demi byte dengan backup awal M4.5.

## 8. Before / after journey

Sebelum: buka case → cari upload di bawah ledger → pahami shortcut generik → cari Run/review dan langkah manusia berikutnya.

Sesudah: buka case → lihat status pekerjaan dan next action → dokumen asli/upload → pilih PDF di Analysis tanpa Evidence wajib → baca Saved Run → inspeksi sumber/validasi manual/diligence → Human Review → rekomendasi analis → keputusan manusia sesuai izin existing. Tidak ada analisis atau keputusan baru yang dibuat hanya dengan navigasi.

## 9. QA desktop/mobile dan otomatis

QA memakai salinan source fisik, D1/R2 baru, dua operator fiktif dan key kosong. Host `127.0.0.1:5216` memisahkan cookie dari app `localhost`. Ada delapan case dalam satu Company; PDF diunggah lewat route asli. Histori laporan/review/keputusan adalah fixture eksplisit, bukan generation nyata.

- **PASS:** typecheck, lint (0 error, dua warning lama), production build source final.
- **PASS:** 15 kelompok workflow/rendering, localization existing, analysis-view, 13 kelompok presentation, 48 skenario Minimum AI, structured adapter mock, document input, Settings dan 11 kelompok usage M4.4.
- **PASS:** workflow bisnis dan analysis-workflow existing; Human Review, recommendation, Partner/Admin decision restriction, Portfolio, Activity, konflik revisi dan histori.
- **PASS:** source download identik, readiness tanpa Evidence, owner isolation, state tidak berubah saat readiness. Penolakan Analyst tetap HTTP 400 dengan alasan Partner/Admin, sesuai perilaku existing.
- **PASS:** auth-access, recovery/session/signout dan restart signed session/workspace.
- **PASS browser:** Overview kosong dan tujuh kondisi lain; AI historis tetap terbuka ketika Run terbaru adalah simulasi; handoff laporan → sumber → persiapan AI dengan 0 Evidence; keputusan manusia dan tombol keputusan Analyst disabled; bahasa Inggris, keyboard navigation, desktop dan mobile aktual 375 CSS px tanpa overflow halaman. Viewport dikembalikan. Log error browser kosong. Tidak menekan tombol generation.

Bukti/screenshot/log QA tetap di luar repository. Server/tab QA ditutup setelah pengujian.

## 10. Integritas: verified versus belum pasti

**Verified:** R2/original PDFs, credential/session/recovery registry, signing key, API key dan `doc/` cocok dengan hash awal M4.5. Core M4.4 dan kontrak provider/auth/dependency tetap. Seluruh histori QA identik setelah navigasi browser. Tidak ada owner QA yang masuk ke database asli. SQLite asli lulus `integrity_check`. Semua **13 workspace baseline publikasi lama**, termasuk data dan revisi, masih identik dalam salinan pemeriksaan.

**Belum pasti:** database asli sekarang memiliki **14 workspace**; satu workspace tambahan berada di luar baseline publikasi lama. Hash file utama SQLite berbeda dari hash awal M4.5. Snapshot awal M4.5 menyimpan hash file, tetapi tidak menyimpan salinan lengkap database atau row snapshot untuk seluruh 14 workspace. Karena itu penyebab perubahan fisik dan kesamaan logis penuh awal-versus-akhir untuk seluruh 14 workspace **tidak dapat dibuktikan**. Hipotesis checkpoint/header-only telah diperiksa dan tidak terbukti; laporan tidak menyatakannya sebagai root cause.

Database asli tidak dibuka melalui SQLite untuk pemeriksaan ini; query dilakukan pada salinan privat. Tidak ada restore, reset, penghapusan atau overwrite data untuk memaksakan kecocokan. Rekonsiliasi workspace tambahan memerlukan snapshot terpercaya yang sesuai waktu awal M4.5 atau peninjauan terpisah terhadap keadaan aktual. Jangan memakai baseline 13 workspace sebagai alasan menghapus workspace ke-14.

## 11. Batasan dan deferred improvements

Indikator menunjukkan pekerjaan tercatat, bukan verifikasi independen atau approval. Ledger tetap satu dokumen utama per Evidence; referensi tambahan dicatat manual, tanpa rekonsiliasi otomatis. Tidak ada shared firm tenancy, employee administration, SSO/MFA, security certification, scoring atau AI baru. Peningkatan search lintas laporan, skala analytics, formal IC governance dan Access Gate hardening tetap terpisah.

**Generation Gemini: 0. Metadata calls: 0.** Tidak ada deployment, migrasi, staging, commit atau push. **Verdict: PARTIAL karena batas pembuktian integritas database di atas; implementasi dan validasi fungsional selesai.**
