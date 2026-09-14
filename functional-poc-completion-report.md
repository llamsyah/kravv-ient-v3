# KRAVV-IENT Functional PoC Completion Report

Audit date: 2026-09-14. Checkout: `C:\Users\PIXWAR\kravv-ient-v3`, current `main`.

**Result: implementation and automated functional acceptance pass; final interactive browser acceptance remains open.** This report does not claim complete browser sign-off. No production deployment is part of this phase.

## Already complete before this continuation

- The existing V3 desktop shell and Core Analysis Workflow: case/context/source/evidence entry, readiness, simulated processing, saved results, diligence, human review, recommendation, final decisions, portfolio and monitoring.
- Access Gate pages, generated workspace identity, local credential registry, phrase/recovery hashing, signed device/session handling, legacy compatibility, application identity integration, Settings sign-out and strict development port.
- The Access Gate test helper and initial regression suite; existing workflow suites had already been adapted to generated test workspaces.

These changes were present as uncommitted work on `main`. They were preserved. No core workflow, business rule, schema, intelligence engine or visual architecture was rebuilt.

## Completed in this continuation

- Finished the authentication module type annotation needed by type checking.
- Corrected malformed Access Gate form handling: invalid content now returns a form validation response rather than a misleading storage-unavailable error.
- Corrected the invalid-host regression to use Node's HTTP client, which actually transmits the test Host header.
- Extended coverage for Admin decision permission, Analyst portfolio restriction and cross-workspace rejection of an actual uploaded document ID.
- Ran all executable regression suites, actual server restart verification, legacy baseline comparison, production-worker isolation smoke checks, typecheck and build.
- Updated both setup guides and this report with Access Gate usage, storage locations, recovery semantics and simulation boundaries.

## Validation evidence

| Check | Result and scope |
| --- | --- |
| `tests/auth-access.mjs` | PASS: bootstrap, generated identity/key, hash-only storage, invalid phrase/confirmation, duplicate initialization, registered-device return, missing/tampered device, recovery with correct phrase/key, invalid recovery, session binding, sign-out/replay denial, workspace isolation, existing legacy access and rejection of nonexistent legacy owners, origin/host/header checks, malformed forms |
| `tests/auth-access.mjs --verify-restart` | PASS after stopping and starting the actual server process: original signed session restored the same owner and exact full saved workspace; temporary probe removed |
| `tests/workflow.mjs` | PASS: create, private upload/exact byte download, source-linked evidence, immutable analysis snapshot, disagreement review, resolved diligence, recommendation, Analyst/Partner/Admin decision checks, portfolio and manual update, reopen with retained decisions, stale revision rejection, another workspace cannot download the uploaded source |
| `tests/analysis-workflow.mjs` | PASS: context enrichment, exact source bytes, four evidence statuses, empty-evidence run, three saved runs, snapshot immutability, run-linked disagreement, diligence response, recommendation, decision restriction, activity and reload; existing fixture cases/companies unchanged |
| `tests/analysis-view.mjs` | PASS: status derivation, truthful evidence deltas, snapshot isolation and historical diligence attribution |
| Legacy baseline | PASS: all 4 original owner rows, containing 23 cases, retain identical serialized-data SHA-256 hashes and revisions. Earlier QA source download still matches its original bytes. No migration, reset or legacy case edit occurred |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, all five build stages. Informational plugin timing warning only |
| Built worker smoke test | PASS in isolated local storage: original hosted sign-in entry rendered, local identity headers rejected with 401, `/access` absent with 404. This is not a live hosted authentication test |
| Git whitespace check | PASS |
| Browser checks | Entry, initialization, returning-access, recovery and legacy pages rendered and links connected; desktop layout inspected. No browser console warnings/errors were reported. Interactive field entry did not register through the available in-app browser automation, so browser login, clipboard/key acknowledgement, post-login navigation, processing animation and browser reload cannot be signed off in this continuation |

The earlier README records previously completed global/case navigation and browser persistence checks. Those are historical results, not substitutes for a new authenticated browser audit after this integration. Current end-to-end evidence is protocol-level acceptance through the real local server, D1 and R2.

## Fully functional at the tested boundary

Local workspace initialization and authenticated access, recovery of a device session, session revocation/restoration, separate persistent owners, existing legacy access, saved cases/companies, context, uploaded source bytes, source/evidence references, saved analysis snapshots, diligence records/responses, independent human reviews, recommendations, final decision history, role gates, portfolio transition and manually recorded monitoring. Reopening and later decisions retain the original investment history and portfolio record.

Authentication uses a real local credential registry and signed cookies. Case data uses local D1/SQLite; uploaded bytes use local R2 storage. These are persistent local implementations, not UI-only mocks. Hosted identity integration remains separate.

## Simulated or deliberately outside scope

Intelligence remains the existing deterministic `rules-v1` simulation over manually entered evidence. The approximately three-second processing sequence illustrates stages and is not live telemetry or a durable background job. Evidence status, source excerpts and diligence judgments are recorded by people. Seed companies and examples are fictional. Prototype role switching demonstrates permissions; it is not firm role administration.

No real AI, RAG, extraction, external research, assistant/chatbot, collaborative tenancy, automated monitoring or production security was added. No hosted deployment was performed.

## Assumptions and unresolved product rules

- One generated ID owns one local workspace. Name changes are not an ownership mechanism. There is no automatic legacy-to-ID migration.
- Recovery requires Workspace ID, existing Access Phrase and Recovery Key. It registers a device, not a phrase reset. The key is reusable and displayed once; reset/rotation/device administration remain outside scope.
- Sessions expire after 12 hours; devices after 180 days from registration. Sign-out revokes the active session and preserves the device. Initialization issues the session before the save-key acknowledgement; that checkbox is not a second authorization barrier.
- Legacy compatibility intentionally retains the old unverified name/email boundary. It preserves access and data, not the stronger Access Gate credential guarantee.
- A single local development process owns the credential registry. Runtime folders must be retained together; local data is not synced by Git or Sites.
- Existing governance questions remain unresolved: lifecycle taxonomy, IC quorum, formal firm roles, post-investment changes, materiality and immutable diligence-to-run provenance. A later Pass can coexist with an earlier investment/portfolio record under the existing provisional model. No exit/cancellation policy was invented.

## Remaining acceptance and delivery

The remaining milestone item is authenticated browser UX acceptance. The available browser tool produced no input value changes with its documented fill, keyboard, set-value or paste operations. This establishes a validation limitation; it does not prove an application input defect. Manual typing confirmation was requested without requesting credentials. Complete that browser audit before marking the entire milestone accepted.

The implementation, tests and documentation are intended for the existing `main` commit/push workflow. Runtime credentials, databases, files and test reports remain ignored. The unrelated pre-existing untracked `npx`, `drizzle.config.ts` and `wrangler.jsonc` are preserved and excluded. Refer to Git history for the resulting commit; pushing this source does not publish a hosted site.
