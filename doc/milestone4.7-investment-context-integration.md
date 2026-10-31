# M4.7 — Investment Context Integration

Tanggal: 29 Oktober 2026, Asia/Jakarta. **Verdict: PASS untuk implementasi lokal dan validasi offline.** Tidak ada pengujian provider nyata; kepatuhan keluaran Gemini terhadap instruksi baru belum dibuktikan secara live.

## 1. Baseline dan hasil

Branch `main`, baseline dan HEAD akhir tetap **`62267c05ce9823fc6aecea1c07ff5a0d6d5e7cff`**. Pemeriksaan remote pada preflight mengonfirmasi SHA yang sama. Index kosong; `doc/` dan 15 laporan historis lokal tetap dipertahankan.

Alur M4.6 tetap menjadi fondasi: Saved Reports → Report Detail / Human Review → Compare → New Analysis. Jalur Minimum AI yang sama kini menambahkan konteks investasi terstruktur ke PDF input dan menyimpan snapshot yang benar-benar digunakan. Tidak ada jalur generation kedua, model baru, atau schema migration.

## 2. File

Semua path berikut berada di `ient-src/`.

| File | Perubahan |
| --- | --- |
| `lib/investment-context.ts` — baru | Tipe, allowlist, batas, normalisasi, builder deterministik, validasi snapshot dan serialisasi JSON. |
| `lib/minimum-analysis.ts` | Metadata opsional `minimum.investmentContext`; kontrak PDF lama tetap. |
| `lib/minimum-analysis-prompt.ts` | Prompt `minimum-pdf-text-v3`, pemisahan business assessment/fit dan batas kepercayaan konteks. |
| `app/api/analysis/minimum/route.ts` | Penyusunan input, pembekuan context pada journal, intent version, replay lama dan penyimpanan snapshot ke Run. |
| `app/investment-context.tsx` — baru | Preview, frozen context reader, missing-context state dan lokalisasi. |
| `app/investment-context.css` — baru | Layout konteks desktop/mobile. |
| `app/analysis-workspace.tsx` | Preview pada New Analysis; context used pada pembaca laporan yang juga dipakai Compare. |
| `app/workspace.tsx` | Company yang tepat dan callback Edit Context yang sudah ada diteruskan ke Analysis. |
| `app/forms.ts` | Label strategi diperjelas sebagai strategi yang dicatat untuk Case ini; field/action editor tetap. |
| `app/layout.tsx` | Impor stylesheet konteks. |
| `lib/analysis-presentation.ts` | Parser enam bagian menerima v2 dan v3; fallback dan v1 dipertahankan. |
| `lib/localization-messages.json` | Pesan baru Indonesia/Inggris; terjemahan lama tetap. |
| `tests/investment-context.mjs` — baru | Builder, keamanan serialisasi, prompt, SSR bilingual, provenance dan Compare. |
| `tests/investment-context-lifecycle.mjs` — baru | Replay, immutable context, legacy intent, conflict/uncertain save dan timeout. |
| `tests/investment-context-workflow.mjs` — baru | Harness route nyata yang dijaga untuk QA fisik terisolasi dan transport non-forwarding. |
| `tests/minimum-analysis.mjs` | Ekspektasi tambahan context part dan versi baru; harness mock lama dipakai ulang. |
| `tests/minimum-analysis-prompt.mjs` | Ekspektasi prompt v3 dengan disiplin lama tetap. |
| `tests/minimum-workers.mjs` | Pemeriksaan context part pada workerd dan batas multi-PDF yang sama. |

Tambahan di root: laporan ini. Total **18 file source/test ditambah 1 laporan**. Model WorkspaceState, storage, autentikasi, document API, provider structured, dependency dan konfigurasi Cloudflare tidak diubah. Core Report History M4.6, renderer Markdown, Decision reference, AI Usage dan workflow derivation M4.5 juga tetap.

## 3. Field dan kontrak konteks

Versi: **`investment-context-v1`**. Klasifikasi tetap: **`analyst-recorded-not-verified`**.

| Kelompok | Field yang disertakan | Batas per nilai, Unicode code points |
| --- | --- | --- |
| Company | `name` | 200 |
| Company | `sector`, `geography` | 160 masing-masing |
| Case | `name` | 200 |
| Case | `investmentStage` | 80 |
| Case | `strategy` | 1.200 |
| Case | `thesis` | 4.000 |
| Case | `roundSize`, `checkSize`, `valuation` | 200 masing-masing |
| Request | `analysisContext` dari nama konteks analisis yang dipilih | 200 |

Struktur:

```ts
{
  version: 'investment-context-v1',
  classification: 'analyst-recorded-not-verified',
  company: { name?, sector?, geography? },
  investmentCase: {
    name?, investmentStage?, strategy?, thesis?,
    roundSize?, checkSize?, valuation?
  },
  analysisContext?,
  truncatedFields?
}
```

Field dipilih untuk identitas bisnis, perspektif evaluasi, tahap pendanaan dan parameter transaksi. Strategi bukan mandat fund organisasi. `analysisContext` bukan perubahan lifecycle atau persetujuan IC.

Website, owner, deal source, lead, notes, activity, Evidence, Human Review, histori Run dan portfolio tidak disertakan. Tidak ada akses ke credential/session/recovery key/API key dalam builder. Objek Company/Case/Workspace tidak dikirim utuh. Journal baru tidak lagi menduplikasi objek Company lengkap dan tesis Case di luar snapshot; field provenance lama tetap dapat dibaca untuk kompatibilitas.

Normalisasi: Unicode NFC, CRLF menjadi LF, control characters yang tidak sesuai diganti spasi, whitespace tepi dibuang. Nilai panjang dipotong pada batas Unicode tanpa membelah emoji/surrogate pair; `truncatedFields` menyatakan field yang tidak lengkap. UI menampilkan nama field terkait dan instruksi memperlakukan nilai tersebut sebagai parsial. Angka, satuan dan mata uang tetap berupa teks; tidak ada parsing nominal ambigu atau default imajiner. Field kosong dihilangkan; kekurangan field opsional tidak menghalangi PDF analysis.

## 4. Integrasi input dan batas kepercayaan

Request Minimum tetap memakai endpoint/model **`gemini-3.5-flash-lite:generateContent`** dan `contents[0].role = user`. Urutan parts:

1. Instruksi multi-PDF/source labeling yang sama.
2. Pasangan metadata `SOURCE-n` dan native `inlineData` PDF yang sama, sesuai urutan pilihan.
3. Satu text part JSON: `{kind: 'analyst_recorded_investment_context', snapshot: ...}`.
4. Instruksi analisis tetap dari prompt v3, dalam locale id-ID atau en-US.

Konteks tidak diinterpolasi ke instruksi tetap dan tidak memperoleh instruction role. Delimiter, newline dan teks instruksi dalam nilai tetap merupakan string JSON. Prompt secara eksplisit menolak instruksi dari context/PDF untuk mengubah peran, menyatakan approval, mengganti atribusi, atau meminta secret. Ini pembatasan struktur dan instruksi yang diuji offline, **bukan jaminan bahwa LLM kebal prompt injection**.

Business assessment dan investment fit diminta dipisahkan dalam enam bagian yang sama, terutama ringkasan, temuan dan kesimpulan sementara. Fit dievaluasi hanya terhadap strategi/tesis/stage/parameter yang dicatat. Dokumen adalah klaim dari sumber; konteks adalah asumsi/perspektif Analis. Konflik harus menyebut kedua asal klaim dan kebutuhan verifikasi. Missing data berarti informasi tidak cukup; tidak ada fund mandate, score, ownership, return atau angka finansial yang diada-adakan. Tidak ada automatic approval/rejection atau Evidence otomatis.

Generation config tetap `maxOutputTokens: 8192`, tanpa JSON schema atau sampling parameter tambahan. Batas 1–5 PDF, 10 MiB per file, 12 MiB total, request budget, response/journal budget, redirect rejection, sanitasi, deadline tunggal 90 detik dan no-auto-retry tetap.

## 5. Journal, replay dan provenance

- Snapshot dibuat server-side dari Company milik Case pada workspace terautentikasi setelah validasi PDF dan revisi; payload client tidak dapat menyuplai context override.
- Snapshot ikut dalam hash intent baru dengan `intentVersion: investment-context-v1`, lalu dibekukan pada atomic journal claim sebelum provider dipanggil.
- `MINIMUM_INPUT_VERSION = minimum-multi-pdf-v1` tetap sebagai kontrak PDF. Tidak ada penggantian hash legacy secara global.
- Cabang intent tanpa versi, `locale-v1`, dan `minimum-multi-pdf-v1` memakai formula hash semula dan snapshot dokumen lama. Mereka tidak diberi context provenance baru secara retroaktif.
- Replay menggunakan journal asli, bukan tesis/strategi/Company/PDF terkini. Perubahan nilai Case/Company tidak mengganti context request lama. ID baru mengambil context terkini; ID yang sama tidak dapat mengganti Case, pilihan/urutan PDF, nama konteks atau locale.
- Context journal versi baru yang hilang/malformed ditolak pada replay maupun save, tanpa generation ulang. Revision conflict dan uncertain save memulihkan response/context awal dengan revisi penyimpanan yang sesuai.
- Run baru menyimpan clone snapshot di `Run.minimum.investmentContext`. Teks model di `assessment` tetap persis; tidak ada fabricated findings/citations atau structured-validation claim.
- M4.6 tetap mengonfirmasi ID Run tepat dari respons yang sudah tersimpan. Human Review tetap memakai ID Run tersebut.

## 6. UI dan kompatibilitas histori

New Analysis menampilkan **Konteks Investasi** yang ringkas dan read-only, termasuk klasifikasi asumsi, field tersedia, field belum ditentukan, versi dan pemberitahuan truncation. Tombol Edit Context memakai form/action yang sama; tidak ada editor kedua atau preview API/provider call. Preview menjelaskan bahwa rechecking request lama mempertahankan snapshot awal, sedangkan nilai Case saat ini berlaku bagi request baru.

Report Detail menampilkan **Konteks Investasi yang Digunakan** dari Run tersimpan. Mengedit Case kemudian tidak mengubahnya. Compare memakai pembaca yang sama sehingga kedua context snapshot dapat dibaca secara manual; ketika salah satu tidak ada, informasi itu ditampilkan jujur. Run lama tidak direkonstruksi dari Case terkini. Simulasi tetap dijelaskan tidak memakai Gemini investment context.

Saved Reports, sorting/filter, navigasi lintas Case/Run, original Markdown, enam section v2/v3, fallback historis v1, provenance PDF, Human Review, diligence, rekomendasi dan keputusan manusia tetap. Tidak ada linkage Recommendation/Decision-to-Run baru.

## 7. Validasi

| Pemeriksaan | Hasil |
| --- | --- |
| Typecheck | PASS. |
| Lint | PASS: 0 error; dua warning lama tentang `Case` yang tidak dipakai dan `location.assign`. |
| Production build pada QA terisolasi | PASS. Source route produksi dipulihkan, transport fixture dihapus dan key QA dikosongkan sebelum build. Warning bundling Vinext lama tetap. |
| Context contract/prompt/SSR | PASS, 9 kelompok: lengkap/parsial/kosong, panjang, Unicode, nominal ambigu, hostile text, allowlist, v3, frozen reader dan compare. |
| Context lifecycle | PASS, 12 kelompok tambahan, memakai harness yang sama dengan 48 skenario Minimum lama. |
| Minimum Analysis lama | PASS, 48 skenario mocked, termasuk ownership, replay, uncertain save, timeout, multi-PDF dan original text. |
| Prompt contract | PASS, default Indonesia/opsi Inggris, finansial, source handling dan enam heading tetap. |
| Workerd | PASS: lima PDF pada total 12 MiB, context part, saved Run dan replay; satu outbound mock, nol Google request. Payload sekitar 16,79 MB, di bawah budget yang sama. |
| Structured Gemini adapter / error diagnostics | PASS, termasuk 25 skenario bounded diagnostics; tidak ada provider nyata. |
| Document input | PASS, ownership, format/availability, multiple PDF, size/count/stream budgets dan histori. |
| M4.6 Report History / presentation | PASS: 12 dan 13 kelompok. |
| M4.5 workflow | PASS: 15 kelompok; route `analysis-workflow` dan `workflow` juga lulus di QA terpisah. |
| M4.4 Settings / AI Usage | PASS; 11 kelompok usage dan seluruh bagian Settings. Config read-only otomatis mencerminkan prompt v3; kalkulasi usage tetap. |
| Localization | PASS: kamus, placeholder, form, SSR dan UI bilingual; nilai context/report asli tidak diterjemahkan. |
| Diff/security review | PASS: hanya source/test terkait, tanpa dependency/config/auth/storage changes; scan credential/context artifact menghasilkan 0 temuan. Index kosong. |

**QA route nyata:** workspace/account fiktif baru, multipart upload dua PDF untuk Case lengkap dan satu untuk Case parsial/kosong; transport non-forwarding mengembalikan fixture fiktif. **Tiga** panggilan generation mock menghasilkan tiga Run context-aware. Same-ID replay tidak menambah panggilan. Cross-owner, cross-Case dan context override ditolak. Downloads byte-identical, histori v2/rules-v1 tetap, output disimpan persis dan Human Review terkait ke Run yang benar.

**Browser:** preview Indonesia dan Inggris; editor lama; pemilihan dua PDF; jalur generation yang sama dengan transport mock; detail ID hasil simpan; inspeksi context; penyimpanan Review; perubahan tesis/strategi Case sesudah generation; reload membuktikan context lama tetap; New Analysis memakai nilai baru; Compare mixed v3/v2; missing optional fields dan cross-Case isolation. Desktop 1600 px memakai dua kolom. Mobile lebar konten efektif 375 CSS px memiliki `clientWidth = scrollWidth = 375`; disclosure keyboard Enter berfungsi. Console error kosong. Viewport di-reset; tab/server QA ditutup.

Respons fixture sengaja fiktif, bukan hasil AI baru. Kualitas business-versus-fit, kepatuhan bahasa dan ketahanan terhadap prompt injection pada model nyata belum divalidasi. Screenshot, log, account/session QA dan respons fixture tetap di luar repository.

## 8. Integritas, batasan dan stop

Awal/akhir M4.7: **14 workspace identik secara logis**, termasuk state lengkap dan revisi; integrity check `ok`. Seluruh file terlindungi (D1/R2, PDF asli, secret, registry/session/recovery/signing dan `doc/`) juga cocok dengan hash awal M4.7. Pemeriksaan logical digest memakai salinan SQLite privat sementara yang segera dihapus, bukan fixture QA; tidak menyimpan atau mencetak isi row. QA memakai folder, akun dan D1/R2 terpisah, tanpa data bisnis atau credential asli.

Perbedaan hash fisik SQLite pada milestone sebelumnya tetap merupakan temuan historis dengan penyebab belum diketahui. Hasil M4.7 tidak membuktikan penyebabnya dan tidak memperbaiki celah audit awal M4.5 secara retroaktif. Tidak ada reset, restore, penghapusan workspace, rewrite histori atau normalisasi hash.

Batas yang tersisa: input free text tetap asumsi manusia; konteks panjang dapat terpotong secara eksplisit; tidak ada global fund mandate; tidak ada semantic compare, scoring, approval otomatis, chatbot, market retrieval atau M4.8 linkage. Validasi ini membuktikan kontrak dan alur data dengan mock, bukan hasil provider nyata. Live acceptance memerlukan otorisasi terpisah.

**Gemini generation nyata: 0. Gemini metadata: 0. Migrasi: 0. Deployment: 0. Staging/commit/push: 0.** API key, model dan timeout tidak diubah. Implementasi berhenti pada M4.7 dan tetap lokal untuk review.
