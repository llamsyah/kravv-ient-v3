# KRAVV-IENT functional PoC

Desktop investment workspace built from the supplied implementation brief, product vision, domain discovery and structured PRD. No earlier mockup or repository was used as the product specification. The project overview was not supplied.

## Run and validate

The dependency lockfile is preserved. On Windows, the installed npm command wrapper may resolve its scripts incorrectly; the direct commands below work with the existing installation.

- Development: `node scripts/run-framework.mjs dev` (localhost:5173)
- Type check: `node node_modules/typescript/bin/tsc --noEmit`
- Build: `node scripts/run-framework.mjs build`
- Local end-to-end test: `node tests/workflow.mjs` (requires the development server; creates fictional test records)
- Generate schema migrations: `node node_modules/drizzle-kit/bin.cjs generate`

The existing local database is already initialized. Do not replay its migration. For a new local checkout, build first, then apply `drizzle/0000_steady_callisto.sql` once using the documented Wrangler local D1 migration flow. Hosted migrations are applied by Sites.

## Functional boundaries

Authentication uses Sites/ChatGPT identity, with a local-only mock sign-in supplied by the development tooling. D1 persists a versioned workspace aggregate keyed by authenticated owner. R2 stores uploaded document bytes. Every API checks identity. Writes use optimistic revision checks to prevent silent overwrites.

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
