# M3.2a — Gemini Provider Error Diagnostics Fix

Tanggal: 26 Oktober 2026. **Status: PASS untuk implementasi dan validasi offline.**

**Generation Gemini nyata: 0. Metadata Gemini nyata: 0.** Tidak ada model switching, perubahan PDF/prompt/schema/request contract, perubahan timeout, retry, migrasi, commit, push, atau deployment.

## 1. Penyebab diagnostik hilang dan status artefak M3.2

Penyebab terkonfirmasi terdapat pada `rejectResponse()`: adapter lama menjalankan `response.body?.cancel()`, lalu melempar error aplikasi berdasarkan HTTP status. JSON Google tidak pernah dibaca. Observer M3.1f sengaja tidak membaca/menyalin body agar tidak menunda receipt header, sehingga tidak ada lapisan lain yang menyimpan detail tersebut.

Enam artefak M3.2 diperiksa: log server, log klien, phase timeline, verifikasi journal, hasil live runner, dan supplement acceptance. Yang tersedia hanya HTTP 400, lifecycle cancellation, serta mapping aplikasi 502/PROVIDER_ERROR. R2 journal menyimpan kegagalan aplikasi, bukan body Google.

**Detail penolakan Google M3.2: UNRECOVERABLE dari artefak lokal yang disimpan.** Perbaikan ini tidak memulihkan body lama atau membuktikan penyebab HTTP 400. Ketersediaan detail pada log proyek Google belum diverifikasi.

Bukti inspeksi: [m32-artifact-audit.json](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/m32-artifact-audit.json>).

## 2. Perubahan kode persis

| File repository | Perubahan |
| --- | --- |
| `ient-src/lib/gemini-provider.server.ts` | Menambahkan batas error 16 KiB dan pembacaan non-2xx melalui `inspectProviderError()`. Memakai signal/timer provider yang sama, fallback ke klasifikasi HTTP semula, serta cleanup stream tanpa menunggu cancellation yang macet. Request sukses dan pembentukan payload tetap sama. |
| `ient-src/lib/gemini-diagnostics.server.ts` | Menambahkan sanitizer error Google dan proyeksi ulang pada sink; fase `provider_error_body`/`provider_error_diagnostic`; field server-only `errorBodyOutcome` dan `providerError`. |
| `ient-src/tests/gemini-error-diagnostics.mjs` — baru | 25 skenario focused, ditambah assertion varian status Google, sanitizer, batas baca, cancellation, public API, dan HTTP 200. |
| `ient-src/tests/gemini-analysis.mjs` | Regresi Google-style HTTP 400, replay, dan larangan detail diagnostik masuk journal. |
| `ient-src/tests/gemini-diagnostics.mjs` | Ekspektasi fase error body baru; HTTP 400 tetap teridentifikasi saat diagnostik timeout dan replay tidak menambah generation. |
| `ient-src/tests/gemini-diagnostics-workers.mjs` | Probe body HTTP 400 macet kini memverifikasi abort pada shared deadline sekaligus mapping asli 502. |
| `ient-src/tests/gemini-workers.mjs` | Lima respons Google-style non-2xx pada native workerd, sanitasi dan mapping; tes redirect/sukses tetap ada. |

Tidak ada perubahan orchestrator, format/key journal, D1 persistence, API response shape, UI, dependency, atau konfigurasi Gemini asli. Hanya dua file aplikasi berubah; sisanya tes dan laporan ini.

### Alur non-2xx baru

1. Simpan klasifikasi HTTP asli sebelum membaca diagnostik.
2. Baca satu stream tanpa clone, maksimal **16384 byte yang diterima untuk decoding** dan **128 pemanggilan reader.read()**, termasuk pemeriksaan EOF. Chunk yang melampaui budget langsung ditolak tanpa didekode/disalin.
3. Gunakan satu Promise race untuk keseluruhan pembacaan melawan **signal AbortController provider yang sudah ada**; tidak membuat timer/controller baru.
4. Bila JSON lengkap valid, ambil hanya field Google yang dikenali dan keluarkan record diagnostik tersanitasi.
5. Bila body kosong, JSON rusak, budget terlampaui, read gagal, atau abort, catat outcome tersebut dan tetap keluarkan error aplikasi semula.
6. Hapus listener abort, hentikan pembacaan, dan lepaskan reader. Cancellation yang menolak atau tidak selesai tidak menahan hasil aplikasi.

Timer produksi tetap **90000 ms**, pada posisi semula setelah persiapan request, dan tetap dibersihkan pada finally. Batas waktu tidak direset.

### Mapping publik tetap

| HTTP provider | Kode / HTTP aplikasi |
| --- | --- |
| 3xx | PROVIDER_REDIRECT / 502; tidak diikuti |
| 401/403 | CREDENTIALS_REJECTED / 503 |
| 404 | MODEL_UNAVAILABLE / 503 |
| 429 | QUOTA_EXCEEDED / 429 |
| 400, 503, dan error lain | PROVIDER_ERROR / 502 |

Jika HTTP non-2xx sudah diketahui, kegagalan atau timeout **pembacaan diagnostik** tidak menutupinya dengan klasifikasi TIMEOUT. Contoh: HTTP 400 dengan body macet tetap menjadi PROVIDER_ERROR/502, sementara fase body ditandai timeout/aborted dan signalAborted=true. Timeout sebelum header atau pada body respons HTTP 200 tetap TIMEOUT/504 seperti sebelumnya.

## 3. Pengamanan diagnostik

- `error.status` hanya diterima jika cocok dengan allowlist status Google, misalnya INVALID_ARGUMENT, UNAUTHENTICATED, RESOURCE_EXHAUSTED, UNAVAILABLE.
- `error.message` dan description field violation **tidak dicetak sebagai teks bebas**. Maksimal 512 karakter input dipertimbangkan untuk memilih ringkasan tetap seperti “Unknown request field.” atau “Invalid JSON payload.”; pesan lain menjadi “Provider message redacted.”
- Hanya details bertipe tepat `type.googleapis.com/google.rpc.BadRequest` yang diperiksa. Maksimal delapan detail dan total delapan field violation.
- Field path maksimal 256 karakter/16 segmen; hanya nama parameter API/schema yang dikenal serta indeks 0–99. Nama dinamis, kontrol karakter, nilai, filename, atau path yang tidak lolos menjadi `[redacted]`.
- Sink melakukan proyeksi ulang, sehingga caller tidak bisa melewatkan raw provider text melalui objek yang mengaku sudah disanitasi.
- Tidak ada raw error body, key, authorization/header, request JSON, PDF/base64, prompt, company data, atau generated text yang dicatat.
- Detail hanya masuk log server. Error browser dan journal tetap memakai pesan aplikasi statis; tidak menyimpan `providerError`.

Contoh **fixture offline**, bukan detail error M3.2:

```json
{
  "providerHttpStatus": 400,
  "applicationHttpStatus": 502,
  "errorBodyOutcome": "parsed",
  "providerError": {
    "status": "INVALID_ARGUMENT",
    "message": "Unknown request field.",
    "fieldViolations": [{
      "field": "generation_config.response_json_schema",
      "description": "Unknown request field."
    }]
  }
}
```

Outcome diagnostik: parsed, invalid_json, limit_exceeded, empty, read_failed, atau aborted. bodyComplete=true berarti body error berhasil dibaca hingga EOF; itu bukan keberhasilan analisis.

## 4. Hasil validasi offline

QA terisolasi: `C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a`, port lokal 5199. Source/dependency disalin; data D1/R2 dan auth QA terpisah. Key Gemini nyata tidak disalin atau dipakai QA; file asli hanya di-hash untuk integritas. Tidak ada instalasi dependency.

| Pemeriksaan | Hasil |
| --- | --- |
| Root typecheck | PASS |
| Root lint | PASS, 0 error; dua warning lama pada import Case dan location.assign tetap dipertahankan |
| Root production build | PASS |
| Focused error tests | PASS, 25 skenario: metadata/generation HTTP 400/401/403/429/503, field violations, malformed/empty/oversized body, exact 16 KiB, empty-chunk limit, read failure, noncooperative stall/cancel, abort, data sensitif, HTTP 200, serta public API |
| Adapter/journal/saved Run regression | PASS: detailed HTTP 400 tidak masuk journal, replay tidak mengulang call, historical runs, CAS/save recovery, success output |
| Phase diagnostics | PASS, 23 skenario |
| QA client observer | PASS, 7 skenario |
| Native workerd adapter | PASS: 20 redirect, 5 error JSON tersanitasi, 1 success; tidak ada credential forwarding |
| Native workerd lifecycle | PASS, 4 probe; body HTTP 400 macet memakai shared abort dan mempertahankan mapping 502 |
| Document-input dan analysis-view | PASS |
| HTTP auth/workflow/analysis/documents/Gemini workflow | PASS menggunakan provider mock; Run, reload, Human Review, replay/concurrency, ownership, dan history |
| Auth/state setelah restart QA | PASS |
| Perbandingan sebelum/sesudah | PASS untuk tujuh kasus HTTP sukses/error: request identik byte demi byte dan hasil/public error sama |

Satu proses recheck Workers sempat keluar native dengan kode -1073740791 tanpa output. Setelah server QA dihentikan, tes yang sama lulus pada recheck terpisah. Penyebab exit tersebut tidak ditetapkan; tidak ada request Google pada proses-proses ini.

Bukti lokal: [focused tests](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/gemini-error-diagnostics.log>), [phase tests](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/gemini-diagnostics.log>), [Workers recheck](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/workers-adapter-recheck.log>), [Workers lifecycle](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/workers-diagnostics.log>), [workflow mock](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/http-gemini-workflow.log>), dan [folder log](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a>).

### Integritas dan cleanup

Snapshot 180 file konten/source diperiksa: hanya enam file lama yang diizinkan berubah, ditambah satu file tes baru dan laporan ini. **16 file runtime asli beserta set filenya tetap identik**, secret asli tidak berubah, dan seluruh status Git sebelumnya dipertahankan, termasuk tujuh deletion serta untracked doc/.

QA dihentikan, adapter asli QA dipulihkan, key mock sementara dan backup adapter QA dibersihkan. Tujuh file source/tes yang divalidasi cocok dengan workspace. Tidak ada staging, commit, push, deployment, migrasi, atau data bisnis asli yang diubah.

Bukti: [integrity-final.json](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/integrity-final.json>) dan [cleanup.json](<C:/Users/PIXWAR/.codex/visualizations/2026/10/25/01a17350-835c-7251-b661-f67c0ad74dd2/qa-m32a/cleanup.json>).

## 5. Ketidakpastian dan batasan

Penyebab Google menolak M3.2 tetap belum diketahui. Belum ada live response yang dibaca oleh parser baru, sehingga milestone ini tidak membuktikan Flash-Lite berhasil atau menentukan field penyebab HTTP 400.

Sanitizer sengaja mengurangi detail: pesan yang tidak dikenal dan field dinamis disembunyikan. Error body di atas budget atau terfragmentasi menjadi terlalu banyak chunk tidak menghasilkan detail lengkap. Adapter membatasi data yang disimpan/didekode; ukuran chunk yang sudah dialokasikan transport tetap menjadi tanggung jawab runtime.

HTTP error dengan body macet dapat menggunakan sisa budget provider sebelum fallback. Tidak ada timeout tambahan atau perpanjangan. Pengiriman response body/error provider dan penyelesaian generation sebelumnya di sisi Google tidak dapat disimpulkan dari tes offline.

## 6. Usulan next live test — belum dijalankan

Setelah otorisasi terpisah:

1. Gunakan QA baru/terisolasi, adapter baru sebagai actual adapter, serta kedua observer M3.1f. Jangan gunakan installer observer historis yang membaca clone body.
2. Ulangi **kasus Flash-Lite M3.2** dengan override QA yang diotorisasi, PDF fiktif kecil, request ID baru, dan request contract yang sama. Tidak mengubah konfigurasi asli, prompt, schema, timeout, atau mengaktifkan Gemini 3.6.
3. Izinkan maksimal satu generateContent POST; tanpa retry/fallback.
4. Jika non-2xx, periksa HTTP provider, `provider_error_body`, `provider_error_diagnostic`, outcome pembacaan, status Google/ringkasan/field violation yang lolos sanitizer, serta journal. Jangan menampilkan raw body atau memakai hasil gagal sebagai saved Run.
5. Jika sukses, validasi schema/source references, grounding PDF, saved Run, reload, Human Review, replay tanpa generation tambahan, dan history.
6. Hentikan QA dan verifikasi cleanup/integritas. Bila detail masih tidak memadai, laporkan keterbatasan; jangan melonggarkan sanitasi atau melakukan generation tambahan otomatis.

**Tidak ada live test yang dieksekusi pada M3.2a.**

