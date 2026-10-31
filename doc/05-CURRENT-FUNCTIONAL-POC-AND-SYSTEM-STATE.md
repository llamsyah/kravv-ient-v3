# KRAVV-IENT — Current Functional PoC & System State

**Document ID:** 05  
**Document Type:** Canonical Current-State Snapshot  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Current Implementation Reference  
**Scope:** Functional PoC implementation, runtime behavior, validation state, limitations, and technical boundaries  
**Current Product Stage:** Functional Proof of Concept  
**Repository:** `llamsyah/kravv-ient-v3`  
**Authoritative Branch:** `main`  
**Latest Verified Repository Checkpoint:** `b4bed67024cabcf4ef7b424331a911006a2ae869`  
**Checkpoint Message:** `Fix localhost Access Gate native form origin rejection`  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document describes **what KRAVV-IENT actually is today**.

Unlike the Product Vision, this document is not aspirational.

Unlike the Domain & Investment Workflow document, this document is not a generalized VC workflow reference.

Unlike Product & Object Architecture, this document does not primarily define the ideal meaning of objects.

This document is the current-state snapshot.

It should answer:

- What is implemented?
- What is functional?
- What is simulated?
- What persists?
- What is protected?
- What is still manual?
- What has been validated?
- What remains incomplete?
- What assumptions are temporary?
- What known edge cases exist?
- How is the current PoC run locally?
- Which future capabilities must not be mistaken for existing functionality?

Future builders should update this document when the current product state materially changes.

---

# PART I — CURRENT MILESTONE

---

## 2. Current Milestone

KRAVV-IENT has reached a **Functional Proof of Concept baseline**.

The current system proves that the following investment workflow can exist as one persistent product:

**Access**  
→ **Workspace**  
→ **Company / Investment Case**  
→ **Context**  
→ **Source Documents**  
→ **Structured Evidence**  
→ **Analysis Readiness**  
→ **Simulated Analysis**  
→ **Saved Historical Run**  
→ **Diligence**  
→ **Human Review**  
→ **Recommendation**  
→ **Final Decision**  
→ **Portfolio**  
→ **Monitoring**

The PoC is therefore beyond a visual mockup.

It contains functional:

- persistence,
- authentication-like local access,
- source storage,
- workflow mutations,
- analysis history,
- role permission demonstration,
- decision history,
- portfolio history.

Its **intelligence layer remains simulated**.

---

## 3. What the PoC Proves

The current PoC proves several product hypotheses.

### 3.1 A persistent Investment Case can be the center of the workflow

The product no longer depends on a single generated analysis.

A case can accumulate information and judgment over time.

### 3.2 Source material and evidence can remain separate

A document can exist without implying that its contents have been extracted or verified.

### 3.3 Analysis can be historical

Analysis Runs preserve evidence snapshots rather than silently following the latest case state.

### 3.4 Human judgment can remain separate from system assessment

A human can disagree without rewriting the system output.

### 3.5 Recommendation can remain separate from decision

The analyst-level judgment and authorized decision can coexist.

### 3.6 Investment history can survive portfolio transition

The original case and thesis remain accessible after investment.

### 3.7 Private local access can be represented as a real product boundary

The Access Gate demonstrates a workspace identity, credential, device, session, recovery, and sign-out flow without pretending to be production enterprise security.

---

# PART II — REPOSITORY STATE

---

## 4. Repository

Primary repository:

`https://github.com/llamsyah/kravv-ient-v3`

Current application source:

`KRAVV-IENT-Phase1-source/`

Root-level files contain:

- setup wrapper,
- implementation reports,
- validation reports,
- current application directory.

The earlier `KRAVV-IENT-source` directory was removed during repository consolidation.

The authoritative working application remains in:

`KRAVV-IENT-Phase1-source`

---

## 5. Current Commit Lineage

Important current checkpoints include:

### `8cb1f548f0193a47c7d8a4dfd757afda1af156de`

**Apply validated V3 surface design pass**

Established the current calm dark workstation surface direction.

### `d6f15977033f397a82b094d357f2120657af8258`

**Complete core analysis workflow PoC**

Completed the primary Case → Evidence → Analysis → Review workflow.

### `272b604f08afedb209c9bc6df1247a645a802531`

**Make local workspace runnable with personal sign-in**

Introduced an intermediate local personal sign-in path.

### `89524d054de9efdc71ba3dd02158d9ad11297a87`

**Require personal identity for local sessions**

Strengthened the interim local identity behavior.

### `5f131a42d822833b7e1d99d150b4acdef4365cd6`

**Integrate local Access Gate and validate persistent PoC workflows**

Introduced the current KRAVV Access Gate model and broad functional validation.

### `b4bed67024cabcf4ef7b424331a911006a2ae869`

**Fix localhost Access Gate native form origin rejection**

Fixed a real browser initialization/sign-out form defect caused by the previous referrer policy.

This is the latest verified repository checkpoint at the time of this document.

---

# PART III — CURRENT PRODUCT SURFACES

---

## 6. Global Workspace Navigation

The current desktop workspace includes global destinations:

- Dashboard
- Deal Flow
- Companies
- Portfolio
- Documents
- Settings

The global navigation is presented through a bottom navigation rail.

The interface uses a top contextual bar and case-local navigation where appropriate.

---

## 7. Investment Case Navigation

Current case-local sections include:

- Overview
- Evidence
- Analysis
- Diligence
- Decision
- Activity

The current navigation model intentionally separates global workspace navigation from local Investment Case navigation.

---

## 8. Dashboard

The Dashboard currently serves as a workspace summary and action surface.

Its purpose is not to display decorative metrics.

The current design direction favors:

- meaningful counts,
- recent activity,
- actionable case information,
- honest workspace state.

The Dashboard is not yet a mature cross-case intelligence surface.

---

## 9. Deal Flow

Deal Flow provides the current pipeline-level view of Investment Cases.

Current lifecycle labels remain provisional.

The PoC should not be interpreted as defining the final universal VC pipeline.

---

## 10. Companies

The Companies surface represents long-lived company identities.

A Company can link to one or more Investment Cases.

The current company view aggregates linked history at a basic level.

It is not yet a true cross-case intelligence graph.

---

## 11. Portfolio

Portfolio contains companies/cases explicitly transitioned after an invested decision.

Portfolio preserves connection to the original Investment Case.

Monitoring currently remains manual.

---

## 12. Documents

The Documents surface represents uploaded source material.

Documents are stored privately in the local runtime environment.

Upload does not currently trigger:

- parsing,
- extraction,
- embedding,
- summarization,
- verification,
- AI analysis.

A document remains source material until relevant information is manually recorded as Structured Evidence.

---

## 13. Settings

Settings currently includes:

- signed-in operator identity,
- Workspace ID display,
- Access Gate session context,
- Sign Out,
- prototype role selector,
- implementation-boundary information.

The same local owner can switch between prototype roles for demonstration.

This is not production role management.

---

# PART IV — KRAVV ACCESS GATE

---

## 14. Access Gate Purpose

KRAVV Access Gate exists to make entry into the current local PoC feel consistent with the private-workspace product concept.

It is not merely a styled email/password form.

The model is:

**Locked Entry**  
→ **Workspace Identity**  
→ **Operator Authentication**  
→ **Device Session**  
→ **Private Workspace**

---

## 15. First-Time Workspace Initialization

First-time access uses:

- Display Name
- Access Phrase

The system generates:

- Workspace ID
- Recovery Key

The user must preserve the generated Workspace ID and Recovery Key.

The Recovery Key is shown once by the application.

The initialization flow then establishes the current browser/device session.

---

## 16. Returning Access

Returning access on a registered browser uses:

- Workspace ID
- Access Phrase

If the session/device state remains valid, the workspace can be reopened.

---

## 17. Device Recovery

If the device credential is missing or expired, recovery requires:

- Workspace ID
- existing Access Phrase
- Recovery Key

Recovery:

- restores device access,
- keeps the same workspace owner,
- keeps existing cases,
- does not reset the Access Phrase.

---

## 18. Sign-Out Behavior

Sign Out:

- revokes the current active session server-side,
- preserves registered-device state,
- preserves workspace data,
- preserves uploaded source documents,
- preserves analysis and decision history.

A future login can therefore return to the same data.

---

## 19. Current Session Policy

Current local Access Gate behavior includes:

- session lifetime: approximately 12 hours,
- registered device lifetime: approximately 180 days,
- device match required for normal returning session behavior.

These are PoC policies.

They are not approved production authentication policy.

---

## 20. Credential Storage

The local Access Gate uses:

- independently salted `scrypt` hashes for secret credentials,
- hashed random session/device tokens,
- signed cookies,
- a local credential registry.

Plain Access Phrases and Recovery Keys are not intended to be stored directly.

---

## 21. Access Gate Runtime Files

Local credentials, device records, and sessions are stored under:

`KRAVV-IENT-Phase1-source/.sites-runtime/access-gate/credentials.json`

The local signing key is stored under:

`KRAVV-IENT-Phase1-source/.sites-runtime/local-auth-key`

These runtime paths are ignored by Git.

---

## 22. Access Gate vs Hosted Identity

The local Access Gate is development-only behavior.

The production worker retains the existing hosted Sites / ChatGPT identity path.

The local Access Gate does not authenticate a real ChatGPT account.

The local and hosted identity systems are intentionally separate at this stage.

---

## 23. Legacy Access Path

Data created before Access Gate may be accessed through the explicit legacy path.

This path:

- opens pre-existing legacy records,
- does not migrate them to a new Workspace ID,
- does not upgrade their historical access boundary,
- does not allow a new generated workspace to silently overwrite them.

The limitation is intentional and documented.

---

## 24. Access Gate Browser Defect and Resolution

Manual browser acceptance discovered a real defect.

Symptom:

> successful-looking initialization form submission returned a plain `Forbidden` page.

Root cause:

The Access Gate page used a `no-referrer` policy.

Native local form navigation could therefore arrive with:

`Origin: null`

The local framework/origin guard rejected the request.

The final fix changed the relevant page policy to:

`same-origin`

while preserving:

- host checks,
- loopback checks,
- same-origin validation,
- external-origin rejection,
- cross-site protection.

The fix was committed as:

`b4bed67024cabcf4ef7b424331a911006a2ae869`

After the fix and page refresh, manual initialization successfully reached the Recovery Key step and entered the private workspace.

---

# PART V — COMPANY & INVESTMENT CASE

---

## 25. Company

Company is a persistent business identity.

Current product rule:

> Company and Investment Case are separate.

A Company may have multiple historical Investment Cases.

---

## 26. Investment Case

Investment Case is the primary current decision object.

It contains or links to:

- context,
- source documents,
- evidence,
- analysis runs,
- diligence,
- human reviews,
- recommendations,
- final decisions,
- activity history,
- optional portfolio record.

---

## 27. Case Creation

The current PoC supports lightweight case creation.

The user does not need to complete a full diligence record before opening a case.

New cases currently begin with provisional lifecycle state:

`Sourced`

This is a prototype assumption.

---

## 28. Living Case Context

Case context can be enriched after creation.

This supports the idea that investment understanding grows over time.

Context may include items such as:

- stage,
- owner,
- source,
- round,
- target check,
- valuation,
- thesis,
- notes.

Exact domain fields remain subject to future refinement.

---

# PART VI — SOURCE DOCUMENTS

---

## 29. Private Upload

The current PoC supports source-document upload.

Documents are associated with authenticated workspace context.

Uploaded bytes persist locally.

---

## 30. Current Upload Limit

The current PoC upload limit is:

**20 MB**

This is a prototype implementation limit.

It is not a future product commitment.

---

## 31. Private Download

Document retrieval requires authenticated access.

Cross-workspace source access was included in functional validation.

Another workspace must not be able to retrieve a source file owned by a different workspace.

---

## 32. No Automatic Extraction

Current upload behavior deliberately stops at storage.

The system does not yet automatically:

- read document contents,
- create facts,
- create claims,
- create embeddings,
- extract financial values,
- identify contradictions,
- generate analysis.

This limitation is intentional.

---

# PART VII — STRUCTURED EVIDENCE

---

## 33. Manual Evidence Capture

Relevant information is currently entered manually as Structured Evidence.

This preserves the distinction:

**Document exists**  
≠  
**Evidence has been recorded**

---

## 34. Evidence Status

Current evidence states are:

- Reported
- Supported
- Verified
- Conflicting
- Unknown

These states are assigned by the human recorder.

The current system does not independently verify evidence.

---

## 35. Source References

Evidence can reference source material.

The system supports source inspection using stored:

- excerpt,
- locator,
- document reference.

This provides the beginning of evidence provenance.

---

## 36. Contradictory Evidence

The current product can represent conflicting evidence.

Conflicts are not automatically reconciled.

This behavior is intentional.

---

# PART VIII — ANALYSIS READINESS

---

## 37. Readiness Purpose

Before analysis, the user sees a readiness state.

The purpose is to answer:

> What information does this case currently contain?

Readiness is not a universal investment score.

---

## 38. Readiness Inputs

Current readiness presentation derives from real case records, including:

- source count,
- evidence count,
- evidence status counts,
- conflict state,
- unknown state.

It does not invent an arbitrary confidence percentage.

---

# PART IX — CURRENT ANALYSIS ENGINE

---

## 39. Current Intelligence Mode

The current analysis engine is:

**Deterministic simulation**

Implementation identity:

`rules-v1`

It is not connected to a live LLM.

---

## 40. Analysis Processing Sequence

The current interface displays a short processing sequence representing product stages such as:

- Preparing evidence snapshot
- Reviewing recorded statuses
- Preserving conflicts / unknowns
- Building simulated findings
- Confirming saved analysis run

The sequence lasts approximately three seconds.

This is UX simulation.

It is not:

- model telemetry,
- GPU telemetry,
- background-job telemetry,
- provider streaming.

---

## 41. Save Behavior

The save is initiated as part of the run flow.

Completion is presented after the saved run succeeds.

A reload can recover the saved Analysis Run.

---

## 42. Saved Analysis Run

A saved run includes:

- run identity,
- timestamp,
- analysis context,
- evidence snapshot,
- document references derived from evidence,
- executive synthesis,
- findings,
- evidence grouping,
- contradictions,
- unknowns,
- diligence suggestions,
- associated human-review context.

---

## 43. Historical Evidence Snapshot

Each Analysis Run preserves the evidence state used by that run.

Later evidence does not silently modify the historical snapshot.

This is one of the most important current product invariants.

---

## 44. Current vs Historical State

The product can distinguish the current case evidence from an older run snapshot.

This supports visibility into what changed after a previous analysis.

---

## 45. Current Analysis Limitations

The current engine does not:

- reason with a real LLM,
- read uploaded files automatically,
- conduct external research,
- independently verify evidence,
- automatically detect all contradictions,
- perform complete financial analysis,
- calibrate confidence,
- perform cross-case reasoning.

---

# PART X — FINDINGS & ANALYSIS RESULT

---

## 46. Current Result Structure

Current analysis output includes or groups information into:

- Executive Synthesis
- Key Findings
- Why This Could Win
- Why This Could Fail
- Supported / Verified evidence
- Reported claims
- Contradictions
- Critical Unknowns
- Suggested Diligence
- Evidence traceability

---

## 47. Expandable Findings

Findings can be inspected rather than treated as one opaque paragraph.

The result surface is designed to support deeper source/evidence inspection.

---

## 48. No Universal Investment Score

The current product intentionally avoids one universal score such as:

`Investment Score = 82/100`

The preferred model is structured reasoning.

---

# PART XI — DILIGENCE

---

## 49. Persistent Diligence Questions

Diligence Questions are persistent product objects.

They can include:

- question,
- owner,
- status,
- trigger/context,
- response,
- resolution.

---

## 50. AI/System Suggestion vs Saved Question

Current simulated analysis may suggest diligence.

A suggestion does not automatically become a persistent question.

The user must explicitly save it.

This preserves:

**Generated suggestion**  
≠  
**Accepted workflow commitment**

---

## 51. Current Diligence Provenance Limitation

The current model does not contain a dedicated immutable question-to-analysis-run foreign-key relationship.

The product currently includes run/context information in the question workflow as a convention.

A richer immutable provenance relationship remains future work.

---

# PART XII — HUMAN REVIEW

---

## 52. Human Review Purpose

Human Review records the user’s judgment about system analysis.

Conceptually, review can express:

- Agree
- Disagree
- Add Context
- Override

---

## 53. Separation from Analysis

Human Review is stored separately from the original Analysis Run.

The original system output remains intact.

This preserves disagreement.

---

## 54. Historical Review

Reviews remain tied to the historical analysis context rather than being treated as a single mutable “current opinion.”

---

# PART XIII — RECOMMENDATION

---

## 55. Analyst Recommendation

Recommendation is a persistent judgment layer separate from final decision.

This allows the system to represent:

> What did the analyst think should happen?

without confusing it with:

> What did the authorized decision-maker decide?

---

## 56. Current Recommendation Boundary

The current product preserves recommendation history separately from final decisions.

Exact recommendation taxonomy may evolve.

---

# PART XIV — FINAL DECISION

---

## 57. Final Decision

Final Decision is a persistent authorized outcome.

The current PoC demonstrates server-side permission checks.

---

## 58. Current Decision Permissions

### Analyst

Cannot record final decision.

### Partner

Can record final decision.

### Admin

Can record final decision.

Decision rationale is required.

---

## 59. Permission Model Limitation

Role switching is currently self-selectable.

Therefore:

- the permission gate is functional,
- the role-administration model is not production-valid.

---

## 60. Successive Decisions

The system preserves successive decision history.

A later decision does not delete the earlier decision.

---

## 61. Known Decision Edge Case

The current provisional model allows:

- an Investment Case to be Invested,
- a Portfolio Record to exist,
- the case to later receive another decision such as Pass,
- while the existing Portfolio Record remains.

This behavior preserves history.

However:

> It is not an approved exit, reversal, cancellation, or post-investment business rule.

This remains an open product decision.

---

# PART XV — PORTFOLIO & MONITORING

---

## 62. Portfolio Transition

Portfolio entry is explicit.

An Invested decision does not silently erase the original case.

---

## 63. Portfolio History

Portfolio retains connection to:

- original case,
- thesis,
- evidence,
- analysis,
- decisions.

---

## 64. Monitoring

Monitoring updates are currently manual.

The system does not automatically:

- query company data,
- detect market events,
- create alerts,
- research news,
- update metrics.

---

# PART XVI — ACTIVITY & HISTORY

---

## 65. Activity History

The current case maintains append-like activity for important workflow events.

This supports case reconstruction.

---

## 66. Historical Preservation

Current product behavior prioritizes preservation of:

- previous analysis runs,
- previous evidence snapshots,
- previous reviews,
- previous recommendations,
- previous decisions.

---

# PART XVII — PERSISTENCE

---

## 67. Current Workspace Persistence

The current PoC uses local Cloudflare-style D1 / SQLite persistence.

A workspace is stored as a versioned aggregate keyed by owner identity.

The product state is serialized rather than fully normalized into independent relational domain tables.

---

## 68. Why the Current Model Is Acceptable

The current goal is functional product validation.

The aggregate model supports:

- case persistence,
- history,
- workflow mutation,
- validation,
- reload,
- local experimentation.

The current persistence model is not treated as final production architecture.

---

## 69. Optimistic Concurrency

Workspace writes use revision checking.

This prevents stale state from silently overwriting newer workspace state.

Stale-write rejection was included in workflow validation.

---

## 70. Document Byte Storage

Uploaded source bytes are stored separately using local R2-style storage.

The current local runtime persists these files under the Cloudflare local state directory.

---

## 71. Local Data Directory

Local database and uploaded files persist under:

`KRAVV-IENT-Phase1-source/.wrangler/state`

---

## 72. Runtime Identity Directory

Access Gate identity/runtime data persists under:

`KRAVV-IENT-Phase1-source/.sites-runtime`

---

## 73. Backup Rule

To preserve a local workspace reliably:

1. Stop the development server.
2. Back up `.wrangler/state`.
3. Back up `.sites-runtime`.
4. Preserve them together.

Git does not contain these runtime records.

A fresh clone does not automatically contain local workspaces from another machine.

---

# PART XVIII — LOCAL DEVELOPMENT

---

## 74. Runtime Requirement

Current documented Node.js requirement:

**Node.js 22.13 or later**

---

## 75. Root Setup

From repository root:

```powershell
npm run setup
npm run dev
```

Then open:

`http://localhost:5173/access`

---

## 76. Existing Dependency Setup

If dependencies are already installed:

```powershell
npm run dev
```

may be sufficient.

---

## 77. Strict Port

Current local development uses:

`localhost:5173`

The port is treated as strict.

Only one development server should be run for the same checkout.

---

## 78. Root Validation

From repository root:

```powershell
npm run typecheck
npm run build
```

---

## 79. Application-Level Tests

With the development server running, from:

`KRAVV-IENT-Phase1-source`

run:

```powershell
node tests/auth-access.mjs
node tests/workflow.mjs
node tests/analysis-workflow.mjs
node tests/analysis-view.mjs
```

---

## 80. Restart Verification

After running Access Gate tests, server restart persistence can be checked using:

```powershell
node tests/auth-access.mjs --verify-restart
```

This validates persisted session/workspace behavior after an actual server restart.

---

# PART XIX — VALIDATION STATE

---

## 81. Access Gate Validation

Current automated checks cover behaviors including:

- workspace initialization,
- generated Workspace ID,
- generated Recovery Key,
- hash-only credential storage,
- invalid Access Phrase/confirmation,
- duplicate initialization handling,
- registered-device return,
- missing/tampered device behavior,
- recovery,
- invalid recovery,
- session binding,
- sign-out,
- replay rejection,
- workspace isolation,
- legacy access,
- invalid legacy owner rejection,
- origin/host/header checks,
- malformed form handling.

---

## 82. Workflow Validation

Current workflow tests cover:

- case creation,
- private upload,
- exact-byte download,
- source-linked evidence,
- immutable analysis snapshot,
- disagreement review,
- diligence resolution,
- recommendation,
- Analyst decision restriction,
- Partner decision permission,
- Admin decision permission,
- portfolio transition,
- manual portfolio update,
- case reopening,
- retained decisions,
- stale revision rejection,
- cross-workspace source protection.

---

## 83. Analysis Workflow Validation

Current analysis tests cover:

- context enrichment,
- source byte preservation,
- multiple evidence statuses,
- empty-evidence run behavior,
- multiple saved runs,
- snapshot immutability,
- run-linked disagreement,
- diligence response,
- recommendation,
- decision restriction,
- activity,
- reload persistence.

---

## 84. Analysis View Validation

Presentation derivation tests cover:

- status derivation,
- evidence delta behavior,
- snapshot isolation,
- historical diligence attribution.

---

## 85. Typecheck & Build

Current documented validation includes:

- TypeScript typecheck: PASS
- production build: PASS

---

## 86. Legacy Data Preservation

During Access Gate integration, prior local owner/workspace data was preserved rather than silently migrated or rewritten.

The completion audit recorded preservation of the earlier legacy dataset during validation.

---

## 87. Manual Browser Validation

The automated completion report originally left full authenticated browser acceptance open because the available browser automation could render pages but could not reliably type into the fields.

A later manual browser test discovered the native-form `Origin: null` defect.

That defect was fixed in commit:

`b4bed67024cabcf4ef7b424331a911006a2ae869`

Manual initialization was then able to:

- create the private workspace,
- reach the one-time Recovery Key screen,
- acknowledge the key step,
- enter the private workspace,
- show the operator identity in Settings.

This closes the specific manual initialization path that exposed the defect.

A broad future UX regression audit may still be repeated when major UI/auth changes occur.

---

# PART XX — CURRENT VISUAL SYSTEM

---

## 88. Visual Direction

Current visual direction:

> **Dark is the environment. Blue is the identity.**

The workspace uses a dark graphite / near-black system environment with restrained blue signaling.

---

## 89. Current Design Character

The current product aims to feel:

- private,
- calm,
- precise,
- modern,
- systemic,
- operational.

---

## 90. Current Navigation Architecture

Current shell uses:

- contextual top bar,
- bottom global navigation rail,
- case-local horizontal navigation,
- inspectors/contextual surfaces where useful.

There is no permanent traditional left sidebar as the primary global navigation model.

---

## 91. Desktop-First Scope

The current authoritative PoC scope is desktop.

A minimum wide workspace layout is retained.

Mobile-specific UX is not part of the current validated milestone.

---

## 92. Explicit Design Anti-Patterns

The current design direction avoids:

- fake telemetry,
- fake encryption indicators,
- fake security clearance labels,
- random logs,
- gratuitous charts,
- universal investment score theater,
- generic AI gradients,
- glassmorphism,
- excessive glow,
- cyberpunk HUD styling,
- decorative technical complexity.

---

# PART XXI — WHAT IS SIMULATED

---

## 93. Intelligence Simulation

The current analysis engine is simulated.

No live AI provider is connected.

---

## 94. Processing Simulation

The current processing sequence is illustrative.

It does not represent actual model processing telemetry.

---

## 95. Seed Data

Sample companies, metrics, source excerpts, and judgments are fictional.

They are for product demonstration and validation.

---

## 96. Role Administration

Role switching is simulated as a product demonstration.

The decision permission check is functional.

The assignment of role authority is not production-real.

---

## 97. Evidence Verification

Evidence status is human-recorded.

The system does not independently verify evidence.

---

# PART XXII — WHAT IS NOT IMPLEMENTED

---

## 98. Real LLM Intelligence

Not implemented.

Future candidate providers may include external LLM APIs, but no provider is currently canonical.

---

## 99. Grounded Assistant / Chatbot

Not implemented.

The future assistant is expected to work over Investment Case context rather than exist as a generic chatbot.

---

## 100. Automatic Document Extraction

Not implemented.

Documents do not automatically produce Structured Evidence.

---

## 101. Retrieval-Augmented Generation

Not implemented.

No production RAG architecture currently exists.

---

## 102. External Research

Not implemented.

The system does not browse, query databases, or collect external company intelligence automatically.

---

## 103. Automated Contradiction Discovery

Not implemented as a general intelligence capability.

The product can represent conflicts manually.

---

## 104. Deterministic Financial Engine

Not implemented as a dedicated mature subsystem.

---

## 105. Calibrated Confidence

Not implemented.

The product deliberately avoids arbitrary confidence percentages.

---

## 106. Collaborative Firm Tenancy

Not implemented.

The current PoC is local and effectively single-owner.

---

## 107. Production Role Administration

Not implemented.

---

## 108. Formal Investment Committee Governance

Not implemented.

---

## 109. Automated Portfolio Monitoring

Not implemented.

---

## 110. Cross-Case Institutional Intelligence

Not implemented.

The current structure provides a foundation, but no mature retrieval/reasoning layer exists.

---

## 111. Production Security

Not implemented.

The Access Gate is not equivalent to enterprise production security.

---

# PART XXIII — CURRENT PROTOTYPE ASSUMPTIONS

---

## 112. One Generated Workspace Identity per Local Owner

This is a PoC identity model.

Not a final tenancy design.

---

## 113. Self-Selectable Roles

Useful for demonstration.

Not production authorization administration.

---

## 114. New Cases Start Sourced

Current lifecycle assumption.

Final lifecycle remains unresolved.

---

## 115. Evidence Status Is Human-Assigned

Current workflow simplification.

Future assistance may evolve.

---

## 116. Portfolio Entry Is Explicit

An Invested decision can lead to explicit Portfolio creation.

This is current behavior.

---

## 117. Desktop-Only Milestone

Current scope decision.

Not a permanent product limitation.

---

# PART XXIV — KNOWN PRODUCT GAPS

---

## 118. Lifecycle Taxonomy

Current lifecycle terminology is provisional.

Different project documents historically used slightly different lifecycle language.

A final configurable lifecycle has not been approved.

---

## 119. Formal Role Model

The exact relationship between:

- Analyst,
- Associate,
- Principal,
- Partner,
- IC,
- Admin

remains future domain/product work.

---

## 120. Investment Committee Rules

Open questions include:

- quorum,
- voting,
- conditional approval,
- dissent,
- decision authority,
- re-review.

---

## 121. Post-Investment Decision Changes

The system currently preserves successive decisions but does not define the final business semantics of reversal/cancellation/exit.

---

## 122. Diligence Provenance

The current question-to-run linkage is not structurally immutable.

---

## 123. Materiality

The system does not yet have an approved universal model for:

- risk materiality,
- finding priority,
- diligence priority.

---

# PART XXV — CURRENT SECURITY BOUNDARY

---

## 124. What Is Real in the Current PoC

The following are functional implementation behaviors:

- generated workspace identity,
- hashed Access Phrase,
- hashed Recovery Key,
- device/session records,
- signed local cookies,
- session revocation,
- private workspace API identity checks,
- private document authorization,
- cross-workspace rejection,
- local persistent storage.

---

## 125. What Must Not Be Claimed

Do not describe the current PoC as:

- enterprise secure,
- formally audited,
- certified,
- production hardened,
- multi-tenant secure,
- compliant with specific security standards,
- equipped with mature RBAC.

Those claims are not supported by the current implementation.

---

# PART XXVI — CURRENT SYSTEM BOUNDARY

---

## 126. System Boundary Summary

Today KRAVV-IENT is:

> A functional private local investment workflow PoC with persistent case intelligence structure and simulated analysis.

It is not yet:

> A production multi-user AI investment platform.

That distinction must remain clear.

---

# PART XXVII — NEXT TECHNICAL EVOLUTION CANDIDATES

---

## 127. Candidate: Evidence Intelligence

Potential next work may include:

- extraction,
- claim normalization,
- provenance,
- deterministic metrics,
- contradiction assistance.

This is not yet implemented.

---

## 128. Candidate: Grounded Assistant

Potential direction:

**User Question**  
→ **Case Context Builder**  
→ **Relevant Evidence / Historical Run Retrieval**  
→ **LLM Provider Adapter**  
→ **Grounded Answer**  
→ **Source References**

The assistant should initially remain read-oriented.

---

## 129. Candidate: Provider Abstraction

Future AI integration should preferably avoid coupling core business logic directly to one provider.

Conceptually:

**KRAVV Intelligence Layer**  
→ **Provider Adapter**  
→ **Groq / OpenAI / other provider**

No provider is currently part of the current implementation baseline.

---

## 130. Candidate: Graceful AI Failure

Future AI failure should not break the core workspace.

If an intelligence provider is unavailable:

- case data remains accessible,
- evidence remains accessible,
- historical analysis remains accessible,
- decisions remain accessible.

---

# PART XXVIII — CURRENT SOURCE OF TRUTH

---

## 131. Current-State Authority Order

For questions about what is implemented today, prefer:

1. Current `main` source code
2. Current executable tests
3. Current root/application README
4. This Current Functional PoC & System State document
5. Latest completion/validation report
6. Older phase reports
7. Historical mockups / prototype notes

Older reports should not override later implementation.

---

## 132. Historical Reports

Existing reports such as:

- phase completion reports,
- core analysis workflow report,
- functional completion report,
- implementation status

remain useful historical evidence.

However, they describe different moments in project evolution.

A future maintainer should check the date, commit, and phase before treating a statement as current.

---

# PART XXIX — SAFE HANDOFF RULES

---

## 133. Before Modifying the Current PoC

A future developer or agent should:

1. inspect current `main`,
2. read the canonical product documents,
3. understand Company vs Investment Case,
4. understand Source vs Evidence,
5. understand Analysis Run snapshots,
6. understand Human Review separation,
7. understand Recommendation vs Decision,
8. preserve local data where relevant,
9. run existing tests,
10. avoid silently inventing business rules.

---

## 134. Do Not Delete Runtime State Casually

If preserving the current local workspace, do not casually delete:

- `.wrangler/state`
- `.sites-runtime`

These contain current local product state and access state.

---

## 135. Do Not Rebuild the Core Workflow for an AI Feature

Real AI should be added **on top of** the current workflow.

It should not replace:

- Investment Case,
- Evidence,
- Analysis Runs,
- Human Review,
- Recommendation,
- Final Decision.

---

# PART XXX — CURRENT CHECKPOINT SUMMARY

---

## 136. Implemented

Current PoC includes:

- Access Gate
- persistent local workspace
- Company
- Investment Case
- Case Context
- private source upload/download
- manual Structured Evidence
- evidence status
- Analysis Readiness
- simulated processing
- saved Analysis Runs
- evidence snapshots
- findings
- contradiction/unknown presentation
- suggested diligence
- persistent Diligence Questions
- Human Review
- Recommendation
- role-gated Final Decision
- Decision History
- Portfolio transition
- Monitoring Updates
- Activity History
- optimistic concurrency
- validation tests
- typecheck/build validation

---

## 137. Simulated

Currently simulated:

- intelligence reasoning,
- analysis findings,
- processing sequence,
- sample companies/data,
- self-selected role assignment.

---

## 138. Deferred

Currently deferred:

- real LLM,
- assistant/chatbot,
- automatic extraction,
- RAG,
- external research,
- deterministic finance subsystem,
- calibrated confidence,
- collaborative tenancy,
- real role administration,
- IC workflow,
- portfolio automation,
- institutional memory intelligence,
- production security.

---

## 139. Known Open Business Rules

Still open:

- lifecycle taxonomy,
- firm role taxonomy,
- IC rules,
- conditional decisions,
- post-investment state transitions,
- materiality,
- diligence priority,
- immutable diligence provenance,
- production tenancy,
- production identity model.

---

## 140. Current Completion Statement

The correct current statement is:

> **KRAVV-IENT has a functional end-to-end investment workflow PoC with persistent local access, case history, source/evidence separation, versioned simulated analysis, human review, recommendation, decision, portfolio, and monitoring. Its core intelligence remains simulated, and real AI, collaborative firm infrastructure, and production security have not yet been implemented.**

---

## 141. Final Current-State Principle

The current PoC is valuable because the product structure exists **before** the real intelligence layer.

That order should be preserved.

The project should now be able to add intelligence gradually without needing to reinvent what a case, evidence record, analysis run, human judgment, or investment decision means.

The baseline is therefore not:

> “AI analysis completed.”

The baseline is:

> **“The investment decision system exists. Intelligence can now be added to it deliberately.”**
