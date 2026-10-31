# KRAVV-IENT — Domain & Investment Workflow

**Document ID:** 03  
**Document Type:** Canonical Domain & Workflow Reference  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Venture capital / private investment workflow, domain structure, and KRAVV-IENT product mapping  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document explains the investment workflow KRAVV-IENT is designed to support.

It is not intended to define one universal venture capital process.

Investment firms vary in:

- fund strategy,
- stage focus,
- geography,
- sector,
- team size,
- ownership model,
- diligence depth,
- Investment Committee process,
- legal process,
- portfolio support,
- follow-on strategy.

The goal of this document is therefore to define a **working domain model** that is useful enough for product design while remaining flexible enough to accommodate firm variation.

This document should help answer:

- How does a conventional investment process usually evolve?
- What information exists at each stage?
- What decisions are being made?
- Which artifacts are produced?
- Where does KRAVV-IENT fit?
- Which parts are currently implemented?
- Which parts remain future product work?

---

## 2. Core Domain Perspective

KRAVV-IENT treats investing as a **decision process under uncertainty**.

The workflow is not simply:

> company enters → score is calculated → invest or pass.

Instead, the process evolves through repeated cycles of:

**Information → Evidence → Interpretation → Questions → Judgment → Decision**

The same company may move through several different levels of understanding before a final decision is made.

The system should therefore support changing information without losing historical context.

---

## 3. Working Venture Capital Lifecycle

A practical working model for the investment lifecycle is:

1. **Sourcing**
2. **Initial Screening**
3. **Initial Evaluation**
4. **Founder Interaction**
5. **Deep Diligence**
6. **Internal Synthesis**
7. **Investment Committee Review**
8. **Term Sheet / Negotiation**
9. **Confirmatory / Legal Diligence**
10. **Close**
11. **Portfolio Monitoring**
12. **Follow-on / Exit**

This sequence is not universal.

Some firms may:

- skip formal stages,
- merge stages,
- repeat stages,
- conduct diligence before founder meetings,
- run Investment Committee review more than once,
- issue conditional approvals,
- perform legal diligence earlier,
- decline before any structured memo exists.

KRAVV-IENT should support the logic of the process without forcing every firm into one rigid lifecycle.

---

# PART I — PRE-INVESTMENT WORKFLOW

---

## 4. Stage 1 — Sourcing

### Domain purpose

Sourcing is the process of identifying potential investment opportunities.

Deals may originate from:

- founder outreach,
- investor referrals,
- accelerators,
- portfolio founders,
- internal research,
- conferences,
- scouting,
- inbound applications,
- databases,
- ecosystem relationships.

### Typical information available

At this stage, information may be limited to:

- company name,
- founder names,
- website,
- sector,
- stage,
- geography,
- fundraising round,
- deck or short profile,
- source of introduction.

### Decision question

> Is this opportunity worth entering the firm's active evaluation pipeline?

### Typical artifacts

- CRM record,
- founder email,
- pitch deck,
- intro note,
- initial company profile.

### KRAVV-IENT mapping

A sourced opportunity can become:

**Company**  
plus  
**Investment Case**

The Investment Case should begin lightweight.

The purpose is to open a decision workspace, not force full diligence before the user has enough information.

### Current PoC

Supported through:

- Company creation,
- Investment Case creation,
- deal source,
- stage,
- owner,
- thesis/context fields.

### Future direction

Potential integrations may automatically create candidate cases from:

- CRM,
- inbound application,
- email,
- scouting source,
- partner referral.

---

## 5. Stage 2 — Initial Screening

### Domain purpose

Initial screening determines whether a deal fits the firm's basic investment criteria.

### Common screening dimensions

Depending on the firm:

- sector fit,
- geography,
- stage,
- check size,
- ownership target,
- fund mandate,
- business model,
- market size,
- traction threshold,
- founder fit,
- timing.

### Decision question

> Is this company relevant enough to justify deeper evaluation?

### Typical outcomes

- reject / pass,
- hold,
- request more information,
- move to initial evaluation.

### KRAVV-IENT mapping

The Investment Case should expose:

- current fit assumptions,
- known evidence,
- unknowns,
- obvious disqualifiers,
- preliminary thesis.

The system should not automatically infer fund fit unless the relevant strategy rules exist.

### Current PoC

The product can store context and support a first analysis run.

Formal fund-mandate rules are not yet implemented.

---

## 6. Stage 3 — Initial Evaluation

### Domain purpose

Initial evaluation develops the first structured view of the opportunity.

The analyst may begin assessing:

- team,
- product,
- market,
- business model,
- traction,
- competition,
- economics,
- fundraising context.

### Decision question

> Is there enough potential to spend more time and request deeper access?

### Typical activities

- deck review,
- website research,
- early metric review,
- competitor scan,
- thesis fit assessment,
- initial questions.

### KRAVV-IENT mapping

This is where the distinction between:

**Source**  
and  
**Structured Evidence**

becomes important.

The pitch deck is a source.

A claim such as:

> “ARR is $4.2M”

is an evidence record.

Its status may still be:

**Reported**

until supported or verified.

### Current PoC

Supported through:

- source document upload,
- manual structured evidence,
- evidence status,
- analysis readiness,
- simulated analysis,
- saved analysis runs.

---

## 7. Stage 4 — Founder Interaction

### Domain purpose

Founder interaction adds context that cannot be learned from documents alone.

### Typical topics

- founder motivation,
- origin story,
- product insight,
- customer pain,
- go-to-market,
- competition,
- hiring,
- strategic vision,
- fundraising expectations,
- use of capital,
- unresolved risks.

### Typical artifacts

- meeting notes,
- transcript,
- follow-up email,
- data request,
- updated deck.

### Decision question

> Did the founder interaction strengthen or weaken the current investment thesis?

### KRAVV-IENT mapping

Founder interaction should enrich the same Investment Case.

It should not create a disconnected note system.

A future KRAVV-IENT may transform meeting notes into:

- candidate evidence,
- founder claims,
- follow-up questions,
- contradictions,
- context changes.

### Important principle

Founder statements should not automatically be treated as verified facts.

### Current PoC

Meeting notes can be represented as source material and structured evidence manually.

Automatic transcript ingestion is not implemented.

---

## 8. Stage 5 — Deep Diligence

### Domain purpose

Deep diligence attempts to reduce uncertainty before a major internal decision.

This stage varies significantly by firm and deal.

### Common diligence dimensions

#### Team

- founder background,
- leadership quality,
- hiring capability,
- references,
- incentives,
- ownership.

#### Product

- product quality,
- roadmap,
- adoption,
- differentiation,
- user experience,
- product risk.

#### Technology

- architecture,
- scalability,
- security,
- technical debt,
- defensibility,
- technical team.

#### Market

- market size,
- growth,
- structure,
- regulation,
- timing,
- tailwinds.

#### Competition

- direct competitors,
- substitutes,
- pricing,
- differentiation,
- barriers,
- market positioning.

#### Customers and traction

- revenue,
- retention,
- churn,
- customer concentration,
- cohort behavior,
- references,
- pipeline quality.

#### Business model

- pricing,
- gross margin,
- acquisition,
- sales motion,
- scalability,
- unit economics.

#### Financial

- revenue quality,
- burn,
- runway,
- forecast,
- financing need,
- scenario sensitivity.

#### Capital structure

- cap table,
- dilution,
- preference structure,
- previous financing,
- option pool.

#### Legal / regulatory

- incorporation,
- IP ownership,
- contracts,
- litigation,
- regulatory exposure,
- compliance.

### Decision question

> What must be true for this investment thesis to hold, and what evidence supports or challenges those assumptions?

### KRAVV-IENT mapping

Deep diligence is where KRAVV-IENT should eventually become especially valuable.

The case can contain:

- multiple sources,
- structured evidence,
- conflicting claims,
- open questions,
- analysis runs,
- human reviews.

### Current PoC

The current product supports:

- manually structured evidence,
- conflicting and unknown evidence states,
- persistent diligence questions,
- question status and response,
- saved analysis history.

### Future direction

Potential capabilities include:

- automatic evidence extraction,
- source comparison,
- contradiction detection,
- evidence quality assessment,
- diligence prioritization,
- research orchestration,
- deterministic financial calculations.

---

# PART II — SYNTHESIS AND DECISION

---

## 9. Stage 6 — Internal Synthesis

### Domain purpose

Internal synthesis turns raw diligence into a coherent investment view.

The output may take the form of:

- investment memo,
- internal brief,
- partner note,
- discussion document,
- recommendation packet.

### Important distinction

The memo is an **output** of the workflow.

It is not the workflow itself.

KRAVV-IENT should therefore preserve the evidence and reasoning that exist before the memo is generated.

### Typical synthesis questions

- What is the investment thesis?
- What could make the company win?
- What could make the investment fail?
- Which claims are verified?
- Which claims remain unsupported?
- What are the most material risks?
- Which questions remain unresolved?
- What valuation assumptions matter?
- What is the recommended next action?

### KRAVV-IENT mapping

The Analysis surface currently demonstrates a structured synthesis model:

- Executive Synthesis
- Key Findings
- Why This Could Win
- Why This Could Fail
- Contradictions
- Critical Unknowns
- Diligence Priorities
- Evidence Traceability

### Current PoC

This structure exists using deterministic simulation.

### Future direction

A real intelligence layer should generate these outputs from:

- structured evidence,
- derived metrics,
- source provenance,
- current analysis context,
- historical runs.

---

## 10. Stage 7 — Investment Committee Review

### Domain purpose

Investment Committee review is where the firm evaluates whether the opportunity should proceed.

### Typical participants

May include:

- Partners,
- General Partners,
- Principals,
- investment team,
- specialists,
- operating partners.

### Typical IC questions

- Why now?
- Why this team?
- Why this market?
- Why this company?
- Why this valuation?
- What must go right?
- What can go wrong?
- What is still unknown?
- Why should this fund own this asset?

### Possible outcomes

Depending on the firm:

- approve,
- reject,
- continue diligence,
- approve conditionally,
- revise economics,
- return for another IC.

### Important product boundary

There is no universal IC workflow.

KRAVV-IENT should not encode one firm's committee mechanics as universal truth.

### Current PoC

The current system separates:

**System Assessment**  
→ **Human Review**  
→ **Analyst Recommendation**  
→ **Final Decision**

It also demonstrates prototype role restrictions:

- Analyst cannot record final decision,
- Partner/Admin can.

### Future direction

Potential IC capabilities include:

- pre-read,
- unresolved issue summary,
- comments,
- dissent,
- conditions,
- participant records,
- decision rationale,
- vote / approval mechanism,
- follow-up actions.

The exact model remains unresolved.

---

## 11. Recommendation vs Decision

This distinction is fundamental.

### Analyst Recommendation

Represents the analyst or deal team's judgment.

Examples:

- Proceed
- Continue Diligence
- Pass
- Recommend IC Review

### Final Decision

Represents the authorized investment decision.

The two may differ.

### Why this matters

If an analyst recommends investing and the Partner decides to pass, both are useful historical information.

The product should preserve both.

### Current PoC

Recommendation and final decision are separate persistent objects.

---

## 12. Human Review

Human Review allows a user to respond to system analysis without rewriting it.

Possible human responses may include:

- Agree
- Disagree
- Add Context
- Override

### Why this matters

A model should not become the canonical historical voice simply because it generated the first analysis.

### KRAVV-IENT principle

**System Assessment ≠ Human Judgment**

### Current PoC

Human reviews are stored separately from analysis runs.

Historical analysis remains intact.

---

# PART III — TRANSACTION AND CLOSE

---

## 13. Stage 8 — Term Sheet / Negotiation

### Domain purpose

If the firm decides to proceed, commercial terms may be negotiated.

### Typical areas

- valuation,
- check size,
- ownership,
- liquidation preference,
- board rights,
- pro rata rights,
- information rights,
- governance,
- option pool,
- closing conditions.

### Product relevance

KRAVV-IENT may eventually store or link:

- agreed commercial assumptions,
- investment terms,
- conditional approvals,
- decision rationale.

### Current PoC

This stage is not modeled deeply.

Valuation and target check may exist as context fields.

Formal term-sheet workflows are out of current scope.

---

## 14. Stage 9 — Confirmatory / Legal Diligence

### Domain purpose

After commercial agreement, the investor may perform final verification and legal diligence.

### Typical topics

- company formation,
- cap table,
- ownership,
- contracts,
- IP,
- employment,
- regulatory matters,
- litigation,
- financial confirmation.

### Product relevance

KRAVV-IENT could eventually connect final confirmatory evidence to the original decision assumptions.

### Current PoC

No formal legal-diligence module exists.

Documents and evidence can still be represented using the generic case model.

---

## 15. Stage 10 — Close

### Domain purpose

The investment transaction is completed.

### Typical events

- documents executed,
- funds transferred,
- ownership recorded,
- portfolio status activated.

### KRAVV-IENT mapping

An Invested decision may lead to explicit portfolio entry.

The original case should remain intact.

### Current PoC

Portfolio entry is explicit rather than automatic.

This preserves the distinction between:

**Decision**  
and  
**Portfolio Record**

---

# PART IV — POST-INVESTMENT WORKFLOW

---

## 16. Stage 11 — Portfolio Monitoring

### Domain purpose

After investment, the firm monitors company performance and supports the portfolio company.

### Typical monitoring dimensions

- revenue,
- growth,
- burn,
- runway,
- hiring,
- customers,
- product milestones,
- fundraising,
- strategic partnerships,
- regulatory issues,
- major risks.

### Core learning question

> Did the world evolve the way the investment thesis expected?

### KRAVV-IENT mapping

The original thesis should remain visible.

Monitoring should compare:

**Expected**  
versus  
**Actual**

### Current PoC

Portfolio updates can be recorded manually.

The original Investment Case remains linked.

### Future direction

Potential capabilities include:

- automated metric ingestion,
- alerts,
- thesis tracking,
- portfolio reporting,
- risk monitoring,
- external company monitoring,
- AI-generated change summaries.

---

## 17. Stage 12 — Follow-on / Exit

### Domain purpose

A portfolio company may later require:

- follow-on investment,
- reserve allocation,
- secondary sale,
- exit consideration,
- write-down,
- write-off,
- strategic review.

### Product implication

A future KRAVV-IENT may create new Investment Cases for follow-on decisions rather than rewriting the original case.

### Why

A follow-on is a new decision context.

It may use historical evidence from prior cases while preserving the reasoning behind the earlier investment.

### Current PoC

Formal follow-on and exit workflows are not implemented.

---

# PART V — INFORMATION CLASSES

---

## 18. Information Should Be Classified by Meaning

Investment information is not homogeneous.

A mature KRAVV-IENT should distinguish several information classes.

### 18.1 Source Fact

A fact explicitly present in a source.

Example:

> “The financial model lists FY2025 revenue as $8M.”

### 18.2 Company Claim

A statement made by the company or founder.

Example:

> “We have no direct competitors.”

This may be evidence, but it is not independently verified.

### 18.3 External Evidence

Information from an outside source.

Example:

- regulatory filing,
- customer review,
- market database,
- public report.

### 18.4 Derived Metric

A deterministic calculation based on underlying facts.

Example:

> Revenue growth = 72%.

### 18.5 Assumption

A statement accepted temporarily for analysis.

Example:

> “Assume 15% quarterly hiring growth.”

### 18.6 Scenario

A modeled future state.

Example:

- base case,
- upside case,
- downside case.

### 18.7 Interpretation

An analytical conclusion.

Example:

> “Growth is strong but appears dependent on two enterprise customers.”

### 18.8 Recommendation

A human or system proposal about what to do next.

### 18.9 Decision

An authorized outcome.

### Product principle

The system should avoid collapsing these classes into one text block.

---

## 19. Evidence States

The current PoC uses the following evidence statuses:

### Reported

The claim has been recorded but is primarily based on the reporting source.

### Supported

The claim has some supporting evidence.

### Verified

The claim is considered verified within the current human-recorded PoC workflow.

### Conflicting

Available sources or records conflict.

### Unknown

The relevant information is missing or unresolved.

### Important limitation

In the current PoC, these statuses are **human-assigned**.

The system does not independently verify evidence.

### Future direction

Some status transitions may eventually be assisted or suggested automatically, but material verification should remain explainable.

---

# PART VI — DILIGENCE MODEL

---

## 20. Diligence Is a Persistent Workflow Object

A diligence question should not be treated as temporary chat.

It should exist as a persistent object.

A question may contain:

- question text,
- owner,
- status,
- trigger,
- context,
- response,
- resolution.

### Why this matters

Uncertainty is not solved simply by generating more analysis.

It often requires a human action:

- ask the founder,
- request a document,
- call a customer,
- run a technical review,
- obtain legal confirmation.

### Current PoC

Diligence questions can be created, answered, and resolved.

AI-generated suggestions do not automatically become persistent questions until explicitly saved.

---

## 21. Typical Diligence Lifecycle

A possible working lifecycle:

**Identified Unknown**  
→ **Question Proposed**  
→ **Question Created**  
→ **Owner Assigned**  
→ **Information Requested**  
→ **Response Received**  
→ **Evidence Updated**  
→ **Question Resolved**

This is directional.

The exact workflow may vary by firm.

---

# PART VII — ANALYSIS MODEL

---

## 22. Analysis Is a Snapshot, Not a Living Blob

An Analysis Run represents a point-in-time interpretation of the evidence available at that moment.

### Why this matters

If evidence changes later, the old analysis should remain historically valid as a record of what the team knew then.

### Current PoC

Analysis runs preserve evidence snapshots.

### Example

Run #1:

- 10 evidence records,
- 2 unknown,
- 1 conflict.

Later:

- 4 new evidence records arrive,
- one unknown is resolved.

Run #1 remains unchanged.

Run #2 may represent the new information state.

---

## 23. Analysis Context

The current PoC demonstrates contexts such as:

- Initial Screening
- Post-Founder-Meeting
- Due Diligence
- Pre-IC

These should be interpreted as working contexts rather than immutable lifecycle law.

### Product benefit

The same evidence may be interpreted differently depending on the purpose of the run.

---

## 24. Analysis Output Structure

The current product direction favors structured reasoning.

### Executive Synthesis

A concise overview of the current case.

### Key Findings

Material observations and interpretations.

### Why This Could Win

Evidence supporting the investment thesis.

### Why This Could Fail

Risks and counterarguments.

### Contradictions

Conflicting evidence.

### Critical Unknowns

Missing information that may matter.

### Diligence Priorities

Potential next questions or actions.

### Evidence Traceability

The basis behind findings.

### Principle

The product should not reduce the investment case to one universal score.

---

# PART VIII — ROLE MODEL

---

## 25. Analyst

Expected responsibilities may include:

- creating cases,
- recording evidence,
- running analysis,
- creating diligence,
- reviewing findings,
- making recommendations.

### Current PoC

Analyst cannot record final investment decision.

---

## 26. Associate / Principal

Potential responsibilities may include:

- deeper diligence,
- case ownership,
- cross-functional coordination,
- synthesis,
- recommendation,
- review.

This role is not currently modeled separately in the PoC.

---

## 27. Partner / Decision Authority

Potential responsibilities include:

- reviewing case,
- challenging assumptions,
- assessing recommendation,
- recording final decision.

### Current PoC

Partner can record final decision.

---

## 28. Investment Committee

Potential responsibilities include:

- collective review,
- discussion,
- approval,
- rejection,
- conditional decision.

### Current status

Formal IC mechanics are unresolved.

---

## 29. Administrator

Potential future responsibilities include:

- firm membership,
- access control,
- role assignment,
- policy,
- configuration,
- security administration.

### Current PoC

Admin is a prototype role and can perform final-decision actions.

It is not real firm administration.

---

# PART IX — ARTIFACT MODEL

---

## 30. Typical External Artifacts

KRAVV-IENT may need to work with:

- pitch deck,
- financial model,
- cap table,
- product documentation,
- customer references,
- founder meeting notes,
- data-room files,
- market research,
- legal documents,
- technical reports.

These remain source material.

---

## 31. Typical Internal Artifacts

Investment firms may produce:

- screening note,
- diligence tracker,
- research note,
- investment memo,
- recommendation,
- IC packet,
- decision record,
- portfolio update.

KRAVV-IENT should increasingly generate or structure these from the underlying case state rather than requiring them to become disconnected sources of truth.

---

## 32. Memo as Output

One important product stance:

> **The memo should be generated from the decision system; the decision system should not merely be a storage location for the memo.**

This is a major distinction.

If the memo is the only structured artifact, the underlying reasoning becomes difficult to query, compare, and update.

A structured case allows the system to later generate different views:

- screening summary,
- diligence brief,
- IC memo,
- portfolio history,
- thesis retrospective.

---

# PART X — KRAVV-IENT POSITION IN THE STACK

---

## 33. What KRAVV-IENT Owns

The strongest product boundary is:

> **Investment Case Intelligence**

KRAVV-IENT should own the structured decision history between source evidence and investment judgment.

Core ownership areas include:

- case context,
- evidence,
- analysis,
- challenge,
- diligence,
- human judgment,
- recommendation,
- decision history,
- thesis history,
- monitoring intelligence.

---

## 34. What KRAVV-IENT May Integrate With

Potential adjacent systems include:

### CRM

For:

- sourcing,
- relationship tracking,
- pipeline origin,
- contact history.

### Market Data

For:

- market size,
- comparable companies,
- financing history,
- industry data.

### Cloud Storage

For:

- source documents,
- data rooms,
- external files.

### Cap Table Systems

For:

- ownership,
- dilution,
- financing structure.

### Accounting / Finance

For:

- portfolio reporting,
- financial metrics.

### Legal Systems

For:

- term sheets,
- agreements,
- compliance.

### Communication Tools

For:

- email,
- messaging,
- internal discussion.

### Product principle

KRAVV-IENT should integrate rather than rebuild every surrounding business system.

---

# PART XI — CURRENT POC MAPPING

---

## 35. Domain Workflow vs Current Product

| Domain Activity | Current KRAVV-IENT PoC |
| --- | --- |
| Source opportunity | Supported through Company + Case creation |
| Basic screening | Context + evidence + analysis run |
| Founder meeting | Can be represented manually as source/evidence |
| Document intake | Functional private upload |
| Automatic extraction | Not implemented |
| Structured evidence | Functional, manual |
| Evidence verification | Human-assigned status only |
| Contradiction state | Functional |
| Analysis | Deterministic simulation |
| Analysis history | Functional, versioned snapshots |
| Diligence | Functional persistent questions |
| Human review | Functional |
| Recommendation | Functional |
| Final decision | Functional with prototype role gate |
| IC governance | Not implemented |
| Term-sheet workflow | Not implemented |
| Legal diligence | Generic evidence only |
| Portfolio transition | Functional |
| Monitoring | Functional, manual |
| Follow-on workflow | Not formalized |
| Exit workflow | Not implemented |
| Institutional memory | Foundational structure exists; intelligence not implemented |
| Real AI assistant | Not implemented |
| External research | Not implemented |

---

# PART XII — IDEAL FUTURE WORKFLOW

---

## 36. Future Investment Case Lifecycle

A future mature KRAVV-IENT may support a workflow such as:

**Opportunity Sourced**  
→ **Case Opened**  
→ **Initial Sources Collected**  
→ **Candidate Facts Extracted**  
→ **Evidence Structured**  
→ **Screening Analysis**  
→ **Founder Interaction**  
→ **Evidence Enriched**  
→ **Diligence Questions Generated**  
→ **Deep Diligence**  
→ **Contradictions Resolved / Preserved**  
→ **Pre-IC Analysis**  
→ **Human Review**  
→ **Recommendation**  
→ **IC Decision**  
→ **Term / Confirmatory Diligence**  
→ **Close**  
→ **Portfolio Monitoring**  
→ **Follow-on / Exit Decision**  
→ **Outcome Learning**

This is a vision model, not a final mandatory state machine.

---

## 37. Ideal Information Flow

A mature intelligence pipeline may look like:

**Source Document**  
→ **Extracted Candidate Claims**  
→ **Evidence Records**  
→ **Evidence Support / Conflict**  
→ **Derived Metrics**  
→ **Analysis**  
→ **Challenge**  
→ **Critical Unknowns**  
→ **Diligence**  
→ **Human Judgment**  
→ **Recommendation**  
→ **Decision**  
→ **Monitoring**  
→ **Outcome Learning**

The value is not simply automation.

The value is continuity.

---

# PART XIII — DOMAIN RISKS FOR PRODUCT DESIGN

---

## 38. Risk: Treating One Firm's Workflow as Universal

Different firms operate differently.

### Product response

Keep lifecycle configurable or loosely coupled where necessary.

Do not silently convert one prototype flow into universal business law.

---

## 39. Risk: Over-Structuring Too Early

Too much required structure can create data-entry burden before the team knows what matters.

### Product response

Allow lightweight case creation and progressive enrichment.

---

## 40. Risk: Under-Structuring Everything

If everything becomes free text, the system cannot reliably trace, compare, or learn.

### Product response

Structure high-value decision objects while allowing narrative context where necessary.

---

## 41. Risk: Treating Diligence as a Checklist

Diligence is context-specific.

### Product response

Support categories and reusable patterns without forcing one universal checklist.

---

## 42. Risk: Treating Analysis as Final Truth

Analysis is one interpretation of the current evidence.

### Product response

Preserve human review, history, and counter-analysis.

---

## 43. Risk: Treating Portfolio Monitoring as Separate Product History

If pre-investment reasoning disappears after investment, long-term learning is lost.

### Product response

Keep the original Investment Case connected to Portfolio history.

---

# PART XIV — DOMAIN LEARNING LOOP

---

## 44. How KRAVV-IENT Should Improve Domain Understanding

KRAVV-IENT itself can become a tool for learning the investment domain.

As the product evolves, future work should ask:

- Which workflow assumptions were wrong?
- Which stages vary by firm?
- Which information classes matter most?
- Which diligence questions recur?
- Which analysis outputs are genuinely useful?
- Which fields are unnecessary?
- Which decisions need stronger provenance?
- Which domain concepts deserve dedicated objects?

The product model should improve as domain understanding improves.

---

## 45. Domain Questions Still Open

The following should remain open until further research or product learning:

- exact lifecycle taxonomy,
- role taxonomy,
- screening gates,
- formal fund-fit model,
- IC process configuration,
- voting / approval mechanics,
- conditional decisions,
- term-sheet integration depth,
- legal diligence depth,
- follow-on case behavior,
- exit workflow,
- post-investment lifecycle,
- materiality ranking,
- diligence priority logic,
- external-source authority model,
- company-level vs case-level intelligence boundaries.

---

# PART XV — PRACTICAL ONBOARDING MODEL

---

## 46. How to Explain KRAVV-IENT to a Conventional VC Analyst

A practical onboarding explanation is:

> Start by creating an Investment Case.  
> Add the documents and information you actually receive.  
> Record important claims as structured evidence.  
> Mark what is reported, supported, verified, conflicting, or unknown.  
> Run analysis when you want a point-in-time synthesis.  
> Turn unresolved uncertainty into diligence questions.  
> Review the system's interpretation instead of treating it as final truth.  
> Record your recommendation separately from the final investment decision.  
> If the company is invested, keep the original thesis connected to later portfolio outcomes.

The system is not asking the analyst to stop thinking.

It is asking the analyst to make the reasoning more durable.

---

## 47. The Core Mental Model

The easiest way to remember the domain model is:

**Documents answer:**  
> What information was given to us?

**Evidence answers:**  
> What have we recorded as relevant information?

**Analysis answers:**  
> What might this information mean?

**Diligence answers:**  
> What do we still need to know?

**Human Review answers:**  
> Do we agree with the system's interpretation?

**Recommendation answers:**  
> What does the analyst think should happen?

**Decision answers:**  
> What was actually authorized?

**Monitoring answers:**  
> Did reality behave the way the thesis expected?

---

## 48. Final Domain Principle

KRAVV-IENT should not attempt to make venture capital simple.

Investment work is not simple.

The product should instead make the complexity:

- more structured,
- more traceable,
- more inspectable,
- more challengeable,
- more learnable.

The long-term product advantage is not that it removes uncertainty.

It is that it helps investment teams **work with uncertainty without losing the reasoning behind their decisions.**
