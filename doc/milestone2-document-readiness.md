# KRAVV-IENT V3 — Milestone 2: Document Readiness

Implementasi: 25 Oktober 2026. Penyelesaian verifikasi: 26 Oktober 2026 (Asia/Jakarta).

## Hasil dan batas lingkup

Satu Investment Case sekarang dapat memilih beberapa PDF asli dan memeriksa kesiapannya melalui server yang terautentikasi. Manual Evidence tidak diperlukan. Jalur input server untuk adapter Milestone 3 tersedia; Gemini belum dipanggil atau diintegrasikan.

Keputusan arsitektur menggunakan PDF asli, mengikuti [native PDF document understanding Gemini](https://ai.google.dev/gemini-api/docs/document-processing). Tidak ditambahkan parser PDF, OCR, RAG, embeddings, indexing, dependensi baru, migrasi skema, atau salinan permanen PDF.

## Berkas Milestone 2

| Berkas | Peran |
| --- | --- |
| `ient-src/lib/document-input.ts` | Konstanta batas dan tipe metadata yang aman dipakai UI. |
| `ient-src/lib/document-input.server.ts` | Entry point server: identitas, kepemilikan kasus, validasi, dan pembacaan byte asli R2. |
| `ient-src/app/api/analysis/documents/route.ts` | Endpoint pemeriksaan yang hanya mengembalikan metadata. |
| `ient-src/app/document-readiness.tsx` | Pilihan PDF sementara dan hasil pemeriksaan di Analysis readiness. |
| `ient-src/app/analysis-workspace.tsx` | Memasang komponen readiness pada alur yang sudah ada. |
| `ient-src/app/analysis.css` | Styling terlokalisasi untuk daftar checkbox PDF. |
| `ient-src/tests/document-input.mjs` | Regresi kontrak server dengan storage di memori. |
| `ient-src/tests/document-readiness.mjs` | Regresi API dengan akun dan dokumen QA fiktif. |
| `README.md`, `ient-src/README.md` | Tujuan native-PDF, batas saat ini, dan perintah pengujian. |
| `milestone2-document-readiness.md` | Antarmuka, hasil uji, dan batas verifikasi. |

API upload/download, model domain, `rules-v1`, persistence, autentikasi, Decision, Portfolio, serta riwayat Run tidak diubah. Perubahan Milestone 1 dan perubahan Git pengguna tetap dipertahankan.

## Pemeriksaan dan batas input

- Maksimum **5 PDF**, **10 MiB per PDF**, **12 MiB gabungan**. Ini batas prototipe untuk input/memori, bukan klaim batas provider Gemini. Batas upload lama 20 MiB tetap.
- Semua ID harus berada di `docs` milik **kasus yang dipilih** pada workspace identitas aktif. Dokumen kasus lain ditolak meskipun pemilik workspace sama.
- Seluruh ID diperiksa kepemilikannya sebelum ada pembacaan byte sumber. Pemanggil tidak dapat memasok owner atau storage key.
- Harus berupa nama `.pdf`/`.PDF`, ukuran positif, dan berkas upload asli. `sampleText` fixture tidak digunakan sebagai PDF.
- R2 dibaca menggunakan kunci lama `${userId}/${documentId}`. Tidak ada penulisan atau penggandaan objek PDF.
- Ukuran aktual R2 harus cocok dengan metadata. Pembacaan stream dibatasi ukuran yang sudah divalidasi; stream terlalu panjang/pendek ditolak.
- Format diperiksa melalui header `%PDF-1.0` sampai `%PDF-1.7` atau `%PDF-2.0`, serta penanda akhir `%%EOF`. Ini pemeriksaan dasar, bukan validasi struktur PDF lengkap.
- Jika satu dokumen gagal, tidak ada input parsial yang dikembalikan sebagai siap.

## Antarmuka server yang dipakai Milestone 3

Import hanya dari modul server, dalam request yang terautentikasi:

```ts
import {prepareCasePdfInput} from '@/lib/document-input.server';

const input = await prepareCasePdfInput({
  caseId,
  documentIds, // string[], urutan dipertahankan
});
```

Signature implementasi:

```ts
prepareCasePdfInput(selection: unknown): Promise<PreparedCasePdfInput>

type PreparedCasePdfInput = {
  version: 'case-pdf-input-v1';
  caseId: string;
  workspaceRevision: number;
  totalBytes: number;
  documents: {
    documentId: string;
    originalFilename: string;
    mimeType: 'application/pdf';
    sizeBytes: number;
    source: {
      description: string;
      documentType: string;
      uploadedAt: string;
      uploadedBy: string;
    };
    bytes: Uint8Array;
    storageEtag: string;
  }[];
};
```

Fungsi mengautentikasi sendiri melalui identitas request. `bytes` adalah isi PDF asli dalam memori, tidak di-encode base64 atau dikirim ke provider pada milestone ini. ETag mengidentifikasi versi objek R2 yang dibaca; tidak diklaim sebagai SHA-256.

Milestone 3 harus memanggil fungsi ini lagi pada request analisis, menyusun konteks Company/Case melalui batas identitas yang sama, serta memeriksa revision ketika menyimpan hasil. Hasil readiness browser bukan token otorisasi atau jaminan dokumen masih tersedia. Bytes/ETag tidak boleh dimasukkan ke respons client, log, atau JSON Run tanpa keputusan kontrak tersendiri. Pemilihan dokumen di UI masih lokal pada komponen; pengiriman pilihan ke tindakan analisis nyata menjadi pekerjaan Milestone 3.

## Endpoint readiness untuk UI

```http
POST /api/analysis/documents
Content-Type: application/json

{"caseId":"CASE-...","documentIds":["document-id-1","document-id-2"]}
```

Respons 200 memakai bentuk metadata kontrak di atas, **tanpa `bytes` dan `storageEtag`**. Tidak ada storage key atau public URL. Header respons: `Cache-Control: private, no-store`. Endpoint tidak menyimpan pilihan, activity, revision baru, atau Analysis Run. Origin lintas situs ditolak.

| Status | Code | Arti |
| --- | --- | --- |
| 400 | `INVALID_REQUEST`, `INVALID_SELECTION`, `DUPLICATE_DOCUMENT` | JSON/seleksi tidak valid, kosong, melebihi jumlah, atau ID berulang. |
| 400 | `INVALID_PDF`, `EMPTY_PDF` | Format, fixture, ekstensi, atau ukuran metadata tidak memenuhi pemeriksaan. |
| 401 | `AUTH_REQUIRED` | Tidak ada identitas yang terautentikasi. |
| 403 | `INVALID_ORIGIN` | Origin permintaan tidak sesuai. |
| 404 | `CASE_NOT_FOUND`, `DOCUMENT_NOT_FOUND` | Kasus/dokumen tidak berada dalam batas kepemilikan kasus aktif. |
| 404 | `DOCUMENT_UNAVAILABLE` | Objek tidak tersedia atau pembacaan tidak lengkap. |
| 409 | `DOCUMENT_CHANGED` | Ukuran objek/stream berbeda dari ukuran yang diperiksa. |
| 413 | `DOCUMENT_TOO_LARGE`, `INPUT_TOO_LARGE` | Batas satu PDF atau gabungan terlampaui. |
| 503 | `STORAGE_UNAVAILABLE` | Storage tidak dapat menyiapkan input. |

## Verifikasi

QA terpisah berada di `C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\qa-m2`, memakai server loopback port 5188. Source disalin tanpa runtime, credential, dokumen asli, environment file, atau Git. Dependensi disalin secara independen dari instalasi QA Milestone 1; tidak dipasang atau di-upgrade oleh tugas ini pada checkout utama.

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run typecheck` | PASS pada source utama dan QA setelah dependensi lokal tersedia kembali. |
| `npm run lint` | PASS pada source utama dan QA; 0 error, 2 warning Milestone 1 yang tidak diubah. |
| `npm run build` | PASS di QA; route baru terbangun bersama route lama. Build final memakai source implementasi terkini. |
| `node tests/document-input.mjs` | PASS: autentikasi, ID lintas kasus, multi-PDF/order, metadata tanpa byte, objek tidak tersedia, format/truncation, batas jumlah/ukuran, stream terlalu panjang/pendek, dan historical state tidak dimutasi. |
| `node tests/document-readiness.mjs` | PASS melalui server/D1/R2 QA: dua PDF tanpa manual Evidence, metadata sumber, isolasi owner/kasus, input invalid, origin, byte unduhan identik, dan workspace/revision/run historis tidak berubah setelah readiness. |
| Suite lama | PASS: `auth-access.mjs`, `workflow.mjs`, `analysis-workflow.mjs`, dan `analysis-view.mjs`. |
| Restart server QA | PASS: proses dihentikan dan dimulai lagi; `auth-access.mjs --verify-restart` memulihkan sesi serta workspace persis sama. |
| Browser QA | PASS pada 26 Oktober: kasus dengan dua PDF, nol Evidence, dan nol Run dapat memilih kedua file serta menampilkan `2 PDFs ready`; tidak ada error/warning console. Bukti: `ient-src/outputs/pdf-readiness-browser.png` dalam salinan QA. |
| Source yang dilindungi | 24 berkas referensi produk, domain/persistence, API lama, dan skema/migrasi tetap identik dengan awal M2. |

Regresi objek R2 yang hilang dan stream tidak lengkap menggunakan storage in-memory, agar tidak perlu menghapus objek nyata. Uji API memakai PDF satu halaman yang dibentuk sebagai fixture valid dengan xref; upload/download memakai endpoint lama.

Pemeriksaan artefak client build tidak menemukan implementasi `prepareCasePdfInput`, error internal `DOCUMENT_CHANGED`, atau field server `storageEtag`. Server dan tab QA dihentikan setelah validasi; artefak fiktif tetap terpisah untuk penelusuran.

## Preservasi runtime dan perubahan paralel

Snapshot awal mencatat 16 berkas runtime utama. Perbandingan kemudian mendeteksi perubahan credential/database dan berkas registry baru. Server QA segera dihentikan untuk investigasi baca-saja.

Ditemukan proses aplikasi utama lain pada port 5173, dimulai 25 Oktober pukul 21.34 WIB; perubahan credential utama tercatat pukul 21.35, sebelum akun QA pertama dibuat pukul 21.38. Registry utama dan QA tidak memiliki Workspace ID yang sama; kasus serta owner pengujian yang diperiksa ada di QA dan tidak ada di database utama. Bukti ini konsisten dengan aktivitas aplikasi utama paralel. Proses tersebut tidak dihentikan, dan data tidak dipulihkan atau ditimpa.

Karena runtime utama aktif selama tugas, laporan ini **tidak mengklaim seluruh berkas runtime utama identik** sepanjang pengujian. Seluruh operasi mutasi pengujian diarahkan ke QA, tanpa impor data bisnis asli. Integritas penuh seluruh record bisnis terhadap snapshot sebelum aktivitas pengguna tidak dapat disahkan dari pemeriksaan ini.

Tujuh tracked deletion lama dan direktori `doc/` yang belum dilacak tetap dipertahankan. Tidak ada staging, commit, push, atau deployment.

## Batas yang masih ada

- Header/EOF bukan parser: PDF terenkripsi, struktur rusak yang lolos envelope check, jumlah halaman, dan keterbacaan model belum dapat dipastikan. Batas token/provider dan kegagalan pembacaan Gemini menjadi tanggung jawab Milestone 3.
- Readiness membaca ulang PDF di server, kemudian membuang bytes setelah respons metadata. Tidak ada cache atau penyimpanan selection; reload/perpindahan komponen mereset pilihan.
- Simulasi `rules-v1` tetap menggunakan evidence lama dan tidak mengonsumsi PDF yang dipilih. UI menjelaskan perbedaan ini; tidak ada hasil model palsu.
- Belum ada panggilan Gemini, secret/model configuration, Files API, atau penyimpanan snapshot input model. Tidak ada klaim kualitas analisis AI.
- Validasi runtime dilakukan pada Cloudflare Workers lokal melalui Vinext. Tidak ada uji provider atau deployment hosted.

Pekerjaan berhenti pada Milestone 2. Integrasi Gemini hanya dilakukan melalui milestone berikutnya setelah diperintahkan.
