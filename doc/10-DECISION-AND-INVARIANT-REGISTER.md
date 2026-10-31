# KRAVV-IENT — Decision & Invariant Register

**Document ID:** 10  
**Document Type:** Canonical Decision & Invariant Register  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Durable product decisions, architectural invariants, prototype assumptions, supersession rules, and unresolved decision areas  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document records the decisions that should remain stable unless they are deliberately reconsidered.

It exists to prevent KRAVV-IENT from gradually losing its product identity through:

- refactors,
- redesigns,
- new AI experiments,
- developer assumptions,
- coding-agent shortcuts,
- changing model providers,
- or long project pauses.

The purpose is not to freeze the product forever.

The purpose is to make change explicit.

A future developer should be able to answer:

- Which product decisions are locked?
- Why were they made?
- Which decisions are strong direction but not yet implemented?
- Which current behaviors are merely prototype assumptions?
- Which questions are still unresolved?
- Which rules must not be broken accidentally?
- If a decision changes, what does it supersede?

The governing rule is:

> **Important product behavior should change by explicit decision, not accidental implementation drift.**

---

# PART I — REGISTER LANGUAGE

---

## 2. Decision Statuses

Every registered decision should use one of the following statuses.

### LOCKED

A durable product decision.

It may still be revisited intentionally, but should not be changed casually.

### STRONG DIRECTION

A clear product direction that is not yet fully implemented or domain-validated.

### CURRENT IMPLEMENTATION

Describes a real current behavior that may not be a permanent product rule.

### PROTOTYPE ASSUMPTION

A simplification used to make the PoC functional.

It must not silently become a production requirement.

### OPEN DECISION

A business or architecture question that remains unresolved.

### SUPERSEDED

A previous decision that has been replaced by a newer explicit decision.

The historical record should remain.

---

## 3. Decision Categories

This register groups decisions into:

- Product Identity
- Domain Model
- Evidence & Analysis
- Human Judgment
- Intelligence / AI
- Experience / Design
- Security / Trust
- Persistence / History
- Roadmap / Development

---

## 4. Invariant Definition

An **Invariant** is stronger than a normal feature choice.

It represents a relationship or behavior that future work should preserve unless the product model itself is deliberately redesigned.

Examples:

> Source ≠ Evidence

> Recommendation ≠ Final Decision

> New evidence does not rewrite old Analysis Runs

Invariants should be used as regression criteria.

---

# PART II — PRODUCT IDENTITY DECISIONS

---

## DEC-001 — KRAVV-IENT Is a Decision Intelligence Workspace

**Status:** LOCKED  
**Category:** Product Identity

### Decision

KRAVV-IENT is defined as a private AI-assisted investment intelligence workspace.

It is not defined primarily as:

- a pitch-deck analyzer,
- a chatbot,
- a CRM,
- a memo generator,
- a scoring engine,
- an autonomous investment agent.

### Rationale

The product's differentiated value is preserving the chain from evidence to judgment and later learning.

### Consequence

Future features should strengthen the Investment Case workflow rather than replace it with isolated AI interactions.

---

## DEC-002 — Investment Case Is the Primary Decision Object

**Status:** LOCKED  
**Category:** Domain Model

### Decision

The Investment Case is the central object around which investment reasoning is organized.

### Rationale

A company can be evaluated multiple times under different decision contexts.

### Consequence

Analysis, diligence, review, recommendation, decision, and historical evidence should remain case-aware.

---

## DEC-003 — Company and Investment Case Remain Separate

**Status:** LOCKED  
**Category:** Domain Model

### Decision

A Company represents long-lived business identity.

An Investment Case represents one decision context.

### Rationale

Historical evaluations must not be collapsed into one mutable company analysis.

### Consequence

One Company may have many Investment Cases.

---

## DEC-004 — Memo Is an Output, Not the Core Workflow

**Status:** LOCKED  
**Category:** Product Identity

### Decision

Investment memo generation may exist, but the memo is derived from the case system.

It should not become the primary source of truth.

### Rationale

A memo flattens evidence, uncertainty, disagreement, and history into prose.

### Consequence

The structured case must survive independently of any generated memo.

---

# PART III — EVIDENCE DECISIONS

---

## DEC-005 — Source and Evidence Are Separate Objects

**Status:** LOCKED  
**Category:** Evidence

### Decision

Source Documents and Structured Evidence remain conceptually distinct.

### Rationale

A document's existence does not mean its contents were extracted, understood, or verified.

### Consequence

Uploading a document must not automatically imply that its claims became canonical evidence.

---

## DEC-006 — Evidence Must Preserve Provenance

**Status:** LOCKED  
**Category:** Evidence

### Decision

Important evidence should retain enough provenance to trace it back to a source.

### Rationale

Traceability is required for trustworthy analysis.

### Consequence

Future extraction should preserve source document, locator, excerpt, or equivalent trace information.

---

## DEC-007 — Uncertainty Is a Valid State

**Status:** LOCKED  
**Category:** Evidence

### Decision

The product must support unknown and conflicting information.

### Rationale

Investment decisions are made under uncertainty.

### Consequence

The product should not force completeness by inventing values or silently resolving conflicts.

---

## DEC-008 — Current Evidence Statuses Are Human-Assigned

**Status:** CURRENT IMPLEMENTATION  
**Category:** Evidence

### Decision

Current statuses include:

- Reported
- Supported
- Verified
- Conflicting
- Unknown

and are assigned manually by the user.

### Rationale

The PoC does not yet contain an independent verification engine.

### Consequence

The current `Verified` label must not be presented as machine-verified truth.

---

## DEC-009 — Contradictions Should Be Preserved

**Status:** LOCKED  
**Category:** Evidence

### Decision

Conflicting values or claims remain visible until resolved.

### Rationale

Conflict is meaningful information.

### Consequence

The system should not silently choose one conflicting source merely to simplify the UI.

---

# PART IV — ANALYSIS DECISIONS

---

## DEC-010 — Analysis Run Is a Historical Snapshot

**Status:** LOCKED  
**Category:** Analysis

### Decision

Each Analysis Run represents a point-in-time interpretation of the evidence available at that moment.

### Rationale

Historical decision reasoning must remain reconstructable.

### Consequence

New evidence should lead to a new run rather than rewriting an old run.

---

## DEC-011 — Evidence Snapshots Are Preserved Per Analysis Run

**Status:** LOCKED  
**Category:** Analysis

### Decision

An Analysis Run stores or references the evidence state used by that run.

### Rationale

A historical finding is meaningful only if the evidence basis remains known.

### Consequence

Current evidence and historical evidence snapshot must remain distinguishable.

---

## DEC-012 — No Universal Investment Score

**Status:** LOCKED  
**Category:** Analysis

### Decision

KRAVV-IENT should not reduce the full investment case to one universal score.

### Rationale

One number hides trade-offs, uncertainty, contradictions, and judgment.

### Consequence

Structured reasoning should remain primary.

Preferred outputs include:

- Why This Could Win
- Why This Could Fail
- Contradictions
- Critical Unknowns
- Diligence Priorities

---

## DEC-013 — Deterministic Calculations Should Be Deterministic

**Status:** LOCKED  
**Category:** Analysis / AI

### Decision

Where a metric can be calculated reliably with code, prefer deterministic logic over probabilistic model reasoning.

### Rationale

Calculations should be reproducible and testable.

### Consequence

LLMs may explain metrics, but should not become the primary calculator for stable arithmetic.

---

## DEC-014 — Current Analysis Is Explicitly Simulated

**Status:** CURRENT IMPLEMENTATION  
**Category:** Analysis

### Decision

The current `rules-v1` analysis remains deterministic simulation.

### Rationale

The current milestone validates product workflow before real AI.

### Consequence

The UI must not imply live LLM inference where none exists.

---

# PART V — HUMAN JUDGMENT DECISIONS

---

## DEC-015 — System Assessment and Human Review Are Separate

**Status:** LOCKED  
**Category:** Human Judgment

### Decision

Human Review must not overwrite the original system assessment.

### Rationale

Disagreement is valuable historical information.

### Consequence

Agree, Disagree, Add Context, or Override should be stored as additive human judgment.

---

## DEC-016 — Recommendation and Final Decision Are Separate

**Status:** LOCKED  
**Category:** Human Judgment

### Decision

Analyst Recommendation is not the same object as Final Decision.

### Rationale

Different organizational roles may make different judgments.

### Consequence

Both should remain historically visible.

---

## DEC-017 — Final Decision Requires Human Authority

**Status:** LOCKED  
**Category:** Human Judgment / Governance

### Decision

The product should not allow an AI system to silently become the final investment authority.

### Rationale

Investment decisions require human accountability.

### Consequence

Future intelligence may advise, but final decision authority remains human unless this product principle is explicitly reconsidered.

---

## DEC-018 — Decision Rationale Is Material

**Status:** LOCKED  
**Category:** Human Judgment

### Decision

Final decisions should retain rationale.

### Rationale

A decision without reasoning has low future learning value.

### Consequence

Current PoC requires rationale for final decision actions.

---

## DEC-019 — Successive Decisions Are Preserved

**Status:** LOCKED  
**Category:** Human Judgment / History

### Decision

A later decision should not silently delete an earlier decision.

### Rationale

Historical sequence matters.

### Consequence

Decision history remains append-oriented.

---

# PART VI — DILIGENCE DECISIONS

---

## DEC-020 — Diligence Question Is a Persistent Object

**Status:** LOCKED  
**Category:** Diligence

### Decision

A meaningful unresolved question should become a persistent workflow object rather than remain only in chat or analysis prose.

### Rationale

Uncertainty often requires follow-up work.

### Consequence

Diligence Questions may have owner, status, trigger, response, and resolution.

---

## DEC-021 — AI Diligence Suggestion Does Not Auto-Persist

**Status:** LOCKED  
**Category:** Diligence / AI

### Decision

Generated diligence suggestions require explicit user save.

### Rationale

AI suggestion and accepted workflow commitment are different states.

### Consequence

Future assistant write-actions should follow similar confirmation patterns for material changes.

---

# PART VII — AI & INTELLIGENCE DECISIONS

---

## DEC-022 — AI Operates Inside the Product Architecture

**Status:** LOCKED  
**Category:** AI

### Decision

AI should consume and enrich existing KRAVV-IENT objects.

It should not bypass the product model with a standalone chat architecture.

### Rationale

The product structure creates traceability and historical continuity.

### Consequence

Future LLM work should use:

- case context,
- evidence,
- runs,
- diligence,
- historical objects.

---

## DEC-023 — AI Assists; Humans Decide

**Status:** LOCKED  
**Category:** AI

### Decision

AI is decision support, not autonomous decision authority.

### Consequence

AI may:

- explain,
- challenge,
- compare,
- suggest,
- summarize,
- analyze.

AI should not silently:

- record final decisions,
- rewrite evidence,
- delete historical judgments,
- promote itself into decision authority.

---

## DEC-024 — First Real AI Milestone Should Be Grounded and Read-Oriented

**Status:** STRONG DIRECTION  
**Category:** AI / Roadmap

### Decision

The preferred first live-LLM experiment is a grounded Investment Case assistant.

### Rationale

This tests real intelligence without requiring a full extraction/research platform.

### Expected boundary

The assistant should initially:

- retrieve,
- explain,
- compare,
- challenge,
- suggest.

It should not automatically mutate persistent case state.

---

## DEC-025 — AI Provider Is Not Product Identity

**Status:** LOCKED  
**Category:** AI Architecture

### Decision

KRAVV-IENT should not be structurally tied to one LLM provider.

### Rationale

Providers, costs, models, and policies change.

### Consequence

Provider abstraction is preferred.

---

## DEC-026 — RAG Is a Capability, Not a Requirement

**Status:** LOCKED  
**Category:** AI Architecture

### Decision

Do not introduce vector retrieval merely because it is common in AI products.

### Rationale

Current structured objects may solve many retrieval needs directly.

### Consequence

Introduce embeddings/vector retrieval only when an actual retrieval problem justifies it.

---

## DEC-027 — Extraction Produces Candidate State First

**Status:** STRONG DIRECTION  
**Category:** AI / Evidence

### Decision

Future automated extraction should propose evidence rather than silently promote extracted text into trusted fact.

### Rationale

Extraction errors and ambiguous claims are inevitable.

### Consequence

A future pipeline should preserve source and review state.

---

## DEC-028 — Challenge Is a Native Intelligence Function

**Status:** LOCKED  
**Category:** AI / Analysis

### Decision

KRAVV-IENT should not only synthesize or confirm the current thesis.

It should be capable of challenging it.

### Rationale

Investment analysis benefits from counterarguments and alternative interpretations.

### Consequence

Future intelligence should include challenge/counter-analysis as a first-class capability.

---

## DEC-029 — Graceful Degradation Is Required

**Status:** LOCKED  
**Category:** AI Architecture

### Decision

Core workspace functions should remain usable when AI is unavailable.

### Rationale

The product must not collapse because a provider hits a rate limit or outage.

### Consequence

Case, evidence, history, decision, and sources remain accessible independently of live model availability.

---

# PART VIII — EXPERIENCE & DESIGN DECISIONS

---

## DEC-030 — Dark Is the Environment; Blue Is the Identity

**Status:** LOCKED  
**Category:** Experience

### Decision

KRAVV-IENT uses a dark graphite/near-black environment with restrained blue as identity and system signal.

### Rationale

The desired product character is private, calm, controlled, and precise.

---

## DEC-031 — Product Should Feel Like a Workstation

**Status:** LOCKED  
**Category:** Experience

### Decision

The target experience is a private intelligence workstation.

### Not

- consumer chatbot,
- generic admin dashboard,
- cyberpunk terminal,
- social app.

---

## DEC-032 — Bottom Rail Is Current Global Navigation Direction

**Status:** CURRENT IMPLEMENTATION / STRONG DIRECTION  
**Category:** Experience

### Decision

Current global navigation uses a bottom rail with a contextual top bar and case-local horizontal tabs.

### Rationale

This supports a distinct workstation identity and keeps case content dominant.

### Consequence

Do not replace it casually with a generic permanent left sidebar.

---

## DEC-033 — Progressive Disclosure Over Visual Overload

**Status:** LOCKED  
**Category:** Experience

### Decision

Complexity should be available on demand.

### Rationale

Investment work is inherently dense.

### Consequence

Use expandable detail, contextual inspectors, and focused surfaces.

---

## DEC-034 — Every Visible System Element Must Mean Something

**Status:** LOCKED  
**Category:** Experience

### Decision

Visible technical/system UI should correspond to real state, metadata, navigation, or action.

### Consequence

Avoid:

- fake telemetry,
- decorative logs,
- fake clearance levels,
- meaningless charts,
- fake model statistics.

---

## DEC-035 — Desktop-First Is Current Scope

**Status:** CURRENT IMPLEMENTATION  
**Category:** Experience

### Decision

Current PoC is desktop-first.

### Rationale

Core evidence and analysis workflows benefit from a wide workspace.

### Consequence

Mobile should not be forced prematurely.

---

# PART IX — SECURITY & TRUST DECISIONS

---

## DEC-036 — Access Gate Is a PoC Trust Boundary, Not Production Security

**Status:** LOCKED CURRENT POSITIONING  
**Category:** Security

### Decision

KRAVV Access Gate is a functional local trust model.

It must not be presented as enterprise production security.

---

## DEC-037 — Security Claims Must Match Implementation

**Status:** LOCKED  
**Category:** Security

### Decision

The product must not use security language stronger than the actual controls.

### Consequence

No unsupported claims such as:

- enterprise secure,
- zero trust,
- certified encryption,
- compliance ready.

---

## DEC-038 — Confidential Documents Should Not Be Public by Default

**Status:** LOCKED  
**Category:** Security

### Decision

Source documents should use authenticated/private retrieval rather than public permanent URLs by default.

### Rationale

Investment material may be confidential.

---

## DEC-039 — Authorization Must Be Server-Enforced

**Status:** LOCKED  
**Category:** Security

### Decision

Material permissions should not rely only on hidden UI.

### Consequence

Decision authority, document access, tenant isolation, and similar boundaries should be validated server-side.

---

## DEC-040 — Current Roles Are Demo Roles

**Status:** PROTOTYPE ASSUMPTION  
**Category:** Security / Governance

### Decision

Analyst, Partner, and Admin role switching currently exists to demonstrate permission behavior.

### Consequence

Self-selectable role assignment must not be interpreted as production role administration.

---

# PART X — PERSISTENCE & HISTORY DECISIONS

---

## DEC-041 — Historical Judgment Should Be Append-Oriented

**Status:** LOCKED  
**Category:** Persistence / History

### Decision

Historical Analysis Runs, Human Reviews, Recommendations, and Decisions should be appended or superseded rather than silently rewritten.

---

## DEC-042 — Current Workspace Aggregate Storage Is a PoC Choice

**Status:** CURRENT IMPLEMENTATION  
**Category:** Persistence

### Decision

Current local persistence uses a versioned workspace aggregate.

### Consequence

This storage shape must not be treated as the permanent production domain schema.

---

## DEC-043 — Existing Local Data Should Be Preserved During Refactors

**Status:** LOCKED DEVELOPMENT RULE  
**Category:** Persistence

### Decision

Refactors should not casually destroy local cases, source files, history, or access state.

### Rationale

The product itself values historical continuity.

---

## DEC-044 — Optimistic Revision Protection Is Meaningful

**Status:** CURRENT IMPLEMENTATION / STRONG DIRECTION  
**Category:** Persistence

### Decision

Current stale-write protection should be preserved or replaced with an equally safe future concurrency model.

---

# PART XI — ROADMAP & DEVELOPMENT DECISIONS

---

## DEC-045 — Roadmap Is Maturity-Driven

**Status:** LOCKED PROJECT PHILOSOPHY  
**Category:** Roadmap

### Decision

KRAVV-IENT should evolve by product maturity, not artificial calendar deadlines.

---

## DEC-046 — Learn Before Automating

**Status:** LOCKED DEVELOPMENT PRINCIPLE  
**Category:** Roadmap

### Decision

Do not automate a workflow that is not understood.

### Consequence

Manual or semi-manual workflow may intentionally precede automation.

---

## DEC-047 — Unknown Business Rule Must Not Be Invented Silently

**Status:** LOCKED DEVELOPMENT RULE  
**Category:** Governance

### Decision

If a domain rule is unknown:

- mark it Open,
- label it Prototype Assumption,
- or request a product decision.

Do not silently hard-code it as canonical behavior.

---

## DEC-048 — Prototype Assumptions Must Remain Labeled

**Status:** LOCKED DEVELOPMENT RULE  
**Category:** Governance

### Decision

A PoC shortcut does not automatically become a production requirement.

---

## DEC-049 — Tests Should Protect Product Invariants

**Status:** LOCKED DEVELOPMENT RULE  
**Category:** Quality

### Decision

Regression tests should protect important product behavior, not only code execution.

Examples:

- historical run preservation,
- role gate,
- workspace isolation,
- source authorization,
- decision/recommendation separation.

---

# PART XII — CURRENT PROTOTYPE ASSUMPTION REGISTER

---

## PA-001 — One Local Workspace Owner

**Status:** PROTOTYPE ASSUMPTION

Current local Access Gate maps one generated workspace identity to one local owner.

Not a final firm-tenancy model.

---

## PA-002 — Self-Selectable Roles

**Status:** PROTOTYPE ASSUMPTION

The owner can switch role for demonstration.

Not production authorization administration.

---

## PA-003 — New Cases Start `Sourced`

**Status:** PROTOTYPE ASSUMPTION

Current default lifecycle entry state.

Final lifecycle taxonomy remains open.

---

## PA-004 — Manual Evidence Status

**Status:** PROTOTYPE ASSUMPTION / CURRENT IMPLEMENTATION

Human recorder assigns evidence status.

Future system behavior may assist this.

---

## PA-005 — Explicit Portfolio Entry

**Status:** CURRENT IMPLEMENTATION / PROVISIONAL BUSINESS RULE

Invested decision and Portfolio Record remain separate.

The explicit transition is currently intentional.

Final post-decision lifecycle rules remain open.

---

## PA-006 — Desktop-Only Validated Scope

**Status:** CURRENT IMPLEMENTATION

Mobile UX is not currently part of milestone validation.

---

## PA-007 — 20 MB Upload Limit

**Status:** PROTOTYPE ASSUMPTION

Current implementation limit.

Not long-term product policy.

---

## PA-008 — 12-Hour Session / 180-Day Device

**Status:** PROTOTYPE ASSUMPTION

Current local Access Gate policy values.

Not production identity policy.

---

# PART XIII — OPEN DECISION REGISTER

---

## OD-001 — Final Investment Lifecycle Taxonomy

**Status:** OPEN DECISION

Questions:

- What are the canonical stages?
- Which stages should be configurable?
- Are Invested / Passed statuses or decision outcomes?
- How should re-evaluation work?

---

## OD-002 — Formal Role Taxonomy

**Status:** OPEN DECISION

Questions:

- Analyst?
- Associate?
- Principal?
- Partner?
- IC Member?
- Admin?
- External Reviewer?

---

## OD-003 — Investment Committee Governance

**Status:** OPEN DECISION

Questions:

- quorum,
- voting,
- approval,
- conditional approval,
- dissent,
- re-review,
- authority.

---

## OD-004 — Post-Investment Decision Semantics

**Status:** OPEN DECISION

Current edge case:

- Invested decision,
- Portfolio Record,
- later Pass decision,
- portfolio remains.

The product has not approved what this should mean operationally.

---

## OD-005 — Diligence-to-Run Provenance

**Status:** OPEN DECISION

Question:

Should Diligence Question hold immutable structural references to:

- Analysis Run,
- Finding,
- Evidence,
- Source?

---

## OD-006 — Evidence Verification Semantics

**Status:** OPEN DECISION

Questions:

- What exactly qualifies as Verified?
- Who can assign it?
- Can external corroboration qualify?
- Can AI suggest verification state?

---

## OD-007 — Materiality Model

**Status:** OPEN DECISION

Questions:

- How are findings prioritized?
- How is diligence urgency determined?
- Should risk materiality be configurable?

---

## OD-008 — Production Tenancy

**Status:** OPEN DECISION

Questions:

- firm-first or user-first?
- multiple workspaces per user?
- case-restricted teams?
- external collaborators?

---

## OD-009 — Production Authentication

**Status:** OPEN DECISION

Candidates:

- SSO,
- passkeys,
- MFA,
- enterprise IdP,
- combination.

---

## OD-010 — Real LLM Provider Strategy

**Status:** OPEN DECISION

Questions:

- which provider first,
- fallback,
- routing,
- cost controls,
- privacy.

Provider selection should not alter product identity.

---

## OD-011 — Retrieval Architecture

**Status:** OPEN DECISION

Questions:

- structured retrieval only?
- embeddings?
- hybrid search?
- document chunking?
- cross-case search?

---

## OD-012 — External Research Boundary

**Status:** OPEN DECISION

Questions:

- which sources,
- source ranking,
- freshness,
- persistence,
- authority,
- licensing.

---

## OD-013 — Assistant Write Authority

**Status:** OPEN DECISION

Questions:

- which objects may AI draft?
- which actions require confirmation?
- which actions should remain permanently human-only?

---

## OD-014 — Thesis Object

**Status:** OPEN DECISION

Question:

Should thesis become a dedicated structured object with:

- pillars,
- assumptions,
- risks,
- expected outcomes,
- evidence links?

---

## OD-015 — Company-Level vs Case-Level Intelligence

**Status:** OPEN DECISION

Questions:

- which facts belong to Company?
- which remain case-specific?
- how are historical company facts versioned?
- what may be reused across cases?

---

# PART XIV — ARCHITECTURAL INVARIANTS

---

## INV-001 — Company ≠ Investment Case

A long-lived company identity must not be collapsed into one mutable investment decision record.

---

## INV-002 — Source ≠ Evidence

A file is not equivalent to a validated or recorded fact.

---

## INV-003 — Evidence ≠ Analysis

Evidence describes recorded information.

Analysis interprets that information.

---

## INV-004 — Analysis ≠ Human Judgment

System output and human response remain separate.

---

## INV-005 — Human Review ≠ Recommendation

Agreeing or disagreeing with a finding does not automatically define the recommended investment action.

---

## INV-006 — Recommendation ≠ Final Decision

Analyst judgment and decision authority remain separate.

---

## INV-007 — Final Decision ≠ Portfolio Record

Decision outcome and operational portfolio state remain distinct objects.

---

## INV-008 — Current Evidence ≠ Historical Evidence Snapshot

Current case state may evolve.

Historical analysis basis must remain recoverable.

---

## INV-009 — New Evidence Does Not Rewrite Old Analysis

New information may trigger a new run.

Old runs remain historical.

---

## INV-010 — AI Suggestion ≠ Persistent Action

Generated output must not silently mutate meaningful product state.

---

## INV-011 — Conflict ≠ Resolved Truth

Contradictory evidence remains contradictory until resolution exists.

---

## INV-012 — Model Output ≠ Verified Fact

A model may interpret or extract.

That alone does not establish verification.

---

## INV-013 — Provider ≠ Product Identity

Changing LLM provider must not redefine KRAVV-IENT.

---

## INV-014 — Authentication ≠ Authorization

Being signed in does not imply permission to perform every action.

---

## INV-015 — Hidden UI ≠ Security

Client-side visibility is not a sufficient authorization mechanism.

---

## INV-016 — Activity Feed ≠ Security Audit Log

User-facing history and governance-grade audit may overlap but are not the same concept.

---

## INV-017 — Current State ≠ Historical State

The interface must not flatten all history into only the latest record.

---

## INV-018 — Simulation ≠ Real Intelligence

Simulated PoC behavior must remain labeled until live intelligence exists.

---

## INV-019 — Prototype Assumption ≠ Product Law

A temporary shortcut cannot become canonical merely because code already implements it.

---

## INV-020 — Product Complexity Must Represent Real Meaning

No fake telemetry, fake security, fake analysis depth, or decorative system behavior.

---

# PART XV — INVARIANTS FOR FUTURE AI

---

## INV-AI-001 — Grounding Before Confidence

The assistant should retrieve relevant case evidence before producing high-confidence factual statements.

---

## INV-AI-002 — Insufficient Evidence Must Remain Sayable

The system must be allowed to answer:

> insufficient evidence.

---

## INV-AI-003 — Deterministic Logic Wins for Deterministic Problems

Use code for reproducible calculations where possible.

---

## INV-AI-004 — Human Decision Authority Survives Model Improvement

Better models do not automatically inherit final investment authority.

---

## INV-AI-005 — Historical Model Output Survives Model Upgrade

A new model should not rewrite old Analysis Runs.

---

## INV-AI-006 — Provider Failure Must Not Corrupt Case State

Rate limits, malformed responses, or outages should fail safely.

---

## INV-AI-007 — External Research Must Preserve Provenance

External information should remain source-aware.

---

# PART XVI — INVARIANTS FOR EXPERIENCE

---

## INV-UX-001 — Blue Remains Meaningful

Do not overuse the identity accent until it becomes background decoration.

---

## INV-UX-002 — System UI Must Represent Real State

No decorative telemetry.

---

## INV-UX-003 — Historical and Current State Must Be Distinguishable

Users should be able to understand when they are viewing an older run or decision.

---

## INV-UX-004 — Complexity Should Be Progressively Disclosed

High information density is acceptable.

Uncontrolled information dumping is not.

---

## INV-UX-005 — AI Must Not Visually Imply Greater Authority Than Humans

The interface should not present model output as the final institutional voice.

---

# PART XVII — INVARIANTS FOR SECURITY

---

## INV-SEC-001 — Security Claims Match Actual Controls

Never market stronger security than exists.

---

## INV-SEC-002 — Confidential Documents Are Private by Default

Source files should not become public assets accidentally.

---

## INV-SEC-003 — Material Permission Checks Are Server-Side

Role gates and resource access must not rely only on client logic.

---

## INV-SEC-004 — Secrets Must Not Be Committed

Credentials and API secrets remain outside Git.

---

## INV-SEC-005 — AI Data Egress Must Be Deliberate

Sending case information to an external provider is a real privacy boundary.

---

# PART XVIII — SUPERSESSION RULES

---

## 100. Decisions Must Be Superseded, Not Erased

If a future decision replaces an existing locked decision:

1. keep the old record,
2. mark it `SUPERSEDED`,
3. add the new decision,
4. explain why,
5. identify affected documents and invariants,
6. update implementation intentionally.

---

## 101. Example Supersession

Old:

> DEC-024 — First real AI milestone should be read-only.

Later evidence may show users need safe write-actions immediately.

Correct update:

> DEC-024 status changed to SUPERSEDED.

Add:

> DEC-050 — Grounded Assistant May Create Confirmed Draft Actions.

Record:

- reason,
- evidence,
- confirmation boundary,
- affected tests.

Do not silently reinterpret DEC-024.

---

# PART XIX — DECISION CHANGE TEMPLATE

---

## 102. Template

When recording a new major decision:

```markdown
## DEC-XXX — Decision Name

**Status:** LOCKED | STRONG DIRECTION | CURRENT IMPLEMENTATION | PROTOTYPE ASSUMPTION | OPEN DECISION  
**Category:** ...

### Decision

...

### Context

...

### Rationale

...

### Consequences

...

### Alternatives Rejected

...

### Supersedes

DEC-XXX, if applicable

### Validation / Evidence

...
```

---

# PART XX — DECISION REVIEW CHECKLIST

---

## 103. Before Changing a Locked Decision

Ask:

- What problem does the current decision create?
- Is the problem product-level or implementation-level?
- Is there evidence?
- Could the issue be solved without breaking the invariant?
- What history or data becomes affected?
- What tests must change?
- What documentation must change?
- Does this create a new prototype assumption?

---

## 104. Before Creating a New Business Rule

Ask:

- Is this rule actually known?
- Is it firm-specific?
- Should it be configurable?
- Is it merely convenient for implementation?
- Does domain research support it?

If uncertain:

> mark it Open or Prototype Assumption.

---

# PART XXI — CURRENT DECISION PRIORITY

---

## 105. Decisions That Should Be Revisited Soonest

The current highest-value unresolved decisions are likely:

1. first real LLM integration boundary,
2. evidence retrieval architecture,
3. extraction candidate workflow,
4. immutable diligence provenance,
5. lifecycle semantics,
6. verification semantics.

These are not deadlines.

They are the decisions most likely to matter as KRAVV-IENT moves beyond the current PoC.

---

# PART XXII — DECISIONS THAT SHOULD NOT BE REOPENED CASUALLY

---

## 106. High-Stability Decisions

The following should be treated as especially stable:

- Investment Case as core object,
- Company/Case separation,
- Source/Evidence separation,
- historical Analysis Runs,
- Human Review separate from system assessment,
- Recommendation separate from Final Decision,
- no universal investment score,
- preserve contradictions,
- AI assists humans,
- provider independence,
- security honesty,
- maturity-driven evolution.

Changing these would alter the product thesis itself.

---

# PART XXIII — HANDOFF INSTRUCTIONS

---

## 107. For a Future Developer or Coding Agent

Before implementing significant changes:

1. read this register,
2. identify which decisions are affected,
3. identify which invariants are affected,
4. check whether the required business rule is Open,
5. do not invent a silent resolution,
6. preserve historical state,
7. update tests,
8. record any deliberate supersession.

---

## 108. For Future Product Work

When a prototype assumption becomes validated:

- create or update a DEC entry,
- change its status,
- explain why,
- update relevant canonical documents.

Example:

`PA-003 — New Cases Start Sourced`

should not become permanent merely because it has existed for months.

It should become locked only after deliberate domain/product confirmation.

---

# PART XXIV — QUICK REFERENCE

---

## 109. Core Object Boundaries

**Company**  
≠  
**Investment Case**

**Source**  
≠  
**Evidence**

**Evidence**  
≠  
**Analysis**

**Analysis**  
≠  
**Human Review**

**Human Review**  
≠  
**Recommendation**

**Recommendation**  
≠  
**Final Decision**

**Final Decision**  
≠  
**Portfolio Record**

---

## 110. Core Historical Boundaries

**New Evidence**  
≠  
**Rewrite Old Run**

**New Model**  
≠  
**Rewrite Old Analysis**

**Human Disagreement**  
≠  
**Delete AI Assessment**

**Later Decision**  
≠  
**Erase Earlier Decision**

---

## 111. Core AI Boundaries

**AI Extraction**  
≠  
**Verified Fact**

**AI Suggestion**  
≠  
**Persistent Action**

**AI Assessment**  
≠  
**Investment Decision**

**LLM Provider**  
≠  
**KRAVV-IENT**

---

## 112. Core Trust Boundaries

**Signed In**  
≠  
**Authorized for Everything**

**Hidden Button**  
≠  
**Permission Control**

**Private UI**  
≠  
**Production Security**

**Security Label**  
≠  
**Security Control**

---

# PART XXV — FINAL REGISTER PRINCIPLE

---

## 113. Final Principle

KRAVV-IENT should be able to evolve aggressively without becoming conceptually unstable.

That requires distinguishing:

- what is temporary,
- what is current,
- what is directional,
- what is locked,
- and what remains unknown.

The purpose of this register is therefore simple:

> **Future KRAVV-IENT should be allowed to change, but it should always know what it is changing from and why.**

A mature project is not one where decisions never change.

It is one where major decisions do not disappear into implementation history.
