# KRAVV-IENT — Agent & Developer Handoff

**Document ID:** 11  
**Document Type:** Canonical Agent / Developer Handoff  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Audience:** Future developers, coding agents, AI agents, maintainers, collaborators, and the project owner returning after a long pause  
**Current Product Stage:** Functional Proof of Concept  
**Repository:** `llamsyah/kravv-ient-v3`  
**Authoritative Branch:** `main`  
**Latest Verified Repository Checkpoint at Documentation Time:** `b4bed67024cabcf4ef7b424331a911006a2ae869`  
**Checkpoint Message:** `Fix localhost Access Gate native form origin rejection`  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document is the safe entry point for anyone who needs to continue KRAVV-IENT without relying on previous chat history.

Its purpose is to prevent a new developer or coding agent from:

- misunderstanding the product,
- rebuilding solved architecture,
- treating prototype assumptions as business rules,
- replacing the core workflow with a generic AI interface,
- destroying historical behavior,
- weakening privacy boundaries,
- or making visually impressive but conceptually incorrect changes.

This document should allow a capable developer or agent to answer:

- What is KRAVV-IENT?
- What currently works?
- Which documents are authoritative?
- Which concepts are non-negotiable?
- Which behaviors are only provisional?
- How do I run and validate the project?
- Which files matter?
- What should I inspect before changing anything?
- How should I implement a new capability safely?
- What should I do when a business rule is unknown?

The core operating rule is:

> **Understand the product model before changing the implementation.**

---

# PART I — PROJECT IN ONE PAGE

---

## 2. Canonical Product Definition

> **KRAVV-IENT is a private AI-assisted investment intelligence workspace that turns fragmented deal evidence into traceable analysis, structured diligence, human judgment, and persistent investment decisions.**

The product is built around persistent **Investment Cases**.

It is not primarily:

- a pitch-deck analyzer,
- a CRM,
- a memo generator,
- a generic chatbot,
- a universal scoring engine,
- or an autonomous investment decision-maker.

---

## 3. Core Product Lifecycle

The conceptual lifecycle is:

**Evidence**  
→ **Analysis**  
→ **Challenge**  
→ **Human Judgment**  
→ **Decision**  
→ **Monitoring**

The implemented Functional PoC workflow is approximately:

**Access Gate**  
→ **Workspace**  
→ **Company / Investment Case**  
→ **Context**  
→ **Sources**  
→ **Structured Evidence**  
→ **Analysis Readiness**  
→ **Simulated Analysis**  
→ **Saved Analysis Run**  
→ **Diligence**  
→ **Human Review**  
→ **Recommendation**  
→ **Final Decision**  
→ **Portfolio**  
→ **Monitoring**

---

## 4. Current Product State

The current application is a **functional local desktop PoC**.

It already includes functional:

- workspace entry,
- local identity,
- persistence,
- source upload/download,
- evidence recording,
- historical analysis snapshots,
- diligence,
- Human Review,
- Recommendation,
- role-gated Final Decision,
- Portfolio transition,
- Monitoring Updates,
- activity/history,
- tests.

The intelligence engine remains simulated.

Not yet implemented:

- live LLM reasoning,
- grounded chatbot/assistant,
- automated document extraction,
- production RAG,
- external research,
- autonomous contradiction discovery,
- mature deterministic financial engine,
- cross-case institutional intelligence,
- multi-user firm tenancy,
- production security.

---

# PART II — REQUIRED DOCUMENT READING ORDER

---

## 5. Canonical Documentation Set

Before significant work, read the canonical documentation in this order.

### `00 — Project Overview`

Read first.

Purpose:

- understand the product,
- understand current vs future,
- understand the problem and positioning.

### `01 — Product Vision`

Purpose:

- understand the long-term ambition,
- understand institutional intelligence direction,
- avoid optimizing only for the current PoC.

### `02 — Product Principles`

Purpose:

- understand the product constitution,
- know what future features must preserve.

### `03 — Domain & Investment Workflow`

Purpose:

- understand the VC/private-investment domain model,
- understand where KRAVV-IENT sits in the workflow.

### `04 — Product & Object Architecture`

Purpose:

- understand Company,
- Investment Case,
- Source,
- Evidence,
- Analysis Run,
- Diligence,
- Review,
- Recommendation,
- Decision,
- Portfolio.

### `05 — Current Functional PoC & System State`

Purpose:

- understand exactly what exists now,
- understand simulated vs implemented behavior,
- understand current runtime and tests.

### `06 — Intelligence & AI Architecture Vision`

Purpose:

- read before implementing real AI,
- understand grounding, retrieval, extraction, provider abstraction, challenge, and authority boundaries.

### `07 — Experience & Design System Vision`

Purpose:

- read before redesigning or adding major UI,
- preserve KRAVV-IENT visual and interaction identity.

### `08 — Security, Privacy & Workspace Trust Vision`

Purpose:

- read before touching auth, permissions, documents, tenancy, AI-provider data flow, or security language.

### `09 — Roadmap & Product Evolution`

Purpose:

- understand maturity sequencing,
- avoid premature complexity.

### `10 — Decision & Invariant Register`

Purpose:

- read before changing core behavior,
- identify locked decisions, assumptions, and open questions.

### `11 — Agent & Developer Handoff`

Purpose:

- operational continuation guide.

---

## 6. Documentation Authority

For product meaning, the canonical documents above should become the preferred project canon.

For current implementation truth, use this order:

1. current `main` source code,
2. executable tests,
3. current root/application README,
4. `05 — Current Functional PoC & System State`,
5. current canonical product docs,
6. latest completion reports,
7. older historical reports,
8. old mockups and experiments.

Do not let an older historical report override newer implementation.

---

# PART III — REPOSITORY ORIENTATION

---

## 7. Repository

Repository:

`https://github.com/llamsyah/kravv-ient-v3`

Primary branch:

`main`

Current source application:

`KRAVV-IENT-Phase1-source/`

---

## 8. Root-Level Repository Purpose

The repository root currently contains:

- application source directory,
- root README,
- root package wrapper,
- completion reports,
- analysis workflow report,
- implementation status,
- validation output.

Historical reports remain useful as development evidence.

They are not automatically current product canon.

---

## 9. Important Application Files

Current README identifies important implementation areas including:

### `app/workspace.tsx`

Connected desktop workspace and product interaction surface.

### `app/workspace-shell.tsx`

Desktop shell / navigation architecture.

### `app/analysis-workspace.tsx`

Core Analysis workflow presentation.

### `app/forms.ts`

Reusable form definitions.

### `app/ui.tsx`

Reusable status/judgment UI.

### `app/globals.css`

Existing core styling.

### `app/analysis.css`

Analysis workflow styling.

### `app/api/workspace/route.ts`

Authenticated case actions, workflow mutations, permission gates.

### `app/api/documents/route.ts`

Private source document upload/download and metadata handling.

### `lib/model.ts`

Typed product model.

### `lib/storage.ts`

Persistence behavior.

### `lib/fixtures.ts`

Isolated fictional sample data.

### `lib/analysis-view.ts`

Analysis presentation derivation logic.

### `build/access-store.mjs`

Local Access Gate credential/session persistence.

### `build/access-gate.ts`

Local Access Gate middleware.

### `build/access-pages.mjs`

Access Gate pages and form flows.

### `db/schema.ts`

Database schema.

### `drizzle/`

Database migration material.

### `tests/auth-access.mjs`

Access Gate acceptance coverage.

### `tests/workflow.mjs`

Core workflow acceptance coverage.

### `tests/analysis-workflow.mjs`

Core Analysis workflow acceptance.

### `tests/analysis-view.mjs`

Analysis presentation derivation tests.

File paths should always be verified against current `main` before editing.

---

# PART IV — LOCAL RUNTIME

---

## 10. Runtime Requirement

Current documented requirement:

**Node.js 22.13 or later**

---

## 11. Setup

From repository root:

```powershell
npm run setup
npm run dev
```

Open:

```text
http://localhost:5173/access
```

If dependencies are already installed:

```powershell
npm run dev
```

may be sufficient.

---

## 12. Development Server Rule

Current local application uses strict port:

`5173`

Run only one development server for the same checkout unless the runtime is intentionally configured otherwise.

---

## 13. Validation

From repository root:

```powershell
npm run typecheck
npm run build
```

With the server running, from:

`KRAVV-IENT-Phase1-source`

run:

```powershell
node tests/auth-access.mjs
node tests/workflow.mjs
node tests/analysis-workflow.mjs
node tests/analysis-view.mjs
```

For persisted Access Gate restart verification:

```powershell
node tests/auth-access.mjs --verify-restart
```

---

# PART V — LOCAL DATA SAFETY

---

## 14. Persistent Runtime Data

Current local product state lives outside Git.

Important paths:

```text
KRAVV-IENT-Phase1-source/.wrangler/state
```

and:

```text
KRAVV-IENT-Phase1-source/.sites-runtime
```

These contain important local state.

---

## 15. Do Not Delete Runtime State Casually

If preservation matters, do not casually delete:

- `.wrangler/state`,
- `.sites-runtime`.

These may contain:

- workspace data,
- cases,
- uploaded source bytes,
- credentials hashes,
- devices,
- sessions,
- local signing state.

---

## 16. Local Backup Procedure

Before risky persistence/auth work:

1. stop the development server,
2. back up `.wrangler/state`,
3. back up `.sites-runtime`,
4. preserve them together.

A fresh clone does not contain the local workspace.

---

# PART VI — NON-NEGOTIABLE PRODUCT INVARIANTS

---

## 17. Company ≠ Investment Case

Never collapse multiple historical investment evaluations into one mutable Company analysis.

---

## 18. Source ≠ Evidence

Uploading a document does not mean its contents are extracted, trusted, or verified.

---

## 19. Evidence ≠ Analysis

Evidence records information.

Analysis interprets it.

---

## 20. Analysis ≠ Human Judgment

Human disagreement must remain separate from system output.

---

## 21. Human Review ≠ Recommendation

A review of analysis does not automatically define what the analyst recommends.

---

## 22. Recommendation ≠ Final Decision

Analyst-level judgment and authorized investment decision are separate.

---

## 23. Final Decision ≠ Portfolio Record

An invested decision and operational portfolio state remain distinct.

---

## 24. New Evidence ≠ Rewrite Old Analysis

Historical Analysis Runs preserve their evidence snapshots.

---

## 25. AI Suggestion ≠ Persistent Action

Generated output must not silently mutate meaningful product state.

---

## 26. Model Output ≠ Verified Fact

No model gains verification authority merely by sounding confident.

---

## 27. Conflict ≠ Resolved Truth

Conflicting claims should remain visible until genuinely resolved.

---

## 28. Provider ≠ Product Identity

Changing from one LLM provider to another must not require redesigning KRAVV-IENT's core product model.

---

# PART VII — CURRENT OBJECT MODEL

---

## 29. Workspace

Current local owner-scoped private environment.

Future organization tenancy is not implemented.

---

## 30. Company

Long-lived company identity.

Can link to multiple Investment Cases.

---

## 31. Investment Case

Primary decision object.

Owns or links the reasoning workflow.

---

## 32. Source Document

Private reference material.

Currently stored without automatic extraction.

---

## 33. Structured Evidence

Human-recorded case information.

Current evidence status is human-assigned.

---

## 34. Analysis Run

Historical point-in-time interpretation with an evidence snapshot.

Current intelligence is simulated.

---

## 35. Diligence Question

Persistent unresolved question / investigation work item.

---

## 36. Human Review

Human response to system assessment.

Additive; does not rewrite Analysis Run.

---

## 37. Recommendation

Analyst/deal-team suggested course of action.

---

## 38. Final Decision

Authorized decision record.

Current PoC uses prototype role gate.

---

## 39. Portfolio Record

Post-investment continuation connected to the original case.

---

## 40. Monitoring Update

Manual post-investment update in the current PoC.

---

# PART VIII — CURRENT ACCESS GATE

---

## 41. Access Model

Current local access flow:

**Locked Entry**  
→ **Workspace Identity**  
→ **Operator Authentication**  
→ **Device Session**  
→ **Private Workspace**

---

## 42. Initialization

User supplies:

- Display Name,
- Access Phrase.

System generates:

- Workspace ID,
- Recovery Key.

Do not expose, log, commit, or reproduce real user credentials or recovery material.

---

## 43. Returning Access

Uses:

- Workspace ID,
- Access Phrase,
- registered browser/device state.

---

## 44. Recovery

Requires:

- Workspace ID,
- Access Phrase,
- Recovery Key.

Recovery does not reset a forgotten phrase.

---

## 45. Current Security Position

The Access Gate is a **functional local PoC trust boundary**.

It is not:

- enterprise auth,
- verified firm identity,
- production tenancy,
- certified security.

Do not upgrade its claims through copy alone.

---

# PART IX — CURRENT ANALYSIS WORKFLOW

---

## 46. Pre-Analysis State

The user sees:

- source count,
- evidence count,
- evidence state,
- conflicts,
- unknowns,
- readiness information.

Do not replace this with an arbitrary universal score.

---

## 47. Processing State

Current short sequence is illustrative.

It is not real model telemetry.

Do not add fake:

- GPU metrics,
- model confidence animations,
- neural visualizations,
- token theater.

---

## 48. Result State

Current Analysis result contains:

- run identity,
- context,
- evidence snapshot,
- source references,
- executive synthesis,
- findings,
- Why This Could Win,
- Why This Could Fail,
- contradictions,
- critical unknowns,
- diligence suggestions,
- human review handoff.

---

## 49. Suggested Diligence

Suggested question remains non-persistent until the user explicitly saves it.

Preserve this boundary.

---

# PART X — CURRENT ROLE & DECISION MODEL

---

## 50. Current Prototype Roles

- Analyst
- Partner
- Admin

Roles are self-selectable for demonstration.

This is not production authorization administration.

---

## 51. Current Decision Gate

Analyst:

- cannot record Final Decision.

Partner/Admin:

- can record Final Decision.

Decision rationale is required.

---

## 52. Do Not Move Permission Logic Into the UI Only

Client visibility is not authorization.

Material permission logic must remain server-enforced.

---

# PART XI — KNOWN UNRESOLVED PRODUCT RULES

---

## 53. Lifecycle Taxonomy

Not finalized.

Do not silently invent a permanent stage model.

---

## 54. Formal Role Taxonomy

Not finalized.

Do not assume current demo roles represent all future investment firms.

---

## 55. Investment Committee Governance

Not finalized.

Open:

- quorum,
- voting,
- conditional approval,
- dissent,
- re-review,
- authority.

---

## 56. Post-Investment Decision Semantics

Known current edge case:

- Invested decision exists,
- Portfolio Record exists,
- later Pass can be recorded,
- Portfolio remains.

This preserves history but is not an approved business rule for exits/reversals.

Do not “fix” it by guessing.

---

## 57. Evidence Verification

Current `Verified` state is human-assigned.

Production semantics remain open.

---

## 58. Diligence Provenance

Immutable structural relationship between:

- Diligence Question,
- Analysis Run,
- Finding,
- Evidence

is not fully modeled.

---

## 59. Materiality & Prioritization

No approved universal model exists for:

- finding severity,
- risk materiality,
- diligence priority.

---

# PART XII — UNKNOWN RULE PROTOCOL

---

## 60. Mandatory Rule

When a required business rule is unknown:

> **Do not invent it silently.**

Use one of:

- `OPEN DECISION`,
- `PROTOTYPE ASSUMPTION`,
- `TODO`,
- explicit clarification request.

---

## 61. Good Behavior

Example:

> “The project does not define whether an invested case can later transition to Passed as a lifecycle action. I will preserve current behavior and mark this as an open product decision.”

---

## 62. Bad Behavior

Example:

> silently delete the Portfolio Record because that feels logically cleaner.

---

# PART XIII — SAFE CHANGE PROTOCOL

---

## 63. Before Any Significant Change

Perform:

1. identify the user goal,
2. inspect current `main`,
3. identify affected product objects,
4. read relevant canonical documents,
5. check Decision & Invariant Register,
6. identify open rules,
7. inspect existing tests,
8. make the smallest coherent implementation plan,
9. preserve current data behavior,
10. validate after implementation.

---

## 64. During Implementation

Prefer:

- minimal surface area,
- reuse of existing object model,
- explicit new types,
- explicit boundary checks,
- existing design system,
- existing history model.

Avoid:

- opportunistic rewrites,
- silent schema changes,
- unrelated redesigns,
- speculative abstraction,
- replacing product behavior because code seems unusual.

---

## 65. After Implementation

Run relevant:

- typecheck,
- build,
- unit/derivation tests,
- workflow tests,
- auth tests,
- browser validation when UI/auth changed.

Then document:

- what changed,
- what did not change,
- any new assumptions,
- any unresolved issue,
- validation result.

---

# PART XIV — DATABASE / MODEL CHANGE PROTOCOL

---

## 66. Before Changing Persistence

Ask:

- Does this change product meaning?
- Does existing local data need migration?
- Does this affect historical snapshots?
- Does this affect source files?
- Does this affect owner identity?
- Does this break legacy access?

---

## 67. Preserve Historical Data

Do not casually:

- rewrite old Analysis Runs,
- delete old Decisions,
- flatten reviews,
- merge multiple Investment Cases,
- migrate legacy data without explicit strategy.

---

## 68. Current Aggregate Model Is Not Sacred

The current workspace aggregate is a PoC storage choice.

It may later be normalized.

But normalization must preserve product semantics.

---

# PART XV — UI / DESIGN CHANGE PROTOCOL

---

## 69. Read Before Redesign

Before major visual work, read:

- `07 — Experience & Design System Vision`,
- relevant product object docs.

---

## 70. Current Visual Identity

> **Dark is the environment. Blue is the identity.**

Target:

- calm,
- private,
- precise,
- modern,
- systemic,
- operational.

---

## 71. Current Navigation Direction

Global:

- bottom navigation rail,
- contextual top bar.

Case-local:

- horizontal tabs.

Do not replace this merely because a left sidebar is easier or more familiar.

---

## 72. Avoid AI-Slop

Do not add:

- glowing orbs,
- sparkle decorations,
- blue-purple AI gradients,
- cyberpunk scanning effects,
- fake telemetry,
- decorative security badges,
- meaningless metrics.

---

## 73. UI Must Represent Real Meaning

Every visible system element should correspond to:

- product state,
- metadata,
- navigation,
- action,
- history,
- evidence,
- real operational information.

---

# PART XVI — REAL AI IMPLEMENTATION PROTOCOL

---

## 74. Read Before AI Work

Before implementing real AI, read:

- `02 — Product Principles`,
- `04 — Product & Object Architecture`,
- `06 — Intelligence & AI Architecture Vision`,
- `08 — Security, Privacy & Workspace Trust Vision`,
- `10 — Decision & Invariant Register`.

---

## 75. Preferred First Live-AI Boundary

Current strong direction:

> **Grounded, read-oriented Investment Case Assistant**

Initial capabilities may include:

- case Q&A,
- evidence lookup,
- analysis explanation,
- run comparison,
- thesis challenge,
- diligence suggestion.

---

## 76. Preferred Initial Architecture

Conceptually:

**User Question**  
→ **Intent Resolver**  
→ **Case Context Builder**  
→ **Relevant Structured Retrieval**  
→ **Provider Adapter**  
→ **Grounded Response**  
→ **Evidence References**

---

## 77. Do Not Begin With Full RAG Automatically

Use current structured objects first.

Introduce embeddings/vector retrieval only when a concrete retrieval problem justifies it.

---

## 78. Provider Adapter

Do not spread one provider SDK throughout business logic.

Prefer:

**KRAVV Intelligence Interface**  
→ **Provider Adapter**  
→ **Provider / Model**

---

## 79. AI Failure Must Be Safe

Provider failure must not:

- corrupt case state,
- erase existing analysis,
- block source access,
- block historical decisions.

---

## 80. AI Write Actions

Initial assistant should not silently:

- change evidence,
- mark Verified,
- record Recommendation,
- record Final Decision,
- create Portfolio state.

Future write actions should use:

**propose**  
→ **human review**  
→ **confirm**  
→ **persist**  
→ **record activity**

---

# PART XVII — DOCUMENT EXTRACTION PROTOCOL

---

## 81. Extraction Is Candidate Generation

Future automatic extraction should create candidate information.

It should preserve:

- source,
- locator,
- raw excerpt,
- normalized value,
- extraction context.

---

## 82. Do Not Treat Extraction as Verification

Model extraction does not prove a claim is true.

---

# PART XVIII — SECURITY CHANGE PROTOCOL

---

## 83. Before Security/Auth Work

Read:

- current root README,
- application README,
- Access Gate code,
- `08 — Security, Privacy & Workspace Trust Vision`,
- current auth tests.

---

## 84. Preserve Local vs Hosted Separation

Current local Access Gate behavior and hosted Sites/ChatGPT identity path are separate.

Do not accidentally expose local Access Gate into production-worker behavior without explicit architecture.

---

## 85. Do Not Weaken Origin/Host Protection Casually

The Access Gate previously experienced a real native-form origin defect.

The current fix changed referrer behavior while preserving validation.

Any future auth-form change should re-run browser and auth acceptance tests.

---

## 86. Secrets

Never:

- commit API keys,
- expose Access Phrases,
- expose Recovery Keys,
- expose signing keys,
- print auth cookies into user-visible output.

---

# PART XIX — TESTING EXPECTATIONS

---

## 87. Test Before Trusting a Refactor

At minimum, after broad product changes run:

```powershell
npm run typecheck
npm run build
```

Then relevant executable tests.

---

## 88. Auth Regression

Run:

```powershell
node tests/auth-access.mjs
```

for Access Gate changes.

Use restart verification when persistence/session behavior changed.

---

## 89. Workflow Regression

Run:

```powershell
node tests/workflow.mjs
```

for core product mutation and persistence work.

---

## 90. Analysis Regression

Run:

```powershell
node tests/analysis-workflow.mjs
node tests/analysis-view.mjs
```

for Analysis workflow or result derivation changes.

---

## 91. Browser Validation

Automated scripts do not replace all browser validation.

Manually validate when changing:

- Access Gate forms,
- navigation,
- complex interactive workflow,
- visual states,
- authentication transitions.

---

# PART XX — CURRENT TEST INVARIANTS

---

## 92. Important Behaviors Tests Should Continue Protecting

- workspace isolation,
- private source retrieval,
- exact-byte source download,
- stale revision rejection,
- historical evidence snapshot,
- multiple Analysis Runs,
- Human Review preservation,
- role decision restriction,
- Recommendation/Decision separation,
- Portfolio history,
- reload persistence,
- Access Gate recovery,
- sign-out revocation.

---

# PART XXI — CURRENT DESIGN / CODE BOUNDARIES

---

## 93. Product Logic vs Presentation

Do not push product invariants into CSS/UI only.

For example:

- decision authority belongs in backend logic,
- history semantics belong in model/storage logic,
- evidence provenance belongs in data model,
- presentation merely exposes those rules.

---

## 94. Prompt Logic vs Application Logic

Do not enforce core business rules only through prompts.

LLMs are not permission engines.

---

# PART XXII — WORKING WITH HISTORICAL REPORTS

---

## 95. Reports Are Evidence of Project Evolution

Current root includes reports such as:

- `phase1-completion-report.md`,
- `core-analysis-workflow-report.md`,
- `functional-poc-completion-report.md`,
- `implementation-status.md`.

Use them to understand:

- what happened,
- which validation was performed,
- previous limitations.

---

## 96. Reports Are Not Automatically Current Canon

Older text may describe a state before:

- Access Gate,
- later bug fixes,
- current canonical documentation.

Always compare with `main`.

---

# PART XXIII — LEGACY EXPERIMENT CONTEXT

---

## 97. V1 Historical Meaning

Earlier KRAVV-IENT / `kvv1` experimentation tested:

> Can AI ingest a pitch deck and produce usable structured VC analysis?

It used a simpler flow:

**PDF**  
→ **text extraction**  
→ **single LLM call**  
→ **structured analysis**

That experiment helped reveal important future requirements:

- hard facts should remain stable,
- analysis should be structured,
- one giant prompt is limiting,
- private document handling matters,
- historical reasoning deserves better architecture.

---

## 98. Do Not Rebuild V1 Inside V3

V3 intentionally evolved toward a larger decision system.

Do not regress to:

> upload deck → model answer → result page

as the main architecture.

---

# PART XXIV — HANDOFF TASK TYPES

---

## 99. Small Bug Fix

Recommended process:

1. reproduce bug,
2. identify affected invariant,
3. inspect smallest relevant files,
4. patch narrowly,
5. run focused tests,
6. run typecheck/build if appropriate,
7. report exact change.

Do not redesign unrelated behavior.

---

## 100. New UI Surface

Process:

1. identify product object,
2. identify actual user task,
3. read design doc,
4. reuse navigation/hierarchy,
5. avoid fake data,
6. preserve responsive scope,
7. validate product state.

---

## 101. New Domain Feature

Process:

1. check `03` Domain Workflow,
2. check `04` Object Architecture,
3. check `10` Decision Register,
4. identify whether the business rule is known,
5. if unknown, label it,
6. implement without pretending universal domain certainty.

---

## 102. New AI Feature

Process:

1. identify the user question,
2. identify required case context,
3. distinguish deterministic vs probabilistic work,
4. define grounding,
5. define failure behavior,
6. define authority boundary,
7. define persistence boundary,
8. define evaluation criteria,
9. then implement provider integration.

---

## 103. Persistence Refactor

Process:

1. back up runtime state,
2. inspect current model,
3. define migration,
4. preserve historical records,
5. validate stale-write behavior,
6. run workflow tests,
7. reopen existing data.

---

# PART XXV — AGENT OPERATING INSTRUCTIONS

---

## 104. Default Agent Behavior

When assigned a KRAVV-IENT task:

- inspect before editing,
- use existing architecture,
- make assumptions explicit,
- prefer minimal coherent changes,
- preserve history,
- preserve tests,
- preserve data,
- report boundaries honestly.

---

## 105. Do Not Invent Missing Context

If the requested feature depends on an unresolved product decision:

do not guess.

Either:

- implement a clearly labeled prototype assumption,
- leave a TODO,
- or ask for product direction.

---

## 106. Do Not Treat Existing Code as Perfect Product Truth

Current code may contain:

- prototype assumptions,
- incomplete domain rules,
- historical compromises.

Use canonical docs to distinguish intended meaning from implementation convenience.

---

## 107. Do Not Treat Vision as Current Capability

Vision documents intentionally contain future concepts.

Do not write UI copy implying that future features already exist.

---

## 108. Do Not Treat Current Capability as Permanent Limit

The Functional PoC is a baseline, not the final product.

Avoid hard-coding PoC limitations into future architecture unless justified.

---

# PART XXVI — EXPECTED AGENT REPORT FORMAT

---

## 109. Recommended Completion Report

After meaningful implementation work, report:

### Goal

What was requested.

### What Changed

Files and behavior.

### Product Decisions Preserved

Which invariants remained intact.

### Assumptions

Any prototype assumption introduced.

### Validation

Tests/build/manual checks performed.

### Known Limitations

What remains incomplete.

### Open Decisions

Any product rule that still requires owner input.

---

# PART XXVII — WHAT NOT TO DO

---

## 110. Do Not Replace the App With a Generic AI Dashboard

The current architecture is deliberate.

---

## 111. Do Not Introduce Fake Security Language

Security copy must reflect implementation.

---

## 112. Do Not Add Fake Metrics

Do not invent:

- evidence integrity score,
- universal confidence,
- arbitrary investment score,
- model performance number,

without a real defined mechanism.

---

## 113. Do Not Auto-Resolve Contradictions

Preserve evidence conflict.

---

## 114. Do Not Rewrite Historical Runs

Create a new Analysis Run.

---

## 115. Do Not Auto-Save AI Suggestions as User Decisions

Require appropriate user action.

---

## 116. Do Not Publicize Private Documents

Preserve authenticated access.

---

## 117. Do Not Delete Legacy / Current Data Without Migration Intent

Back up first.

---

## 118. Do Not Over-Engineer Before the Product Needs It

Avoid adding:

- complex microservices,
- multi-agent orchestration,
- vector databases,
- event buses,
- enterprise IAM,

only because they may be useful someday.

---

# PART XXVIII — CURRENT NEXT-STEP CONTEXT

---

## 119. Strongest Current Product Direction

The current Functional PoC baseline is sufficiently complete that future intelligence experiments can begin without rebuilding the workspace.

The strongest current candidate is:

> **Grounded read-only Investment Case Assistant**

This is a direction, not a mandatory immediate task.

---

## 120. Why the Grounded Assistant Is a Good Next Experiment

It can test:

- real LLM integration,
- case context selection,
- structured evidence retrieval,
- provider abstraction,
- grounded explanation,
- contradiction-aware answers,
- thesis challenge,
- failure handling.

It does not require immediately solving:

- automatic extraction,
- full RAG,
- multi-user tenancy,
- external research,
- full production security.

---

# PART XXIX — LONG-TERM CONTEXT

---

## 121. Long-Term Product Shape

KRAVV-IENT may eventually evolve toward:

**Sources**  
→ **Extraction**  
→ **Evidence Graph**  
→ **Deterministic Metrics**  
→ **Grounded Analysis**  
→ **Challenge**  
→ **Diligence**  
→ **Human Review**  
→ **Recommendation**  
→ **Decision**  
→ **Portfolio Monitoring**  
→ **Institutional Learning**

---

## 122. Long-Term Strategic Asset

The durable asset is not one model.

It is the structured decision memory accumulated across:

- evidence,
- reasoning,
- uncertainty,
- disagreement,
- decisions,
- outcomes.

---

# PART XXX — QUICK START FOR A NEW AGENT

---

## 123. Minimum Context Before Touching Code

If time is limited, read at least:

1. `00 — Project Overview`
2. `04 — Product & Object Architecture`
3. `05 — Current Functional PoC & System State`
4. `10 — Decision & Invariant Register`
5. this document

If working on AI, also read `06`.

If working on UI, also read `07`.

If working on security/auth, also read `08`.

---

## 124. Minimum Repository Preflight

Before editing:

```text
1. Confirm branch = main or intended working branch.
2. Inspect latest commit.
3. Read root README.
4. Read KRAVV-IENT-Phase1-source/README.md.
5. Run the application.
6. Reproduce the relevant behavior.
7. Inspect relevant tests.
```

---

## 125. Minimum Validation Before Handoff

At minimum for meaningful changes:

```powershell
npm run typecheck
npm run build
```

plus relevant acceptance tests.

---

# PART XXXI — COPY-PASTE AGENT BRIEF

---

## 126. Compact Agent Brief

The following block can be reused when handing the repository to a new coding agent:

```text
You are working on KRAVV-IENT, a private AI-assisted investment intelligence workspace.

Do not treat it as a generic pitch-deck analyzer, CRM, chatbot, or AI dashboard.

The primary product object is Investment Case.

Core invariants:
- Company != Investment Case
- Source != Evidence
- Evidence != Analysis
- Analysis != Human Judgment
- Human Review != Recommendation
- Recommendation != Final Decision
- Final Decision != Portfolio Record
- New evidence must not rewrite historical Analysis Runs
- AI suggestions must not silently become persistent user actions
- Contradictory evidence must remain visible
- Model output is not verified fact
- AI assists; humans decide
- Provider choice is not product identity

Current state:
- Functional local desktop PoC
- KRAVV Access Gate
- persistent workspace
- private source upload/download
- manual Structured Evidence
- versioned simulated Analysis Runs
- Diligence Questions
- Human Review
- Recommendation
- role-gated Final Decision
- Portfolio + manual Monitoring
- no live LLM
- no automatic extraction
- no production RAG
- no external research
- no production multi-user tenancy/security

Unknown business rule = do not invent silently.
Use a clearly labeled prototype assumption, TODO, open decision, or ask for direction.

Before modifying:
1. inspect current main,
2. read canonical docs,
3. identify affected invariants,
4. inspect existing tests,
5. preserve local data/history,
6. implement the smallest coherent change,
7. run relevant validation.

Current visual direction:
“Dark is the environment. Blue is the identity.”
Private, calm, precise, systemic, modern workstation.
No cyberpunk, fake telemetry, fake security, generic AI gradients, decorative charts, or arbitrary scores.

Real AI should eventually be added on top of the current case architecture, preferably through:
Question -> Intent -> Case Context -> Relevant Retrieval -> Provider Adapter -> Grounded Response -> Evidence References.

Do not rebuild the product around chat.
```

---

# PART XXXII — FINAL HANDOFF CHECKLIST

---

## 127. Product Checklist

Before handing off work, verify:

- product object boundaries remain intact,
- no new unsupported business rule was silently introduced,
- current vs future capability remains honestly labeled,
- history was preserved,
- user authority was preserved.

---

## 128. Technical Checklist

Verify:

- typecheck,
- build,
- relevant tests,
- persistence behavior,
- source access,
- role restrictions where applicable.

---

## 129. Design Checklist

Verify:

- UI represents real state,
- no fake telemetry,
- no generic AI decoration,
- hierarchy is understandable,
- current/historical state remains distinguishable.

---

## 130. Security Checklist

Verify:

- no secret exposed,
- no private document made public,
- material permissions are server-enforced,
- security copy matches actual implementation.

---

## 131. Documentation Checklist

If the change is significant:

- update Current State,
- update Roadmap if maturity changes,
- update Decision Register if a product decision changes,
- preserve historical reports rather than rewriting project history.

---

# PART XXXIII — FINAL HANDOFF PRINCIPLE

---

## 132. Final Principle

KRAVV-IENT is intentionally designed so that future intelligence can become much more sophisticated without destroying the clarity of its decision model.

A new developer or agent should therefore resist the temptation to begin with technology.

Begin with meaning.

Understand:

- what the Company is,
- what the Investment Case is,
- what came from a Source,
- what became Evidence,
- what the system interpreted,
- what the human believed,
- what was recommended,
- what was decided,
- and what happened afterward.

Then change the code.

The safest summary of the entire handoff is:

> **Preserve the chain of meaning from Source to Decision, preserve its history, and add new intelligence without obscuring who knew what, who believed what, and why the final judgment existed.**
