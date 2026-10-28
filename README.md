# KRAVV-IENT V3 — Functional AI Prototype

Existing VC investment workspace with real Gemini native PDF analysis. Application source is in `ient-src/`; root scripts delegate there without relocating source or saved data. This is a local development prototype, not a production investment platform.

## Local setup

Requires Node.js 22.13 or later and npm. From the repository root in PowerShell:

```powershell
npm run setup
npm run dev
```

Dependencies are locked, including **Vinext 1.3.0** and its updated peers. Restart the development server after updating dependencies. The default port is strict: open [KRAVV Access Gate](http://localhost:5173/access), and run only one server for this checkout.

Choose **Initialize private workspace**, enter a display name and Access Phrase (12–128 characters), and save the generated Workspace ID and one-time Recovery Key. Returning access uses the ID and phrase on a registered browser. A missing/expired device cookie requires recovery with the ID, phrase and key. Recovery does not reset a forgotten phrase. Sign-out preserves device registration and business records.

The explicit **Access data from the earlier local PoC** path opens existing legacy records with their original unverified access boundary. A new Workspace ID creates a separate workspace; it does not migrate or overwrite old records. No email or ChatGPT account is needed locally.

### Private server configuration

If `ient-src/.dev.vars` does not already exist, copy `ient-src/.dev.vars.example` to it. Set `GEMINI_API_KEY` privately and restart the server. Never overwrite an existing key, commit it, place it in browser variables, paste it into chat, or log it.

The working **Minimum AI** route uses **`gemini-3.5-flash-lite`**. `GEMINI_MODEL` configures the preserved, separate structured Gemini adapter; it does not change the Minimum AI model. No model fallback or automatic provider retry is enabled. Account quota, billing eligibility and provider availability must be established separately; a successful QA request is not a service guarantee.

## Working analysis flow

**Company → Investment Case → Documents → Analysis → Saved Run → Human Review.**

1. Open/create a Company and Investment Case. Upload original PDFs in Documents.
2. Open Analysis and select **1–5 PDFs** from that case. Readiness checking is optional; the server always revalidates access, availability, PDF envelope and limits.
3. Run the real Gemini PDF analysis. Manual Evidence is available but is not mandatory. The Minimum AI request sends selected PDFs, source labels and Investment Analyst Prompt v2; it currently does not send manual Evidence, company context or case notes to Gemini.
4. Open the saved non-simulated Run. Analysis presents six sections when recognized, with the original Markdown report always accessible. Unexpected headings fall back to the full report. Human Review is saved separately without rewriting AI output.
5. Decision shows a concise reference to the selected AI Run. Human recommendation and final decision remain separate workflows.

The UI supports Indonesian and English. Select the output language before generating; switching UI language does not translate an existing Run. Prompt version is `minimum-pdf-text-v2`. Plaintext/Markdown output is preserved literally, without fabricated structured findings, evidence, counterarguments or page citations. Source labels identify input PDFs, not independently verified statements.

### Limits and persistence

- General document upload: **20 MiB** per file. Analysis: **10 MiB per PDF**, **12 MiB combined**, at most five PDFs; serialized provider request cap **20,000,000 bytes**.
- One shared **90-second** provider deadline; output limit **8,192 tokens**. No OCR, separate text extraction, RAG, embeddings or indexing. Basic PDF envelope validation is not a complete PDF parser or encryption check.
- New Minimum AI Runs have `simulated: false`, the actual model text and additive provenance: document IDs, names, sizes, ETags, order/source labels, model/version, prompt, locale, request ID and available usage. Reload retains provenance. Older Runs without this metadata do not receive invented source data.
- A private R2 request journal and stable request IDs prevent replay from generating again. Revision/save conflicts retain completed output for a save retry. An uncertain/started request is not automatically regenerated. A deliberately new request may incur another provider charge.
- Historical `rules-v1` simulation, manual Evidence, existing PDFs, Company/Case records and Human Review remain available. The earlier structured Gemini implementation is preserved separately; it is not the proven Minimum AI demonstration path.

Local D1/R2 data is in `ient-src/.wrangler/state`. Local credential hashes, devices and sessions are under `ient-src/.sites-runtime/access-gate`; the signing key is `ient-src/.sites-runtime/local-auth-key`. Back up both runtime folders together with the server stopped. Git does not back up these ignored private records. A fresh clone contains no local accounts, uploaded files or saved cases from another machine.

## Verified baseline through M4.3b

Vinext 1.3.0 fixes multipart Route Handler requests incorrectly entering Server Action handling. Actual isolated QA uploads of valid **2 MiB and 10 MiB PDFs** reached the original upload route and R2; analysis limits were retained. Server Action limits were not increased.

[M4.3b acceptance](milestone4.3b-multi-pdf-live-acceptance.md) completed **one** real `generateContent` request containing **two fictional PDFs**: provider HTTP 200, headers after approximately 7.24 seconds. Distinct commercial and operating facts from both PDFs appeared in one non-simulated saved Run. Both source versions, reload, Human Review, original Markdown and same-ID replay passed. This verifies one controlled demonstration, not maximum capacity or provider reliability across repeated attempts. The review also recorded model overstatements; AI output still requires human scrutiny.

## Offline validation and isolated QA

From the repository root:

```powershell
npm run typecheck
npm run lint
npm run build
```

Typecheck emits no files; lint does not fix files; build produces `ient-src/dist`. The development Access Gate is not installed in the production worker, which retains hosted Sites/ChatGPT identity. Do not treat a successful build as deployment authorization.

Pure offline checks, from `ient-src`, include:

```powershell
node tests/document-input.mjs
node tests/minimum-analysis-prompt.mjs
node tests/minimum-analysis.mjs
node tests/gemini-analysis.mjs
node tests/gemini-error-diagnostics.mjs
node tests/analysis-presentation.mjs
node tests/localization.mjs
node tests/minimum-workers.mjs
```

HTTP workflow/upload tests create data: run them only in a physical QA source copy with separate D1/R2 and local credentials. Exclude `.git`, `node_modules`, `.wrangler`, `.sites-runtime`, build outputs, `.env*` and `.dev.vars*` when copying source (the empty example may be copied). Set an explicit loopback `TEST_BASE_URL`; tests with additional QA guards require a `qa-origin.json` marker containing the absolute `qa`, original `source`, and QA `port`, with the application in `qa/ient-src`. Use fake credentials and the provided mocked provider fixtures for generation regressions. Never point these tests at a real local workspace. `tests/gemini-live.mjs` is an opt-in live test, not an offline regression command.

Relevant tests include `multipart-upload.mjs`, `document-readiness.mjs`, `multi-pdf-workflow.mjs`, `workflow.mjs`, `analysis-workflow.mjs` and `auth-access.mjs`. Upload tests require `MULTIPART_QA_TEST=1`; multi-PDF mock tests require `MINIMUM_QA_TEST=1`. The auth restart check requires restarting only the same isolated QA server and using `--verify-restart`.

## Prototype boundaries

This is a desktop, single-owner workspace. Owner role switching demonstrates Analyst/Partner/Admin permission gates, not production role administration or collaborative tenancy. Access Gate is local development functionality. Production security certification, firm membership, calibrated investment scores, independent financial verification, advanced reconciliation, external research and autonomous decisions are outside the implemented scope. Human review must distinguish reported source statements from model inference.

See [application architecture](ient-src/README.md), [M4.2 presentation](milestone4.2-analysis-workspace-presentation.md), [M4.3 multi-PDF implementation](milestone4.3-multi-pdf-analysis.md) and [M4.3a multipart verification](milestone4.3a-vinext-multipart-upload.md). Earlier milestone reports describe historical implementation states and failures. Local `doc/` references are not required to run the published application and are excluded from this publication.
