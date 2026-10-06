# KRAVV-IENT functional PoC

Desktop investment workspace built from the supplied implementation brief, product vision, domain discovery and structured PRD. No earlier mockup or repository was used as the product specification. The project overview was not supplied.

## Run and validate

Run `npm run setup` and `npm run dev` from the repository root. Open `http://localhost:5173/access` and initialize a private workspace with your display name and Access Phrase. Save the generated Workspace ID and one-time Recovery Key. Returning access uses the ID and phrase on a registered browser; recovery additionally requires the key. See the [root setup guide](../README.md) for the complete local access and legacy-data procedure.

The dependency lockfile is preserved. The commands below also work when run directly from this application subfolder.

- Development: `node scripts/run-framework.mjs dev` (localhost:5173)
- Type check: `node node_modules/typescript/bin/tsc --noEmit`
- Build: `node scripts/run-framework.mjs build`
- Local end-to-end test: `node tests/workflow.mjs` (requires the development server; creates fictional test records)
- Generate schema migrations: `node node_modules/drizzle-kit/bin.cjs generate`

The D1 workspace table is initialized automatically for local access. Cases and uploaded bytes persist under `.wrangler/state`; credential hashes, device/session records and the signing key persist under `.sites-runtime`. Keep both folders together. They are ignored by Git and do not sync with hosted Sites data. Hosted migrations remain handled by Sites.

## Functional boundaries

Hosted authentication uses Sites/ChatGPT identity. The development server installs KRAVV Access Gate: generated Workspace ID, scrypt-hashed Access Phrase and Recovery Key, and separate signed HttpOnly device/session cookies. It does not authenticate a real ChatGPT account. New owners are keyed by generated workspace identity, with no fabricated email. The explicit legacy path opens only pre-existing email-keyed records without migration or a stronger claimed access boundary. D1 persists a versioned workspace aggregate keyed by identity. R2 stores uploaded document bytes. Every API checks identity. Writes use optimistic revision checks to prevent silent overwrites.

Investment Cases link to Companies. Cases preserve documents, evidence, analysis input snapshots, findings, diligence questions, human reviews, recommendations, decisions, activity, and optional portfolio records. Historical judgments are appended, never replaced. Portfolio entry retains the original case and thesis. A reopened case retains its decisions.

## Simulation and prototype assumptions

- Intelligence is a deterministic simulation over manually recorded evidence. No live model, automatic extraction, external research, or autonomous monitoring is connected.
- Seeded companies, source excerpts, metrics and judgments are fictional. Fixtures are isolated in `lib/fixtures.ts`; they initialize only a previously unseen owner workspace.
- PROTOTYPE ASSUMPTION: one workspace per signed-in owner, not a collaborative firm tenant.
- PROTOTYPE ASSUMPTION: the owner may switch Analyst, Partner and Admin roles to demonstrate permission gates. This is not production role administration. Analyst cannot record a final decision or create portfolio entry; Partner/Admin can.
- PROTOTYPE ASSUMPTION: new cases start Sourced; lifecycle labels and manual stage changes are provisional. Invested/Passed are set through final decisions. Portfolio entry is explicit after an Invested decision.
- PROTOTYPE ASSUMPTION: evidence status is assigned by the human recorder, not independently verified by the system. Upload limit: 20 MB.
- Desktop-only PoC. Existing narrow-screen fallback is retained; mobile UX is outside the current validation scope.

## Open product decisions and incomplete depth

Lifecycle labels differ between the vision and PRD. Firm membership, formal role assignments, IC quorum, conditional decisions, workflow constraints after investment, and security requirements remain TBD. In particular, the existing provisional model allows reopening an invested case and recording another outcome while retaining its portfolio record; this is historical preservation, not an approved exit/cancellation workflow.

Not implemented: live AI, automated extraction or contradiction discovery, external research, calibrated confidence, deterministic financial calculators, full IC governance, collaborative firm permissions, automated portfolio alerts, or production security certification. Analysis has evidence-quality/financial-health summaries rather than all candidate PRD dimensions. Company context aggregates linked cases; it is not a merged cross-case intelligence graph. No universal score or autonomous investment decisions are introduced.

## Important files

- `app/workspace.tsx`: connected desktop shell, case tabs, forms, navigation and source inspection
- `app/forms.ts`, `app/ui.tsx`, `app/globals.css`: reusable form definitions, status/judgment components and existing design system
- `app/page.tsx`, `app/chatgpt-auth.ts`: sign-in and session-aware entry
- `app/api/workspace/route.ts`: validated, authenticated case actions and permission gates
- `app/api/documents/route.ts`: private upload/download and metadata
- `lib/model.ts`, `lib/storage.ts`, `lib/fixtures.ts`: typed model, simulation, persistence and isolated sample data
- `db/schema.ts`, `drizzle/`: schema and migration
- `tests/workflow.mjs`: executable end-to-end acceptance test using fictional data

## Resume validation

The previous run completed the product implementation, a production build, type checking, end-to-end workflow testing and initial browser checks. The resumed run preserved it, checked the earlier saved records, source byte downloads, historical judgment/source references, permissions, all global and case navigation, and reload recovery. It repaired only in-case shortcut URL synchronization and safe decoding of malformed case links. No new business rules or visual concepts were introduced.

## Core Analysis Workflow PoC

The V3 bottom navigation and case tabs now connect lightweight creation, living context, source material, manually structured evidence, analysis readiness, a short simulated processing sequence, and a saved result. Results include expandable findings, snapshot source inspection, recorded conflicts/unknowns, editable diligence suggestions and a separate human-review handoff to recommendation/decision.

Readiness uses real record counts. Results use the unchanged saved `rules-v1` assessment and findings; presentation groups evidence by its recorded status. Current-versus-snapshot evidence differences are counted by stable evidence IDs and stored fields. Historical document additions are not inferred: the result reports only distinct document references in its evidence snapshot.

Processing lasts about three seconds and illustrates the PoC sequence; it is not server telemetry or a durable background job. The existing save starts immediately, and completion is shown only after that save succeeds. A reload can recover an already saved run. No AI API, chatbot, extraction, verification or external research was added.

Suggested diligence remains a suggestion until the user opens the existing form and saves it. The model has no question-to-run field, so the editable question includes the originating run ID, context and evidence snapshot text; its existing evidence trigger points to the current evidence entry. This is a presentation convention, not an immutable provenance relationship. No schema migration or new decision rules were introduced.

- Presentation derivation checks: `node tests/analysis-view.mjs`
- Local workflow acceptance: `node tests/analysis-workflow.mjs` (creates one clearly fictional case and verifies existing cases/companies are unchanged). Set `TEST_BASE_URL` to the intended localhost port when multiple checkouts are running.
- New implementation: `app/analysis-workspace.tsx`, `app/analysis.css`, `lib/analysis-view.ts`.

The existing fictional Aster and other sample cases remain intact. Validation uses an additional clearly fictional case instead of replacing saved sample data. Formal diligence priority, materiality, analysis taxonomy and immutable question-to-run relationships remain product decisions.

## KRAVV Access Gate implementation and boundaries

`build/access-store.mjs` stores independently salted scrypt hashes and hashed random tokens in a versioned, atomically replaced JSON registry. `build/access-gate.ts` installs the local middleware; `build/access-pages.mjs` renders entry, initialization, returning access, recovery and sign-out. Local identity injection is restricted to development. Client identity hints are removed before local authentication. The production worker retains the hosted identity integration and does not expose Access Gate.

Sessions last 12 hours and require a matching device record; devices last 180 days from registration. Server restart and normal browser reopening retain an unexpired session when cookies remain. Sign-out revokes the active session server-side and keeps device registration. Clearing cookies requires recovery. Recovery requires the phrase as well as the key, keeps the owner ID unchanged and does not alter saved cases. The key is reusable for device recovery and is never displayed again by the application. Phrase reset, credential rotation, device administration, multi-process registry coordination, rate limiting and production security are outside this milestone.

Initialization issues a session before the one-time key acknowledgement page. Its checkbox is an acknowledgement, not a second authorization barrier; navigating away does not preserve the plaintext key for later display. No automatic migration binds a legacy email owner to a new ID. Legacy compatibility intentionally retains the earlier unverified model, and the workspace shows that limitation. These are explicit local PoC choices, not production account-recovery or migration policies.

The Access Gate completion audit and its browser-testing limitation are recorded in [Functional PoC Completion Report](../functional-poc-completion-report.md). Executable checks: `tests/auth-access.mjs`, `tests/workflow.mjs`, `tests/analysis-workflow.mjs` and `tests/analysis-view.mjs`. New tests use generated fictional workspaces and retain previous owners' records.
