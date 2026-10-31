# Milestone 3.1e — Audit Timeout dan Lifecycle Request Gemini

Tanggal: **26 Oktober 2026, Asia/Jakarta**. Audit read-only terhadap source/data aplikasi; seluruh pengujian menggunakan fixture dan transport lokal fiktif.

**Verdict: INCONCLUSIVE untuk penyebab keterlambatan generation. Pemicu langsung HTTP 504 terkonfirmasi: deadline 90.000 ms milik aplikasi pada adapter provider.** Status penyelesaian generation di Google dan titik tunggu persis pada M3.1d tidak dapat dipastikan dari bukti yang disimpan.

## 1. Ringkasan eksekutif

- Timer 90 detik **bukan deadline seluruh workflow dan bukan timeout generation yang berdiri sendiri**. Satu `AbortController` mencakup GET metadata, POST generation, dan pembacaan respons dalam `callGemini`. Retrieval PDF, claim jurnal sebelum pemanggilan, serialisasi input sebelum timer, dan penyimpanan hasil sesudahnya berada di luar batas tersebut.
- Kedua fetch benar-benar menerima signal controller yang sama. Ketika signal dibatalkan dan operasi melempar error, adapter menghasilkan `TIMEOUT` / HTTP aplikasi 504. Reproduksi native workerd juga berhasil pada tahap menunggu metadata, header generation dan body generation.
- Log M3.1d membuktikan metadata berhasil, satu percobaan dispatch generation, lalu aplikasi 504 dalam sekitar 90,2 detik. **Tidak membuktikan Google belum mengirim header, membatalkan komputasi, menyelesaikan komputasi, atau menagih/tidak menagih.**
- Observer QA M3.1d menunda pencatatan status generation sampai body diagnostik error selesai dibaca. Uji offline mereproduksi pola log yang sama dengan header 400 yang sudah tersedia tetapi body yang macet. Itu membuktikan celah observasi, bukan membuktikan bahwa skenario tersebut terjadi pada live test.
- Jurnal timeout menjadi `failed/TIMEOUT`; replay ID yang sama tidak memanggil provider lagi. ID baru dapat menjalankan analisis kasus yang sama. Ini idempotency aplikasi, **bukan jaminan exactly-once pada Google**.
- Koreksi terkecil yang direkomendasikan adalah memperbaiki timing/phase diagnostics QA terlebih dahulu, tanpa memperbesar timeout atau mengubah model/schema. Tidak ada koreksi diterapkan pada audit ini.

**Pelaksanaan:** 0 generation nyata, 0 metadata akun baru, tidak menjalankan QA aplikasi atau menulis D1/R2 aplikasi. Sebanyak 16 skenario lifecycle in-memory dan 3 probe native workerd lulus, ditambah tes adapter yang sudah ada. Pembacaan dokumentasi publik tidak memakai key pengguna.

## 2. Urutan request yang sebenarnya

Sumber utama: `ient-src/app/api/analysis/gemini/route.ts`, `lib/gemini-run.server.ts`, `lib/document-input.server.ts`, `lib/gemini-provider.server.ts`, `lib/storage.ts`.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API route
    participant S as Run service
    participant R as R2
    participant D as D1
    participant P as Provider adapter
    participant G as Gemini
    C->>A: POST caseId, documentIds, requestId, revision
    A->>A: Origin check dan parse JSON
    A->>S: runGeminiAnalysis(input)
    S->>S: Authenticate, schema, intent hash
    S->>D: Read owned case / existing saved Run
    S->>R: Read existing request journal
    Note over S,R: Replay jurnal/Run dapat selesai tanpa provider
    S->>S: Revision dan server config
    S->>R: Prepare selected case-owned PDF bytes
    S->>D: Re-read workspace / revision / Company context
    S->>R: Conditional claim: started, If-None-Match *
    S->>P: callGemini(snapshot, PDFs)
    P->>P: Serialize context, base64, schema, check sizes
    Note over P,G: Mulai satu timer 90.000 ms dan AbortController
    P->>G: GET model metadata dengan signal
    G-->>P: Metadata; read JSON dan check method
    P->>G: POST generateContent dengan signal yang sama
    alt Deadline/operasi gagal
        P->>P: Catch, classify; clear timer
        P-->>S: GeminiError
        S->>R: Best-effort failed + sanitized failure
        S-->>A: Throw error
        A-->>C: Typed sanitized error/status
    else Respons valid lengkap
        G-->>P: Headers dan body
        P->>P: Read bounded JSON, STOP, Zod, source IDs
        Note over P,G: Clear timer sebelum kembali ke service
        P-->>S: Validated result + model/usage
        S->>S: Validate lagi, construct immutable Run
        S->>R: Write ready + Run snapshot
        S->>D: Read latest state; CAS save Run + activity
        S->>R: Best-effort write saved
        S-->>A: State tersimpan + runId
        A-->>C: HTTP 200, private/no-store
    end
```

Urutan detail yang penting:

1. Pemeriksaan origin/JSON ada pada route **sebelum** autentikasi service. Invalid origin ditolak 403; invalid JSON 400.
2. Service mengautentikasi identitas, memvalidasi input, memeriksa kasus milik owner, Run tersimpan dan jurnal lama. Jalur replay dapat berhenti pada titik ini.
3. `prepareCasePdfInput` mengautentikasi ulang, memeriksa semua ID terhadap kasus, membaca byte asli R2 secara bounded, dan memvalidasi envelope PDF. Workspace/revision dibaca ulang sesudahnya.
4. Claim jurnal `started` dibuat sebelum provider. Serialisasi/base64 pada adapter juga terjadi **sebelum timer**.
5. Setelah respons provider kembali, validasi di service, write `ready`, CAS D1, dan write `saved` tidak lagi dilindungi timer provider.

### Tahap yang terbukti pada M3.1d

| Tahap | Bukti / batas kesimpulan |
| --- | --- |
| API, autentikasi, ownership, persiapan PDF | Terlewati menurut control flow menuju provider dan kasus/dokumen QA yang tercatat. Tidak ada durasi per tahap. |
| Claim jurnal | Terlewati sebelum pemanggilan provider; bukti akhir jurnal `failed/TIMEOUT`. |
| Metadata fetch + parsing/check method | Selesai: log GET 200 diikuti dispatch POST. |
| Generation | Satu percobaan native fetch tercatat; penerimaan/eksekusi Google tidak dibuktikan oleh log dispatch saja. |
| Header/body generation | Tidak dapat dipisahkan dari log yang ada. |
| Hasil tervalidasi | Tidak ada hasil tervalidasi yang diterima service. Tidak menganggap semua tahap parsing terjadi. |
| Run persistence | Tidak ada Run baru: kasus QA memiliki 0 Run dan 0 Review. |
| Finalisasi kegagalan | Jurnal `failed`, failure code `TIMEOUT`; route mengembalikan 504. |

Bukti historis: `qa-m31d/server.log`, `final-outcome.json`, `outputs/gemini-live-validation.json`, `outputs/persistence-after-timeout.json`. Tidak mengakses ulang provider untuk menyimpulkan statusnya.

## 3. Sumber timeout dan batas persisnya

| Batas | Lokasi / perilaku |
| --- | --- |
| **90.000 ms** | `lib/gemini-provider.server.ts:16`: fixed `timeoutMs`; bukan binding environment yang dapat diubah lewat `.dev.vars`. |
| Timer mulai | Baris 61, setelah context serialization, base64, schema dan pengecekan final body. |
| Metadata | Baris 66: menerima signal; parsing body metadata juga berada dalam masa hidup timer. |
| Generation | Baris 70: signal yang sama; tidak mendapat budget 90 detik baru. |
| Read body/parse/validate | Baris 72–80, dalam `try` yang sama. Pembatalan async body dapat masuk catch. Parsing/Zod sinkron tidak dapat dipreempt timer di tengah eksekusi JS. |
| Timer berakhir | `finally` baris 85, sebelum `callGemini` kembali/throw ke service. |
| PDF/R2 dan jurnal claim | Sebelum timer; tidak mempunyai explicit workflow deadline pada jalur ini. |
| Jurnal ready/failed/saved, D1 save/recovery | Sesudah atau di luar timer; tidak ada deadline eksplisit pada service. |
| Browser / script live | Fetch tidak memasang timeout atau signal khusus untuk analisis. Animasi 2,9 detik hanya simulasi legacy; toast/UI timer bukan deadline Gemini. |

Contoh offline terkontrol: metadata menghabiskan **89.000 ms virtual**, sehingga generation hanya mendapat sisa **1.000 ms**. Tidak ada pembaruan timer pada pergantian GET → POST.

Ini deadline **cooperative**, bukan penghentian thread keras atau timeout provider Google. Native fetch menghormati signal pada probe lokal. Transport fiktif yang sengaja mengabaikan signal dapat tetap mengembalikan sukses; adapter tidak melakukan pemeriksaan `throwIfAborted()` tambahan pada semua batas. Counterexample itu bukan bukti bahwa native fetch M3.1d mengabaikan abort.

### Timeout lain dan infrastruktur

- Route tidak memiliki overall deadline, `maxDuration`, atau cancellation handler sendiri. Service tidak memiliki timer/Race untuk seluruh workflow.
- `tests/access-client.mjs` dan `tests/gemini-live.mjs` tidak menetapkan application timeout tersendiri. Tidak ada timer 90 detik tambahan pada script live/observer yang diperiksa.
- Library dev runner memiliki timeout RPC module transport default 60 detik; bundle HTTP client pada plugin memiliki default header/body timeout 300 detik bila tidak dioverride. Ini timeout library untuk konteks lain, **bukan bukti dispatcher efektif atau penyebab M3.1d**. Tidak ditemukan error RPC tersebut pada log M3.1d.
- Cloudflare mendokumentasikan bahwa HTTP-triggered Workers tidak mempunyai hard wall-clock limit selama client tetap tersambung; CPU time berbeda dari waktu menunggu network. Karena M3.1d berjalan pada localhost/Vite/Miniflare, tidak tepat menyebut 90 detik sebagai batas universal Cloudflare atau CDN. [Limits Workers](https://developers.cloudflare.com/workers/platform/limits/).
- Tidak ada telemetry DNS, connect/TLS, TTFB, body completion atau phase durations yang cukup untuk menyingkirkan bottleneck koneksi/proxy lokal. Tidak menganggap default library berarti tidak ada batas lain di seluruh sistem.

## 4. Perilaku abort dan pembatalan client

`setTimeout(() => controller.abort(), config.timeoutMs)` adalah satu-satunya pemanggil abort controller adapter. Signal diteruskan pada **kedua** actual fetch. Jika operasi melempar dan `controller.signal.aborted === true`, catch mengembalikan `GeminiError('TIMEOUT', ..., 504)`, lalu timer dibersihkan.

Catch memprioritaskan flag aborted atas jenis error lain. Oleh sebab itu, error yang berdekatan dengan deadline dapat diklasifikasikan TIMEOUT tanpa mempertahankan detail penyebab/phase awal. Tidak ada bukti bahwa Google mengembalikan HTTP 504 pada M3.1d.

| Kondisi offline | Klasifikasi aplikasi yang terverifikasi |
| --- | --- |
| Timer sendiri menembak saat metadata/generation/body menunggu | `TIMEOUT`, HTTP **504** |
| Provider fixture mengembalikan HTTP **504**, timer sendiri belum menembak | `PROVIDER_ERROR`, HTTP aplikasi **502** |
| Transport melempar network TypeError tanpa abort sendiri | `PROVIDER_UNAVAILABLE`, HTTP **502** |
| Transport melempar AbortError tanpa signal controller sendiri aborted | Juga `PROVIDER_UNAVAILABLE`, HTTP **502**; tidak dibedakan sebagai client cancellation |
| Client Request.signal dibatalkan selama service berjalan | Tidak diteruskan oleh route/service ke controller provider |

Frontend `runGemini` tidak memasang AbortController untuk fetch analisis. Unmount komponen menghentikan sebagian update UI melalui flag `mounted`, bukan secara eksplisit membatalkan provider. `POST(request)` juga tidak meneruskan `request.signal` ke service.

Dalam tes pemanggilan route langsung, pembatalan signal client tidak membatalkan signal provider; service fiktif masih dapat menyimpan hasil. **Ini membuktikan celah wiring kode, bukan menjamin Worker hosted tetap hidup setelah disconnect.** Platform dapat membatalkan task ketika client pergi; tidak ada `ctx.waitUntil`/durable background job pada implementasi ini. Cloudflare menyediakan observasi signal disconnect melalui compatibility behavior yang relevan, tetapi aplikasi belum memakainya. [Request.signal](https://developers.cloudflare.com/workers/runtime-apis/request/), [lifetime Worker](https://developers.cloudflare.com/workers/platform/limits/).

Pembatalan koneksi keluar tidak membuktikan Google menghentikan komputasi. Tidak ada provider cancel operation, operation ID, polling result, atau deduplication protocol Google yang dipakai oleh kode ini.

## 5. Celah observasi QA yang terkonfirmasi

Observer M3.1d melakukan urutan berikut:

```text
log ATTEMPT
await native fetch
jika non-2xx: await pembacaan body clone untuk diagnostik
baru log RESPONSE + status
return Response ke adapter
```

Jadi tidak adanya `M31D_PROVIDER_RESPONSE` **tidak selalu berarti header belum diterima**. Body diagnostik non-success yang macet juga dapat menghasilkan log ATTEMPT saja hingga deadline.

Reproduksi memakai source observer M3.1d yang sama dan fixture lokal:

| Fixture yang sama | Hasil |
| --- | --- |
| Adapter langsung: header 400, body tidak selesai | Body dibatalkan pada penanganan non-success; `PROVIDER_ERROR` / 502 tanpa menunggu deadline |
| Adapter melalui observer QA: header 400, body tidak selesai | Observer menunggu body sampai abort; `TIMEOUT` / 504, tanpa log RESPONSE generation |

Ini **CONFIRMED sebagai perilaku QA yang mungkin menyamarkan tahap/klasifikasi**, bukan konfirmasi bahwa Google mengirim 400 pada M3.1d. Potensi penundaan pembacaan/cancel clone juga perlu diperhatikan; tidak ada alasan untuk memperlakukan observer sebagai operasi tanpa latensi.

Minimum perbaikan observabilitas yang diusulkan: catat `headers_received` dan status **segera setelah native fetch resolve**, sebelum membaca body diagnostik, dengan waktu monotonic per phase. Diagnostik body harus terpisah, bounded, dan tidak menghalangi pencatatan status awal. Tidak mengubah source pada audit ini.

## 6. Jurnal R2, persistence D1 dan idempotency

Key jurnal: `{owner}/analysis-requests/{requestId}.json`. Intent hash mencakup case ID, nama konteks dan urutan document IDs. UUID aplikasi ini tidak dikirim sebagai jaminan idempotency Google.

Pembacaan ulang **read-only** storage QA M3.1d mengonfirmasi kasus `CASE-2026-ECD0E657` masih memiliki 0 Run/0 Review; jurnal `failed/TIMEOUT` dengan status aplikasi 504. Field jurnal hanya `caseId`, `intent`, `status`, `failure`, tanpa completed Run. Bukti tersanitasi: `qa-journal-readonly.json`; tidak membaca atau menampilkan isi PDF.

| State lokal | Isi/perilaku replay |
| --- | --- |
| Belum ada jurnal | Input/revision/PDF divalidasi, lalu conditional claim. |
| `started` | Ditulis sebelum provider; berisi intent dan case ID, belum berisi completed Run. Replay memberikan `REQUEST_IN_PROGRESS` / 409 tanpa call baru. State ini juga dapat tertinggal akibat crash. |
| `failed` | Menyimpan failure tersanitasi. Timeout normal menghasilkan `failed/TIMEOUT`. Replay ID yang sama mengembalikan failure lama, tanpa generation ulang. |
| `ready` | Respons valid dan snapshot Run disimpan pada R2 sebelum D1. Konflik revision dapat diselesaikan melalui replay ID yang sama dengan revision terbaru, tanpa provider ulang. |
| D1 Run sudah tersimpan | Run menjadi sumber kebenaran; replay mengembalikan state tersimpan. |
| `saved` | Finalisasi best-effort setelah D1; kegagalan update jurnal tidak membatalkan Run yang sudah tersimpan. |

Claim menggunakan conditional `If-None-Match: *`; hanya pemegang claim yang melanjutkan ke provider. Mocks audit mengemulasikan precondition atomik dan membuktikan satu dispatch untuk ID identik. Semantik layanan R2 mengikuti [conditional put API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/); tes ini tidak menulis R2 remote atau menguji ulang distributed consistency.

Temuan penting:

- Jika penulisan `failed` sendiri gagal, kode mengabaikan error tersebut; jurnal dapat tetap `started`. Replay masih tidak memanggil provider, tetapi statusnya ambigu/tidak pulih otomatis.
- Timeout dengan jurnal `failed` tidak mempunyai completed result untuk disimpan. Untuk generation lain diperlukan **request ID baru yang dipilih secara eksplisit**. Jurnal timeout tidak dibersihkan atau diubah dalam audit.
- Jika Google selesai tetapi response tidak diterima/tersimpan, aplikasi tidak memiliki cara mengambil kembali synchronous result itu. Tidak ada `ready` yang dapat direkonstruksi dari failure message.
- Failed request tidak mengunci case secara global. Analisis baru pada case yang sama dengan UUID baru dapat berjalan; existing Runs/reviews tetap dipertahankan.
- Dua request ID berbeda dapat menjalankan dua generation untuk case yang sama. Tidak ada lock per-case/provider; revision CAS melindungi penyimpanan state, bukan mencegah semua biaya model ganda.
- Pada timeout UI, `TIMEOUT` tidak ada dalam daftar kode yang mempertahankan pending ID. Klik Run berikutnya membuat UUID baru. Itu tindakan pengguna, bukan retry otomatis, tetapi dapat memulai komputasi lain saat status Google sebelumnya masih tidak diketahui.
- Tidak ada jurnal timestamp per-phase, provider operation ID atau recovery polling. `started/failed` adalah state aplikasi, bukan status pekerjaan Google.

**Batas jaminan:** idempotency aplikasi menekan pengulangan dispatch untuk owner/request ID yang sama selama jurnal/Run tersedia. Itu tidak membuktikan provider-level exactly-once, tidak mendeduplikasi UUID baru, dan tidak membuktikan Google membatalkan request lama.

### Batas persistence lain yang perlu dicatat

R2/D1 tidak berada dalam satu transaksi. `ready` mempertahankan hasil untuk retry save, dan CAS menolak overwrite workspace baru. Namun, operasi baca/tulis/recovery tidak mempunyai deadline eksplisit pada service.

Update `saved` memang menangkap rejection, tetapi tetap di-`await`; operasi yang tidak settle dapat menahan HTTP response meskipun D1 telah menyimpan Run. Demikian pula write `failed` dapat menunda pengembalian error setelah deadline provider berakhir. Ini potensi lifecycle bottleneck di luar timer, **bukan penyebab yang terbukti pada M3.1d**, yang memiliki jurnal `failed` dan route 504 yang sudah kembali.

## 7. Verifikasi offline dan keterbatasannya

Artefak audit terpisah: `C:\Users\PIXWAR\.codex\visualizations\2026\10\25\01a17350-835c-7251-b661-f67c0ad74dd2\audit-m31e`.

- `lifecycle-offline.mjs` / `offline-results.json`: **16 skenario PASS**, transport dan storage in-memory; native network diblokir pada proses ini.
- Clock virtual tetap membaca konfigurasi produksi **90.000 ms**. Memajukan clock bukan mengubah timeout produksi atau mengukur latency Google.
- `workerd-abort-offline.mjs` / `workerd-results.json`: **3 probe PASS** pada runtime workerd terpasang, dengan seluruh outbound ditangani fixture lokal. Probe memakai deadline test **1.000 ms**, lebih pendek dari konfigurasi asli, tanpa mengubah file atau setting aplikasi. Tidak ada koneksi ke Google.
- Watchdog harness 3/5 detik hanya membatasi tes audit jika macet; tidak ada pada aplikasi atau live test M3.1d dan tidak mengubah timeout produksinya.
- `tests/gemini-analysis.mjs` yang sudah ada: PASS dengan mocks, termasuk invalid response/source, revision conflict, duplicate claims, save failure dan response save yang hilang.

| Skenario | Hasil |
| --- | --- |
| Metadata 89 detik virtual + generation tersisa 1 detik | Shared budget dan signal yang sama terverifikasi. |
| Abort saat menunggu metadata, generation header, atau body | TIMEOUT tersanitasi; failure journal; existing state tidak berubah. |
| Replay setelah timeout | Tidak menambah provider dispatch. |
| Interruption meninggalkan `started` | Replay 409 tanpa dispatch ulang. |
| Request ID identik bersamaan | Satu dispatch fixture. |
| Dua UUID baru bersamaan | Dua dispatch fixture; bukan exactly-once per-case. |
| Request baru setelah timeout | Dapat sukses pada case yang sama; old Runs/reviews tidak berubah. Replay saved ID tidak menambah dispatch. |
| Preparation atau D1 save melewati 90 detik virtual | Tidak terkena timer provider; membuktikan tidak ada overall deadline ini. |
| Signal client dibatalkan pada pemanggilan route langsung | Tidak terhubung ke provider; mocked route masih dapat menyimpan. |
| Transport sengaja mengabaikan abort | Dapat selesai setelah flag aborted; memperlihatkan sifat cooperative. |
| QA error-body wait | Dapat menyamarkan header 400 menjadi pola TIMEOUT/M3.1d. |
| Native fetch workerd pada ketiga batas | Signal benar-benar aborted; metadata/header rejection bernama AbortError; body-read abort juga berakhir TIMEOUT. |

Batas reproduksi: tidak meniru scheduler/load Google, jaringan internet/TLS/proxy aktual M3.1d, isi response yang tidak direkam, process crash hosted yang sebenarnya, atau lifecycle disconnect hosted. Fake claim bukan pengujian distributed storage. Tidak ada klaim mengenai Google-side completion atau latency produksi dari test lokal ini.

## 8. Penyebab terkonfirmasi versus hipotesis

| Dugaan | Penilaian |
| --- | --- |
| Timer controller milik adapter memicu kategori TIMEOUT/504 | **CONFIRMED** oleh control flow, unique error branch, log ~90,2 detik dan reproduksi. |
| Deadline berlaku seluruh aplikasi | **DITOLAK oleh kode/tes**; pre-processing dan persistence berada di luar timer. |
| Ini HTTP 504 yang dikirim Google | **Tidak didukung bukti**; tidak ada respons generation/status yang tercatat. |
| Universal hard limit Cloudflare 90 detik | **Tidak didukung bukti**; dokumentasi HTTP Workers tidak menetapkan batas itu. |
| Native AbortController tidak terhubung/tidak bekerja | **Tidak didukung bukti** pada jalur yang diuji; kedua fetch memakai signal dan probe workerd membatalkannya. |
| Google queue/inference/thinking membutuhkan > budget tersisa | **POSSIBLE**, belum ada TTFB/body/token telemetry. |
| QA observer menunggu body diagnostik error | **POSSIBLE pada M3.1d**; perilakunya **CONFIRMED offline**, tidak terbukti terjadi live. |
| Jaringan/koneksi/proxy lokal menghambat request | **POSSIBLE**; phase telemetry tidak cukup. |
| PDF, schema atau thinking tertentu terbukti menyebabkan 90 detik | **Tidak didukung bukti spesifik**; jangan mengubahnya sebagai workaround otomatis. |
| D1 save menyebabkan timeout M3.1d | **Tidak didukung control flow**; failure terjadi sebelum service menerima hasil untuk dibuatkan Run. |

## 9. Model, thinking dan trade-off konfigurasi

Request saat ini tidak menyertakan `thinkingConfig`, sehingga mengikuti default model. Dokumentasi 3.8 menyebut default **medium**, mendukung **low/medium/high**, dan tidak mendukung `minimal`. Level rendah ditujukan untuk mengurangi time-to-answer pada tugas yang sensitif terhadap latency; tidak ada pengukuran aplikasi yang membuktikan besar penurunannya. [Panduan model 3.8](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.8).

Untuk generateContent, dokumentasi memberikan `generationConfig.thinkingConfig.thinkingLevel: "low"`. Ini opsi supported yang dapat diusulkan kelak; tidak dikirim pada audit. Output cap 8.192 juga mencakup thinking tokens menurut panduan, sehingga mengecilkannya tidak otomatis mengurangi alokasi thinking dan dapat menghasilkan `MAX_TOKENS`/hasil kosong atau terpotong yang ditolak adapter. [Thinking pada generateContent](https://ai.google.dev/gemini-api/docs/generate-content/thinking).

PDF inline didokumentasikan cocok untuk dokumen kecil/sekali pakai. Files API dapat mengurangi pengiriman ulang untuk file besar/reused, tetapi fixture M3.1d hanya 799 byte; tidak ada bukti bahwa migrasi storage/upload menyelesaikan timeout ini. Tidak menambahkan Files API/parser/OCR. [Panduan PDF](https://ai.google.dev/gemini-api/docs/generate-content/document-processing).

| Pilihan | Trade-off dan batas bukti |
| --- | --- |
| Tetap model dan timeout 90 detik | Menjaga baseline; dapat mengulang kegagalan bila budget memang tidak cukup. Perbaiki pengukuran terlebih dahulu. |
| Model sama, timeout lebih panjang | Bisa membantu hanya bila operasi normal memang butuh waktu lebih lama; tidak memperbaiki koneksi/body hang atau status Google yang tidak diketahui. Nilai baru belum direkomendasikan/dicoba. |
| Supported thinking `low` pada 3.8 | Satu perubahan semantic yang didokumentasikan dapat mengurangi latency; kualitas penalaran/sumber perlu dievaluasi ulang. JSON Schema/Zod tetap harus dipenuhi. Bukan thinking-off dan bukan jaminan selesai <90 detik. |
| Model lebih ringan, misalnya 3.5 Flash-Lite | Dokumentasi menargetkan latency/biaya rendah dan mendukung PDF/structured output; akses akun, kualitas dan latency pada aplikasi belum diukur. Memerlukan keputusan model dan acceptance terpisah. [Spesifikasi Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite). |

Tidak ada setting/model yang diubah. Mengganti level thinking tidak boleh dianggap memperbaiki masalah QA transport yang belum diisolasi.

## 10. Risiko memperbesar timeout dan koreksi minimum

Memperbesar angka 90.000 saja dapat:

- Memperpanjang pengalaman menunggu dan penggunaan memory/connection tanpa menjamin respons.
- Menghabiskan budget pada metadata atau diagnostik body, bukan hanya generation.
- Memperbesar peluang client menutup halaman sebelum hasil/jurnal tersimpan; platform lifetime tidak menjadi pekerjaan durable hanya karena timer lebih lama.
- Memperbesar risiko biaya/komputasi berulang bila pengguna memulai UUID baru setelah kehilangan hasil.
- Tetap tidak melindungi D1/R2 di luar timer, tidak memperbaiki silent hang pada persistence, dan tidak membuktikan exactly-once Google.

**Koreksi terkecil yang direkomendasikan, menunggu persetujuan:**

1. QA mencatat timestamp monotonic dan request ID pada clock start, metadata dispatch/headers/body done, generation dispatch/**headers segera**, body done, validation, write `ready`, D1 commit, final journal, deadline-fired dan classification. Catat status/elapsed/error name tersanitasi; jangan key, prompt atau PDF.
2. Pisahkan observasi header dari pembacaan diagnostik error sehingga status awal tidak hilang saat body macet. Diagnostik tetap bounded dan tidak menutupi primary fetch error.
3. Pertahankan model, schema dan timeout untuk satu uji diagnosis. Setelah diketahui lokasi tunggu, baru putuskan perubahan deadline atau supported thinking dalam milestone terpisah. Jangan sekaligus mengubah beberapa variabel.
4. Dokumentasikan timeout sebagai status aplikasi dengan Google outcome unknown; jangan memperlakukan `failed` sebagai bukti pembatalan Google. Tidak menghapus jurnal atau mengulang request untuk mencoba memulihkannya.

Tidak mengimplementasikan instrumentation/cancellation/persistence baru dalam audit ini. Pengaturan lifecycle background/durable, streaming atau arsitektur job bukan koreksi minimum yang langsung dibenarkan oleh bukti sekarang.

## 11. Rencana live acceptance berikutnya — belum dijalankan

Memerlukan otorisasi eksplisit untuk instrumentasi QA dan satu request nyata:

1. Pertahankan adapter produksi, model 3.8, schema, prompt, 90.000 ms dan PDF fiktif yang sama; siapkan phase timing QA seperti di atas. Verifikasi bahwa wrapper tidak menunda pencatatan header.
2. Verifikasi metadata, buat case fiktif serta UUID baru; jangan replay ID M3.1d untuk generation baru. Pasang guard paling banyak satu native POST generation, tanpa SDK retries/fallback.
3. Catat durasi metadata dan budget tersisa pada generation; status header sebelum body, body completion, timer-fire dan journal state setelah hasil/abort.
4. Bila sukses, validasi STOP/JSON/Zod/source IDs, Run non-simulated/provenance, reload dan Human Review. Bila gagal/timeout, simpan detail tersanitasi dan berhenti; tidak mengubah thinking/timeout atau mencoba model lain dalam percobaan yang sama.
5. Periksa D1/R2 QA tanpa mengubah data asli, hentikan QA, bersihkan secret temporer dan verifikasi integritas source/config/runtime/Git. Laporkan Google outcome unknown bila tidak terkonfirmasi.

**Verdict akhir: INCONCLUSIVE untuk akar keterlambatan/provider outcome.** Deadline adapter adalah pemicu langsung 504 yang **terkonfirmasi**, tetapi bukti saat ini belum memilih antara fetch/header wait, body diagnostik QA, atau bottleneck jaringan/provider. Tidak ada live generation, peningkatan timeout, model switching, migrasi, staging, commit, deployment, atau pekerjaan Milestone 4 pada audit ini.

Integritas akhir diperiksa terhadap snapshot: 142 berkas source aplikasi, 16 berkas runtime asli, file secret dan perubahan Git lama. Artefak `offline-results.json`, `workerd-results.json` dan `integrity-final.json` berada di folder audit, bukan runtime bisnis.
