# KRAVV-IENT — Product & Object Architecture

**Document ID:** 04  
**Document Type:** Canonical Product & Object Architecture  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Product objects, information architecture, relationships, state boundaries, and current PoC implementation model  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document defines the core product objects that make KRAVV-IENT coherent as a system.

It answers:

- What are the main persistent objects?
- What does each object mean?
- Which information belongs where?
- How do objects relate to one another?
- Which objects represent evidence, reasoning, judgment, and decision?
- Which parts are implemented today?
- Which parts are still conceptual or provisional?
- Which relationships must remain historically stable?

This is a product architecture document.

It is intentionally different from:

- the Product Vision,
- Product Principles,
- Domain & Investment Workflow,
- and low-level software implementation documentation.

The purpose is to preserve the **meaning of the system**, even if the code structure changes.

---

# PART I — ARCHITECTURAL THESIS

---

## 2. Core Architectural Thesis

KRAVV-IENT should not be modeled as:

> Upload document → Ask AI → Receive answer

The product model is:

> **Company → Investment Case → Sources → Evidence → Analysis → Challenge → Human Judgment → Recommendation → Decision → Portfolio / Monitoring**

The architecture therefore centers on a persistent decision record rather than a single model response.

The goal is to preserve the path from raw information to final judgment.

---

## 3. Primary Architectural Rule

> **The Investment Case is the central decision object.**

Almost every meaningful product object should either:

- belong to an Investment Case,
- describe an Investment Case,
- reference an Investment Case,
- or preserve the history of an Investment Case.

Company exists above the case.

Portfolio continues after the case.

But the case is where the investment reasoning lives.

---

## 4. Product Object Families

The current product model can be understood through six object families.

### 4.1 Identity & Workspace

- Workspace
- Operator / User Identity
- Role
- Device Session

### 4.2 Company & Deal Context

- Company
- Investment Case
- Case Context
- Case Activity

### 4.3 Evidence Layer

- Source Document
- Structured Evidence
- Evidence Status
- Derived Metric
- Evidence Snapshot

### 4.4 Intelligence Layer

- Analysis Run
- Finding
- Executive Synthesis
- Contradiction
- Critical Unknown
- Suggested Diligence

### 4.5 Human Decision Layer

- Diligence Question
- Human Review
- Analyst Recommendation
- Final Decision

### 4.6 Post-Investment Layer

- Portfolio Record
- Monitoring Update
- Historical Thesis

These families should remain conceptually distinct even if some are stored together in the current PoC.

---

# PART II — IDENTITY & WORKSPACE OBJECTS

---

## 5. Workspace

### Definition

A Workspace is the top-level private environment in which investment information is stored.

### Current meaning

In the local PoC, one generated Workspace ID maps to one local owner/workspace.

### Current responsibilities

The Workspace owns:

- companies,
- cases,
- documents,
- analysis history,
- diligence,
- reviews,
- recommendations,
- decisions,
- portfolio records,
- activity history.

### Current implementation boundary

The PoC currently stores workspace state as a JSON document in local persistence with revision tracking.

This is suitable for the current PoC.

It is not the long-term normalized enterprise data model.

### Future direction

A mature Workspace may become:

- organization-aware,
- firm-scoped,
- multi-user,
- role-aware,
- policy-aware,
- tenant-isolated.

### Status

**Current object. Future semantics will expand.**

---

## 6. Operator / User Identity

### Definition

Represents the human actor currently using the workspace.

### Current PoC

Local Access Gate creates a private workspace identity using:

- display/operator name,
- Workspace ID,
- Access Phrase,
- Recovery Key,
- local registered device/session.

### Product meaning

Identity answers:

> Who is interacting with this workspace?

### Important limitation

The current Access Gate is a local PoC access model.

It is not a production enterprise identity system.

### Future direction

Potential future identity sources:

- verified account,
- organization membership,
- SSO,
- passkey,
- MFA,
- enterprise identity provider.

### Status

**Implemented locally. Production model unresolved.**

---

## 7. Role

### Definition

Represents the authority context under which a user performs actions.

### Current PoC roles

- Analyst
- Partner
- Admin

### Current use

The PoC demonstrates server-side decision gates.

Analyst cannot record final decision.

Partner and Admin can.

### Important limitation

Roles are self-selectable in the PoC.

Therefore they demonstrate permission logic, not production role administration.

### Future role model

May include:

- Analyst
- Associate
- Principal
- Partner
- Investment Committee participant
- Administrator
- Read-only reviewer
- Specialist

### Status

**Prototype object. Final taxonomy unresolved.**

---

## 8. Device Session

### Definition

Represents authenticated local access from a registered device/browser.

### Current PoC

The Access Gate tracks:

- signed session,
- registered device,
- expiration,
- sign-out,
- recovery path.

### Product role

Device Session is an access-control implementation detail, not an investment-domain object.

### Status

**Implemented locally. Not canonical business-domain object.**

---

# PART III — COMPANY & INVESTMENT CASE

---

## 9. Company

### Definition

A Company is the long-lived identity of the business being evaluated.

### Company should represent

Potentially:

- company name,
- website,
- sector,
- geography,
- canonical identity,
- long-term relationship,
- linked Investment Cases.

### Company should not represent

The entire investment decision history as one mutable blob.

### Key rule

> **One Company can have multiple Investment Cases.**

### Example

A company may have:

- Seed evaluation — Passed
- Series A re-evaluation — Invested
- Series B follow-on — Under Review

All should remain separate cases linked to the same Company.

### Current PoC

Company and Investment Case are already separate.

### Status

**Locked object.**

---

## 10. Investment Case

### Definition

An Investment Case is a specific decision context in which the firm evaluates a potential or existing investment.

### The case answers

- What opportunity are we evaluating?
- Under what round/stage/context?
- What information do we have?
- What is our thesis?
- What analysis has been performed?
- What remains unknown?
- What do humans think?
- What was decided?
- What happened later?

### Typical case fields

May include:

- case name,
- linked Company,
- stage,
- owner,
- deal source,
- round,
- target check,
- valuation,
- thesis,
- status,
- timestamps.

### Key rule

> **An Investment Case is historical and contextual. It should not be silently merged with another case.**

### Current PoC

This is the primary functional decision object.

### Status

**Locked object.**

---

## 11. Case Context

### Definition

Case Context contains mutable contextual information used to understand the current deal.

### Examples

- current round,
- target check,
- valuation,
- deal source,
- strategy fit,
- thesis,
- stage,
- owner,
- notes,
- analysis context.

### Important distinction

Case Context is not the same as evidence.

Example:

> “Target check = $2M”

may be deal context.

> “ARR = $4.2M according to the deck”

is evidence.

### Current PoC

Context can be progressively enriched.

### Status

**Current object/field group.**

---

## 12. Case Activity

### Definition

Case Activity records important events over time.

### Potential events

- case created,
- source uploaded,
- evidence added,
- analysis run saved,
- diligence question created,
- review recorded,
- recommendation recorded,
- decision recorded,
- portfolio transition,
- monitoring update.

### Product purpose

Activity history helps reconstruct the evolution of the case.

### Current PoC

Append-like activity history exists.

### Future direction

May evolve into richer audit history.

### Status

**Implemented direction.**

---

# PART IV — SOURCE & EVIDENCE ARCHITECTURE

---

## 13. Source Document

### Definition

A Source Document is raw or reference material associated with an Investment Case.

### Examples

- pitch deck,
- financial model,
- meeting notes,
- customer report,
- cap table,
- technical document,
- legal document.

### Source answers

> Where did this information come from?

### Important rule

> **Uploading a Source Document does not mean the system has extracted, understood, verified, or endorsed its contents.**

### Current PoC

Documents are uploaded privately and can be referenced from evidence.

Automatic extraction is not implemented.

### Future direction

Source Documents may later support:

- extraction,
- chunking,
- search,
- citations,
- OCR where required,
- structured ingestion.

### Status

**Implemented object.**

---

## 14. Structured Evidence

### Definition

Structured Evidence is a recorded piece of relevant information extracted or entered from one or more sources.

### Evidence answers

> What information have we recorded as relevant to this case?

### Example

Source:

> Pitch Deck, page 14

Evidence:

> ARR = $4.2M

### Evidence may include

- category,
- value,
- text,
- excerpt,
- source reference,
- locator,
- evidence status,
- notes,
- timestamp.

### Key rule

> **Source and Evidence must remain distinct.**

### Current PoC

Evidence is entered manually.

### Future direction

AI may propose evidence candidates, but persistence should remain auditable.

### Status

**Locked object.**

---

## 15. Evidence Status

### Definition

Evidence Status represents the current state of confidence or support around an evidence record.

### Current PoC states

- Reported
- Supported
- Verified
- Conflicting
- Unknown

### Current behavior

Statuses are human-assigned.

### Important limitation

The system does not independently verify claims.

### Future direction

The system may later suggest status changes based on:

- source independence,
- corroboration,
- contradiction,
- external research.

But the basis must remain explainable.

### Status

**Current taxonomy; exact future semantics may evolve.**

---

## 16. Evidence Provenance

### Definition

Evidence Provenance describes where evidence came from and how it entered the system.

### Provenance should eventually answer

- source document,
- source location,
- original wording,
- extracted/entered by whom,
- created when,
- modified when,
- supporting sources,
- conflicting sources.

### Product importance

Provenance is necessary for trustworthy AI-assisted analysis.

### Current PoC

Source references and excerpts exist.

### Status

**Foundational direction.**

---

## 17. Derived Metric

### Definition

A Derived Metric is a deterministic value calculated from structured inputs.

### Examples

- revenue growth,
- burn multiple,
- runway,
- gross margin,
- customer concentration,
- ownership,
- dilution.

### Key rule

> **Derived Metrics should be calculated deterministically where possible.**

### Why separate from Evidence

Evidence may contain raw inputs.

Derived Metrics contain reproducible calculations based on those inputs.

### Current PoC

A dedicated deterministic financial engine is not yet implemented.

### Status

**Future object / strong direction.**

---

## 18. Evidence Snapshot

### Definition

An Evidence Snapshot is the immutable evidence state captured by an Analysis Run.

### Purpose

It preserves:

> What evidence did this analysis actually use?

### Example

Run #1 should retain the evidence available at that moment even if the case later changes.

### Current PoC

Analysis runs preserve historical evidence snapshots.

### Key rule

> **Later evidence does not rewrite previous snapshots.**

### Status

**Locked historical object behavior.**

---

# PART V — ANALYSIS ARCHITECTURE

---

## 19. Analysis Run

### Definition

An Analysis Run is a point-in-time interpretation of an Investment Case using a specific evidence snapshot and analysis context.

### An Analysis Run should contain

- run identity,
- timestamp,
- analysis context,
- evidence snapshot,
- source references,
- generated findings,
- synthesis,
- contradictions,
- unknowns,
- diligence suggestions.

### Analysis Run answers

> What did the system conclude from the evidence available at this moment?

### Key rule

> **Analysis Runs are versioned historical objects.**

### Current PoC

Runs are persistent and historical.

### Current limitation

The intelligence itself is deterministic simulation.

### Future direction

Runs may use real AI, multiple models, deterministic calculators, or research tools.

### Status

**Locked object. Intelligence implementation will evolve.**

---

## 20. Analysis Context

### Definition

Analysis Context describes why the run is being performed.

### Examples

- Initial Screening
- Post-Founder Meeting
- Due Diligence
- Pre-IC

### Product value

The same evidence may be interpreted differently depending on decision stage.

### Current status

Working context labels exist.

### Important limitation

These are not yet a finalized universal lifecycle taxonomy.

### Status

**Provisional field / strong concept.**

---

## 21. Finding

### Definition

A Finding is a meaningful analytical observation produced during an Analysis Run.

### A mature Finding may contain

- observation,
- interpretation,
- supporting evidence,
- counter-evidence,
- confidence description,
- risk,
- implication,
- source references.

### Example

Observation:

> Revenue grew 90% year-over-year.

Interpretation:

> Growth is strong.

Counterpoint:

> Two customers represent 62% of revenue.

### Product role

Finding is the bridge between evidence and analytical interpretation.

### Current PoC

Findings exist in simulated analysis.

### Future direction

Findings should become more explicitly evidence-linked.

### Status

**Core intelligence object.**

---

## 22. Executive Synthesis

### Definition

A concise case-level summary generated from the current Analysis Run.

### Purpose

Help a user understand the current state quickly.

### Important rule

Executive Synthesis should not become the only preserved reasoning artifact.

It is a view over deeper structured analysis.

### Status

**Current analysis component.**

---

## 23. Why This Could Win

### Definition

Structured arguments supporting the investment thesis.

### Source

Should come from:

- evidence,
- metrics,
- context,
- analysis.

### Product role

Supports balanced thesis construction.

### Status

**Current analysis component.**

---

## 24. Why This Could Fail

### Definition

Structured risks and arguments against the investment thesis.

### Product role

Supports challenge and downside reasoning.

### Status

**Current analysis component.**

---

## 25. Contradiction

### Definition

A Contradiction represents materially conflicting evidence or claims.

### Example

Source A:

> ARR = $4.2M

Source B:

> ARR = $3.9M

### Important rule

> **Contradictions should be preserved, not silently merged.**

### Current PoC

Conflict status and contradiction views exist.

### Future direction

Automatic contradiction detection may be added.

### Status

**Locked concept.**

---

## 26. Critical Unknown

### Definition

A Critical Unknown is missing information that materially limits current analysis.

### Examples

- churn unavailable,
- top customer concentration unknown,
- cap table incomplete,
- regulatory exposure unclear.

### Product role

Unknowns should drive diligence.

### Status

**Current analysis concept.**

---

## 27. Suggested Diligence

### Definition

A Suggested Diligence item is a system-generated recommendation for follow-up investigation.

### Important rule

> **Suggestion ≠ persistent diligence object.**

### Current PoC

A suggestion becomes a real Diligence Question only after explicit user action.

### Status

**Locked interaction rule.**

---

# PART VI — DILIGENCE ARCHITECTURE

---

## 28. Diligence Question

### Definition

A persistent follow-up question or investigation task created because the case contains uncertainty, conflict, or missing evidence.

### Suggested fields

- question,
- owner,
- status,
- category,
- trigger,
- context,
- created at,
- response,
- resolution.

### Product purpose

Turn unknowns into structured work.

### Current PoC

Persistent questions and resolutions exist.

### Status

**Implemented object.**

---

## 29. Diligence Trigger

### Definition

The reason a Diligence Question exists.

### Examples

- contradiction,
- missing evidence,
- analyst concern,
- AI suggestion,
- founder claim,
- IC request.

### Product importance

A trigger preserves context.

### Current limitation

Immutable question-to-analysis provenance is not fully modeled.

### Future direction

Questions may be linked explicitly to:

- Analysis Run,
- Finding,
- Evidence,
- Source.

### Status

**Conceptual / partially represented.**

---

## 30. Diligence Resolution

### Definition

The recorded response or outcome of a Diligence Question.

### Resolution may produce

- new source,
- new evidence,
- updated evidence status,
- resolved contradiction,
- new unknown,
- new analysis run.

### Product rule

Diligence resolution should enrich the case rather than replace history.

### Status

**Current object behavior.**

---

# PART VII — HUMAN JUDGMENT ARCHITECTURE

---

## 31. Human Review

### Definition

A Human Review records a person's response to an Analysis Run or finding.

### Current review modes

Conceptually:

- Agree
- Disagree
- Add Context
- Override

### Product rule

> **Human Review must not overwrite the original system assessment.**

### Why

The disagreement itself is valuable historical data.

### Current PoC

Human review is stored separately and tied to original analysis run context.

### Status

**Locked object.**

---

## 32. Analyst Recommendation

### Definition

A Recommendation records the analyst or deal team's current suggested course of action.

### Recommendation answers

> What does the analyst think should happen next?

### Important rule

> **Recommendation is not Final Decision.**

### Potential future states

Examples may include:

- Proceed
- Continue Diligence
- Recommend IC
- Pass
- Revisit Later

Exact taxonomy remains open.

### Current PoC

Recommendation is a separate persistent object.

### Status

**Locked object; taxonomy may evolve.**

---

## 33. Final Decision

### Definition

A Final Decision is the authorized investment outcome recorded by a user with decision authority.

### Decision answers

> What did the authorized decision-maker actually decide?

### Current PoC

Partner/Admin can record final decision.

Analyst cannot.

Decision rationale is required.

### Important rule

Final Decision should remain historically visible even if a later decision is added.

### Current edge case

The current model can preserve an earlier Invested decision and later Pass while retaining the portfolio record.

This behavior preserves history but is **not an approved final business rule**.

### Status

**Implemented object. Post-decision semantics remain provisional.**

---

## 34. Decision History

### Definition

The ordered sequence of decisions recorded over time.

### Purpose

Avoid reducing the case to only its latest outcome.

### Product value

Later users should be able to see:

- what was decided,
- when,
- by whom,
- with what rationale.

### Current PoC

Successive decisions are preserved.

### Status

**Locked historical direction.**

---

# PART VIII — PORTFOLIO ARCHITECTURE

---

## 35. Portfolio Record

### Definition

A Portfolio Record represents an invested company/case after explicit portfolio transition.

### Important rule

> **Portfolio should extend the Investment Case, not erase it.**

### Portfolio should preserve

- original thesis,
- original evidence,
- original analysis,
- recommendation,
- decision,
- later monitoring.

### Current PoC

Portfolio entry is explicit.

### Status

**Implemented object.**

---

## 36. Monitoring Update

### Definition

A Monitoring Update records material post-investment developments.

### Possible future dimensions

- revenue,
- customer growth,
- hiring,
- runway,
- product milestone,
- financing,
- competitive shift,
- regulatory risk,
- strategic partnership.

### Current PoC

Monitoring is manual.

### Future direction

May become automated or partially automated.

### Status

**Implemented basic object; future intelligence open.**

---

## 37. Historical Thesis

### Definition

The investment thesis preserved at or around the original decision point.

### Why important

Portfolio learning requires comparing:

**What we believed**  
with  
**What happened**

### Current PoC

Original case/thesis history is preserved.

### Future direction

A dedicated thesis object or structured thesis components may emerge.

### Status

**Strong future direction.**

---

# PART IX — RELATIONSHIP MODEL

---

## 38. High-Level Relationship Graph

Conceptually:

**Workspace**  
→ contains **Companies**

**Company**  
→ has many **Investment Cases**

**Investment Case**  
→ has many **Source Documents**  
→ has many **Structured Evidence records**  
→ has many **Analysis Runs**  
→ has many **Diligence Questions**  
→ has many **Human Reviews**  
→ has many **Recommendations**  
→ has many **Final Decisions**  
→ may link to **Portfolio Record**

**Analysis Run**  
→ contains an **Evidence Snapshot**  
→ produces **Findings**  
→ may surface **Contradictions**  
→ may surface **Critical Unknowns**  
→ may generate **Suggested Diligence**

**Human Review**  
→ references an Analysis Run / system assessment context

**Diligence Question**  
→ may originate from Finding, Unknown, Contradiction, or human concern

**Portfolio Record**  
→ preserves link to original Investment Case  
→ contains **Monitoring Updates**

---

## 39. Conceptual Data Flow

A useful mental model is:

**Source Document**  
→ **Structured Evidence**  
→ **Evidence Snapshot**  
→ **Analysis Run**  
→ **Finding / Contradiction / Unknown**  
→ **Diligence / Human Review**  
→ **Recommendation**  
→ **Decision**  
→ **Portfolio / Monitoring**

This is not a required technical schema.

It is the product meaning.

---

# PART X — MUTABILITY RULES

---

## 40. Mutable Objects

Some information is expected to evolve.

Examples:

- current case context,
- current owner,
- current case status,
- open diligence question,
- current portfolio monitoring state.

Changes should still be traceable where material.

---

## 41. Historical / Append-Oriented Objects

Some objects should be treated as historical records.

Examples:

- Analysis Runs,
- Evidence Snapshots,
- Human Reviews,
- Recommendations,
- Final Decisions,
- Activity entries.

These should not be silently rewritten to reflect the present.

---

## 42. Immutable-in-Spirit Objects

The following may not be technically immutable in the current code, but their product meaning should be treated as historically stable:

- prior Analysis Run evidence snapshot,
- prior Decision rationale,
- prior Human Review,
- prior Recommendation.

Future architecture may enforce stronger immutability.

---

# PART XI — STATE BOUNDARIES

---

## 43. Source State vs Evidence State

A file exists.

That does not mean:

- its contents were extracted,
- the contents are correct,
- a claim was verified.

Therefore:

**Source existence**  
≠  
**Evidence validity**

---

## 44. Evidence State vs Analysis State

Evidence may exist before analysis.

An Analysis Run is a specific interpretation of the evidence.

Therefore:

**Evidence**  
≠  
**Analysis**

---

## 45. Analysis State vs Human State

A system finding may exist.

A human may disagree.

Therefore:

**System Assessment**  
≠  
**Human Judgment**

---

## 46. Human Judgment vs Decision State

An analyst may recommend investment.

A Partner may decide to pass.

Therefore:

**Recommendation**  
≠  
**Decision**

---

## 47. Decision State vs Portfolio State

A decision may say Invested.

Portfolio entry is still a distinct operational state.

Therefore:

**Invested Decision**  
≠ automatically  
**Portfolio Record**

The current PoC preserves this distinction.

---

# PART XII — CURRENT POC STORAGE MODEL

---

## 48. Current Persistence Approach

The current local PoC uses a deliberately simple persistence model.

### Current behavior

- workspace state stored in local database,
- one workspace record contains serialized product state,
- revision supports optimistic concurrency,
- source bytes stored separately,
- document access remains authenticated.

### Why this is acceptable now

The current objective is to validate:

- workflow,
- product objects,
- persistence,
- historical behavior,
- access boundaries.

Normalization is not yet required for the PoC objective.

### Important limitation

The current storage representation should not be mistaken for the final product object model.

The **product model** in this document is more durable than the current persistence shape.

---

## 49. Optimistic Revision

### Definition

The current workspace persistence uses a revision value to detect stale writes.

### Product value

Prevents one stale client update from silently overwriting newer state.

### Future direction

A multi-user system will require more mature concurrency handling.

### Status

**Current technical behavior.**

---

## 50. Source Storage

Source bytes are stored separately from structured workspace state.

### Product reason

Documents are large binary objects and have different access/storage needs.

### Current PoC

Private authenticated download behavior exists.

### Status

**Current architecture.**

---

# PART XIII — CURRENT OBJECT STATUS MATRIX

---

## 51. Object Status

| Object | Current Status | Notes |
| --- | --- | --- |
| Workspace | Functional | Local PoC owner/workspace |
| Operator Identity | Functional | Access Gate identity |
| Role | Prototype | Self-selectable demo role |
| Company | Functional | Separate from Case |
| Investment Case | Functional | Core object |
| Case Context | Functional | Progressive enrichment |
| Source Document | Functional | Private upload/download |
| Structured Evidence | Functional | Manual entry |
| Evidence Status | Functional | Human-assigned |
| Derived Metric | Future | Dedicated engine not implemented |
| Evidence Snapshot | Functional | Stored per Analysis Run |
| Analysis Run | Functional | Versioned historical run |
| Finding | Functional / simulated | Generated by rules-v1 |
| Contradiction | Functional concept | Detection not automated |
| Critical Unknown | Functional concept | Generated from current simulation |
| Suggested Diligence | Functional | Requires explicit save |
| Diligence Question | Functional | Persistent |
| Human Review | Functional | Separate from system output |
| Recommendation | Functional | Separate from Decision |
| Final Decision | Functional | Role-gated |
| Decision History | Functional | Successive decisions preserved |
| Portfolio Record | Functional | Explicit transition |
| Monitoring Update | Functional | Manual |
| Institutional Memory | Foundational only | Cross-case intelligence not implemented |
| Grounded Assistant | Future | Not implemented |
| Extraction Pipeline | Future | Not implemented |
| External Research | Future | Not implemented |

---

# PART XIV — FUTURE OBJECTS

---

## 52. Claim

A future Claim object may represent a normalized statement extracted from one or more sources.

Example:

> “ARR is $4.2M.”

A Claim could connect:

- Source,
- Evidence,
- Support,
- Contradiction.

### Status

**Future candidate. Not approved as required schema.**

---

## 53. Support Relationship

A future Support relationship may represent:

> Source B supports Claim A.

This would allow richer provenance and evidence graphs.

### Status

**Future candidate.**

---

## 54. Counter-Evidence Relationship

A future relationship may explicitly represent:

> Evidence B weakens or contradicts Finding A.

### Status

**Future candidate.**

---

## 55. Thesis Object

A future dedicated Thesis object may structure:

- thesis statement,
- supporting pillars,
- assumptions,
- risks,
- evidence,
- expected outcomes.

### Why useful

Could improve:

- challenge,
- monitoring,
- thesis-vs-outcome analysis.

### Status

**Strong future candidate.**

---

## 56. Scenario

A future Scenario object may support:

- base,
- upside,
- downside,
- custom cases.

### Status

**Future candidate.**

---

## 57. Research Task

A future Research Task may represent:

- external research objective,
- query,
- sources,
- findings,
- provenance,
- completion status.

### Status

**Future candidate.**

---

# PART XV — OBJECT DESIGN RULES

---

## 58. Rule: Do Not Collapse Layers

Do not combine:

- Source,
- Evidence,
- Analysis,
- Human Judgment,
- Decision

into one generic record.

Each has different meaning.

---

## 59. Rule: Preserve Historical Identity

If an object represents a historical judgment, it should retain:

- identity,
- timestamp,
- context,
- actor,
- basis where relevant.

---

## 60. Rule: Prefer Relationships Over Duplication

Where possible, objects should reference one another rather than duplicate meaning.

Example:

A Human Review should reference the Analysis Run it reviews.

---

## 61. Rule: New Automation Should Produce Candidate State First

Where future AI automation creates meaningful product data, prefer:

**AI candidate**  
→ **human inspect/confirm**  
→ **persistent object**

for high-impact changes.

---

## 62. Rule: Unknown Relationship = Do Not Invent

If it is unclear whether an object should belong to Company or Investment Case, or whether a lifecycle rule is universal, leave it provisional.

Do not hard-code domain assumptions silently.

---

# PART XVI — PRODUCT ARCHITECTURE EXAMPLES

---

## 63. Example — New Deal

A new startup appears.

System structure:

**Company**  
Aster Robotics

**Investment Case**  
Aster Robotics — Series A Evaluation

**Case Context**
- Series A
- target check
- owner
- thesis

**Sources**
- Pitch Deck
- Founder Notes

**Evidence**
- ARR
- customer count
- churn
- market claim

Then:

**Analysis Run #1**
- initial screening

Then:

**Diligence**
- customer concentration question

Then:

**Human Review**
- analyst disagrees with market-risk assessment

Then:

**Recommendation**
- proceed to IC

Then:

**Final Decision**
- Invested

Then:

**Portfolio Record**
- monitoring begins

---

## 64. Example — New Evidence After Analysis

Existing:

**Analysis Run #1**
uses 12 evidence records.

Later:

- new financial model uploaded,
- ARR value conflicts,
- churn becomes known.

Correct behavior:

- old Run #1 remains unchanged,
- current case evidence updates,
- contradiction is visible,
- user may run **Analysis Run #2**.

Incorrect behavior:

- silently rewrite Run #1 with latest evidence.

---

## 65. Example — Human Disagreement

System Finding:

> “Customer concentration risk appears moderate.”

Analyst Review:

> “Disagree. Top two customers represent most of current revenue and both contracts renew within six months.”

Correct behavior:

- preserve original finding,
- preserve analyst disagreement,
- allow future users to inspect both.

Incorrect behavior:

- edit the original finding to match the analyst.

---

## 66. Example — Pass Then Revisit

Seed Case:

- Decision = Pass

One year later:

Series A opportunity returns.

Correct model:

**Same Company**  
→ **New Investment Case**

The new case can reference the previous case historically.

It should not reopen the old case as if the original decision never happened.

---

# PART XVII — ARCHITECTURAL OPEN QUESTIONS

---

## 67. Company-Level vs Case-Level Data

Still requires refinement:

- which metrics are canonical company facts,
- which are case-specific evidence,
- which should be reused across cases,
- how historical company data should be versioned.

---

## 68. Diligence-to-Run Provenance

The current model can preserve context, but a stronger explicit foreign-key-like relationship between:

- Diligence Question,
- Analysis Run,
- Finding,
- Evidence

may be valuable.

Not yet finalized.

---

## 69. Decision Lifecycle

Still unresolved:

- conditional approval,
- withdrawn decision,
- reconsideration,
- post-investment reversal,
- exit semantics,
- Pass after Invested.

Do not invent these rules silently.

---

## 70. Real IC Object

A future IC object may include:

- meeting,
- participants,
- pre-read,
- agenda,
- comments,
- dissent,
- vote,
- conditions,
- decision.

This is not yet approved as required architecture.

---

## 71. Cross-Case Intelligence Model

Still open:

- how to retrieve previous cases,
- how to compare firms/sectors,
- how to preserve permission boundaries,
- how to avoid leaking confidential case information.

---

# PART XVIII — HANDOFF SUMMARY

---

## 72. Objects Future Builders Must Understand First

Before changing KRAVV-IENT behavior, understand:

1. Workspace
2. Company
3. Investment Case
4. Source Document
5. Structured Evidence
6. Evidence Snapshot
7. Analysis Run
8. Diligence Question
9. Human Review
10. Recommendation
11. Final Decision
12. Portfolio Record

If these distinctions are lost, the product becomes a generic AI analysis tool.

---

## 73. The Architectural Invariants

Future development should preserve:

- Company ≠ Investment Case
- Source ≠ Evidence
- Evidence ≠ Analysis
- Analysis ≠ Human Judgment
- Human Judgment ≠ Recommendation
- Recommendation ≠ Final Decision
- Final Decision ≠ Portfolio Record
- New evidence ≠ rewritten historical run
- AI suggestion ≠ persistent action
- Conflict ≠ resolved truth
- Current state ≠ historical state

---

## 74. Final Architecture Principle

KRAVV-IENT should be designed so that every important investment conclusion can be traced backward:

**Decision**  
→ **Recommendation**  
→ **Human Judgment**  
→ **Analysis**  
→ **Evidence**  
→ **Source**

and every important investment outcome can be traced forward:

**Decision**  
→ **Portfolio**  
→ **Monitoring**  
→ **Outcome Learning**

That two-way traceability is the central product architecture.
