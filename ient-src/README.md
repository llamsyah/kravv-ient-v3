# KRAVV-IENT application

The existing Functional PoC now includes the validated Minimum AI PDF analysis workflow through M4.3b. See the [root guide](../README.md) for installation, private configuration, usage, limits and isolated testing. Application source stays in `ient-src`; the obsolete `KRAVV-IENT-Phase1-source` directory is intentionally removed.

## Architecture and source boundaries

- `app/workspace.tsx`, `app/workspace-shell.tsx`: existing Company/Case workspace, forms, navigation, documents, recommendations, decisions and portfolio.
- `app/analysis-workspace.tsx`, `app/document-readiness.tsx`: PDF selection, readiness, analysis launch, saved Run and historical simulation.
- `app/plaintext-analysis.tsx`, `app/report-markdown.tsx`, `lib/analysis-presentation.ts`: safe Markdown and six-section presentation, with full original report fallback/access. No fabricated structured validation.
- `app/decision-analysis-reference.tsx`: concise saved-AI reference on Decision; full analysis remains in Analysis.
- `app/localization.tsx`, `lib/localization.mjs`, `lib/localization-messages.json`: Indonesian/English UI foundation. Existing business text and saved output are not automatically translated.
- `app/api/workspace/route.ts`, `lib/model.ts`, `lib/storage.ts`: authenticated aggregate actions, permission/revision checks, rules-v1, D1 persistence and Human Review. Existing records need no migration.
- `app/api/documents/route.ts`: private original uploads/downloads in R2, with the existing 20 MiB upload limit.
- `lib/document-input.ts`, `lib/document-input.server.ts`, `app/api/analysis/documents/route.ts`: authenticated case ownership, bounded PDF retrieval and metadata-only readiness. Maximum five PDFs / 10 MiB each / 12 MiB total; no duplicate original files or extraction pipeline.
- `app/api/analysis/minimum/route.ts`, `lib/minimum-analysis.ts`, `lib/minimum-analysis-prompt.ts`: working native inline PDF → real plaintext/Markdown flow, fixed `gemini-3.5-flash-lite`, Investment Analyst Prompt v2, locale, R2 request journal and non-simulated saved Run/provenance. The provider receives PDFs/source labels/prompt; manual Evidence and Company/Case context are not transmitted by this path.
- `app/api/analysis/gemini/route.ts`, `lib/gemini-provider.server.ts`, `lib/gemini-analysis.ts`, `lib/gemini-run.server.ts`: separate preserved structured-output implementation, controlled by `GEMINI_MODEL`. It is distinct from the proven Minimum AI path.
- `lib/gemini-diagnostics.server.ts`: sanitized phase diagnostics and bounded provider error information, without credentials, PDF bytes, full prompts or model output in logs.
- `build/access-gate.ts`, `build/access-store.mjs`, `build/access-pages.mjs`: development-only Access Gate. Production retains hosted Sites/ChatGPT identity.
- `tests/`: fictional fixtures, offline adapters/Workers checks and guarded isolated HTTP workflows. Live tests require separate explicit authorization.

The real output is saved verbatim as Run assessment with `simulated: false`; empty findings/evidence arrays do not claim structured validation. Additive `minimum` metadata records selected input IDs, filenames, sizes, versions/ETags, order, labels, model, prompt, language and usage. Historical Runs without metadata remain readable. Request replay does not regenerate or duplicate a saved Run. Human Review appends the human judgment separately.

## Execution

From the repository root, use `npm run setup`, `npm run dev`, `npm run typecheck`, `npm run lint` and `npm run build`. Node.js 22.13+ is required. Vinext is pinned to 1.3.0, including its multipart Route Handler fix; the lockfile pins updated peers. No Server Action size workaround is used.

Inside this folder, `npm run dev`, `npm run lint`, `npm run build`, and `node node_modules/typescript/bin/tsc --noEmit --incremental false` are equivalent. Schema-generation tooling exists but is not required for setup or the accepted milestones.

Private local state is under `.wrangler/state` (D1/R2) and `.sites-runtime` (access registry/signing key). Preserve both; never copy them into public QA artifacts or Git. Keep `.dev.vars` private. The Minimum AI flow has the unchanged 90-second provider deadline, no automatic retry/fallback, 20,000,000-byte request budget and 8,192-token output budget.

## Verification and limitations

Settings is implemented in `app/settings-workspace.tsx` and `app/settings.css`. `lib/ai-usage.ts` is a deterministic, immutable projection of authenticated, already loaded Saved Runs; it reads no private journals and makes no requests. `lib/settings-configuration.ts` exposes public read-only Minimum AI values, checked against the actual adapter by `tests/settings.mjs`. Aggregation and isolated ownership/persistence regressions are in `tests/ai-usage.mjs` and `tests/settings-workflow.mjs`. See the [M4.4 report](../milestone4.4-settings-ai-usage.md) for eligibility, deduplication, coverage and timeframe rules.

[M4.3b](../milestone4.3b-multi-pdf-live-acceptance.md) records one successful real generation with two small fictional PDFs, saved output, source versions, reload, Human Review and idempotent replay. [M4.3a](../milestone4.3a-vinext-multipart-upload.md) records actual 2/10 MiB multipart uploads and retained limits. These do not establish production reliability or independent investment accuracy.

Legacy `rules-v1` remains a deterministic manual-evidence simulation. Seed fixtures are fictional and initialize previously unseen owners only. Owner-switchable roles are permission demonstrations, not production administration. Local single-owner access, legacy compatibility, provisional case lifecycle and optional portfolio behavior retain their existing boundaries. No OCR, RAG, indexing, independent contradiction verification, calibrated confidence, autonomous decisions or production security certification is implemented.
