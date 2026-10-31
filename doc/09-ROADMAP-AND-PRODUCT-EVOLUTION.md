# KRAVV-IENT — Roadmap & Product Evolution

**Document ID:** 09  
**Document Type:** Canonical Product Evolution Roadmap  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Product maturity stages, evolution gates, sequencing logic, long-term milestones, and development direction  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document defines how KRAVV-IENT should evolve over time.

It is intentionally **not calendar-based**.

KRAVV-IENT currently has no fixed commercial deadline, so development should not be forced into artificial monthly or quarterly targets.

Instead, the project should evolve by maturity.

The roadmap should answer:

- What stage is KRAVV-IENT currently in?
- What should become true before moving forward?
- What capabilities belong together?
- What should not be built too early?
- How should the project grow without losing product coherence?
- How can development resume after a long pause without losing direction?

The governing principle is:

> **Do not move to the next stage because time passed. Move because the current stage has taught enough to justify the next one.**

---

# PART I — ROADMAP PHILOSOPHY

---

## 2. Maturity-Driven, Not Deadline-Driven

Traditional roadmaps often use:

- Q1,
- Q2,
- monthly release targets,
- fixed feature deadlines.

That approach is not appropriate for KRAVV-IENT at the current stage.

The project is exploratory.

Important product questions are still open.

Therefore the roadmap should use:

- maturity stages,
- exit criteria,
- learning goals,
- capability gates,
- explicit non-goals.

---

## 3. The Roadmap Is Direction, Not Obligation

This document should not become a rigid checklist.

A future discovery may justify:

- reordering stages,
- merging stages,
- skipping low-value features,
- splitting a stage,
- returning to an earlier assumption.

The roadmap exists to preserve direction.

It should not prevent learning.

---

## 4. Product Evolution Principle

KRAVV-IENT should evolve in this order:

> **Structure before intelligence.  
> Intelligence before automation.  
> Automation before scale.  
> Scale before enterprise complexity.**

This avoids building infrastructure around an unclear product.

---

# PART II — CURRENT POSITION

---

## 5. Current Stage

KRAVV-IENT currently sits at:

> **Stage 1 — Functional Workspace / Functional PoC Baseline**

The product already demonstrates:

- private local workspace access,
- Company and Investment Case separation,
- source storage,
- structured evidence,
- analysis readiness,
- simulated analysis,
- historical Analysis Runs,
- Diligence Questions,
- Human Review,
- Recommendation,
- Final Decision,
- Portfolio transition,
- Monitoring Updates,
- persistent local data,
- role gate demonstration,
- validation tests.

The core product system exists.

The next stages should deepen intelligence without replacing the structure.

---

# PART III — EVOLUTION MAP

---

## 6. Product Evolution Stages

The long-term roadmap is:

### Stage 1 — Functional Workspace
Prove the complete decision workflow.

### Stage 2 — Evidence Intelligence
Make source material easier to turn into trustworthy structured evidence.

### Stage 3 — Grounded Case Assistant
Add real LLM intelligence over explicit case context.

### Stage 4 — Real Analysis Engine
Replace simulated analysis with modular grounded intelligence.

### Stage 5 — Research & Challenge
Expand reasoning with external evidence and stronger counter-analysis.

### Stage 6 — Collaborative Investment Workflow
Support real teams, roles, review, and IC processes.

### Stage 7 — Institutional Decision Memory
Make historical reasoning reusable across cases.

### Stage 8 — Portfolio Intelligence
Connect original thesis with real-world outcomes.

### Stage 9 — Production Platform
Mature reliability, identity, tenancy, security, integrations, and operations.

These are maturity stages.

They are not deadlines.

---

# PART IV — STAGE 1: FUNCTIONAL WORKSPACE

---

## 7. Stage 1 Objective

> **Prove that the investment decision process can live inside one persistent product.**

This stage focuses on workflow coherence rather than real AI sophistication.

---

## 8. Stage 1 Core Capabilities

The stage includes:

- Access Gate,
- workspace identity,
- Company,
- Investment Case,
- Case Context,
- Source Documents,
- Structured Evidence,
- Analysis Readiness,
- simulated Analysis Runs,
- Diligence Questions,
- Human Review,
- Recommendation,
- Final Decision,
- Portfolio,
- Monitoring,
- persistence,
- history.

---

## 9. Stage 1 Current Status

**Substantially achieved.**

The remaining work at this stage should primarily be:

- product understanding,
- documentation,
- small bug fixes,
- usability refinement,
- validation.

Do not expand Stage 1 endlessly.

---

## 10. Stage 1 Exit Criteria

Stage 1 is mature enough when:

- a new user can understand the end-to-end workflow,
- a case can be created and reopened,
- source/evidence distinction is clear,
- analysis history survives changes,
- human/system judgment separation is visible,
- recommendation and decision remain separate,
- portfolio preserves original history,
- persistence is reliable enough for PoC learning.

The current project is close to or already beyond this threshold.

---

# PART V — STAGE 2: EVIDENCE INTELLIGENCE

---

## 11. Stage 2 Objective

> **Reduce the manual burden between raw source material and trustworthy structured evidence.**

This is the first major intelligence-enablement stage.

It should not begin with deep autonomous analysis.

It should begin with better evidence.

---

## 12. Stage 2 Candidate Capabilities

Potential work:

- document parsing,
- candidate claim extraction,
- source locators,
- evidence suggestions,
- duplicate detection,
- conflict assistance,
- normalization,
- deterministic financial inputs,
- provenance improvement.

---

## 13. Stage 2 Product Questions

This stage should learn:

- What evidence should be auto-extracted?
- Which evidence should remain human-entered?
- How much review is required?
- How should source locators work?
- How should candidate facts become persistent evidence?
- What does “Verified” really mean?
- How should duplicate claims be merged or preserved?

---

## 14. Stage 2 Non-Goals

Do not automatically:

- make final recommendations,
- make investment decisions,
- rewrite historical evidence,
- mark extracted data Verified without process,
- introduce cross-case intelligence too early.

---

## 15. Stage 2 Exit Criteria

Stage 2 is mature when:

- documents can generate useful candidate evidence,
- provenance is inspectable,
- extraction errors can be corrected,
- conflicting values remain visible,
- deterministic metrics have trustworthy inputs,
- the user saves meaningful time without losing control.

---

# PART VI — STAGE 3: GROUNDED CASE ASSISTANT

---

## 16. Stage 3 Objective

> **Allow users to interact naturally with the Investment Case while keeping every answer grounded in case state.**

This is the recommended first real LLM phase.

---

## 17. Stage 3 Candidate Capabilities

- case-aware Q&A,
- evidence retrieval,
- finding explanation,
- run comparison,
- contradiction inspection,
- thesis challenge,
- diligence suggestion,
- source references,
- limitation-aware responses.

---

## 18. Stage 3 Initial Authority Boundary

The assistant should initially be:

- read-oriented,
- explanation-oriented,
- suggestion-oriented.

It should not automatically:

- edit evidence,
- change status,
- record decisions,
- alter recommendations,
- create portfolio state.

---

## 19. Stage 3 Architecture Goal

The architecture should resemble:

**Question**  
→ **Intent Resolver**  
→ **Case Context Builder**  
→ **Relevant Retrieval**  
→ **Provider Adapter**  
→ **Grounded Response**  
→ **Evidence References**

---

## 20. Stage 3 Learning Goals

This stage should answer:

- Which questions users actually ask?
- How much context is enough?
- How should evidence references appear?
- When does the assistant need retrieval?
- What failure behavior is acceptable?
- How useful is thesis challenge in practice?

---

## 21. Stage 3 Exit Criteria

Stage 3 is mature when:

- factual answers reliably use case evidence,
- conflicting facts remain visible,
- unsupported questions produce limitations,
- run comparison is understandable,
- provider failures do not break the workspace,
- the assistant feels native to the Investment Case.

---

# PART VII — STAGE 4: REAL ANALYSIS ENGINE

---

## 22. Stage 4 Objective

> **Replace deterministic simulation with real modular intelligence while preserving historical analysis semantics.**

---

## 23. Stage 4 Candidate Pipeline

**Evidence Preparation**  
→ **Derived Metrics**  
→ **Category Analysis**  
→ **Challenge Pass**  
→ **Synthesis**  
→ **Validation**  
→ **Saved Analysis Run**

---

## 24. Stage 4 Candidate Analysis Areas

Potential dimensions:

- Team,
- Product,
- Technology,
- Market,
- Competition,
- Customers,
- Traction,
- Business Model,
- Financials,
- Capital Structure,
- Legal / Regulatory,
- Fund Fit,
- Risks,
- Unknowns.

Not every dimension needs equal weight.

---

## 25. Stage 4 Architectural Rules

Preserve:

- evidence snapshots,
- model/prompt versioning,
- provider abstraction,
- deterministic calculations,
- source references,
- human review separation.

---

## 26. Stage 4 Non-Goals

Do not:

- collapse analysis into one universal score,
- allow model output to replace evidence,
- let model changes rewrite old runs,
- force one giant prompt architecture.

---

## 27. Stage 4 Exit Criteria

Stage 4 is mature when:

- real runs are grounded,
- findings are evidence-linked,
- calculations are deterministic,
- challenge is meaningful,
- historical runs remain stable,
- human review remains useful.

---

# PART VIII — STAGE 5: RESEARCH & CHALLENGE

---

## 28. Stage 5 Objective

> **Expand intelligence beyond supplied documents and strengthen adversarial reasoning.**

---

## 29. External Research Capabilities

Potential sources:

- company websites,
- public filings,
- market reports,
- competitor websites,
- product documentation,
- news,
- public repositories,
- investment databases.

---

## 30. External Evidence Rules

External evidence should remain distinguishable from:

- founder claims,
- company-provided documents,
- internal analysis.

---

## 31. Challenge Engine Capabilities

Potential capabilities:

- counter-thesis,
- downside scenario,
- unsupported claim detection,
- alternative interpretation,
- historical analogy,
- assumption stress test,
- missing evidence discovery.

---

## 32. Stage 5 Exit Criteria

Stage 5 is mature when:

- external evidence retains provenance,
- challenge improves decision quality,
- research sources are inspectable,
- source trust is understandable,
- research does not create opaque AI summaries.

---

# PART IX — STAGE 6: COLLABORATIVE INVESTMENT WORKFLOW

---

## 33. Stage 6 Objective

> **Move from a single-user intelligence workspace toward a real team operating environment.**

---

## 34. Candidate Capabilities

- organization tenancy,
- membership,
- real roles,
- case assignment,
- comments,
- mentions,
- review requests,
- approval workflows,
- restricted cases,
- real decision authority.

---

## 35. Investment Committee Capabilities

Potential:

- pre-read,
- participant list,
- comments,
- unresolved questions,
- dissent,
- approval,
- conditional decision,
- rationale,
- follow-up actions.

---

## 36. Stage 6 Product Questions

- Which firm workflows are configurable?
- Which roles are universal?
- How should dissent work?
- Is voting required?
- How should conditional approval work?
- How are external specialists included?

---

## 37. Stage 6 Exit Criteria

Stage 6 is mature when:

- multiple users can safely collaborate,
- role authority is real,
- case ownership works,
- decisions remain attributable,
- permissions are enforced server-side,
- the product supports team workflow without becoming noisy.

---

# PART X — STAGE 7: INSTITUTIONAL DECISION MEMORY

---

## 38. Stage 7 Objective

> **Turn historical case records into reusable institutional intelligence.**

This stage is where the accumulated data becomes strategically valuable.

---

## 39. Candidate Capabilities

- cross-case search,
- historical thesis retrieval,
- precedent discovery,
- similar-case comparison,
- pattern detection,
- decision recall,
- firm-specific learning.

---

## 40. Example Questions

- Which previous cases looked similar?
- Where did we underestimate churn?
- Which market assumptions repeatedly failed?
- Which founder claims historically proved reliable?
- Which passed companies later became successful?

---

## 41. Stage 7 Risks

Potential risks:

- hindsight bias,
- overgeneralization,
- confidential data leakage,
- weak comparability,
- false causal inference.

---

## 42. Stage 7 Exit Criteria

Stage 7 is mature when:

- historical retrieval is accurate,
- case provenance remains visible,
- cross-case reasoning respects permissions,
- users can learn from history without flattening context.

---

# PART XI — STAGE 8: PORTFOLIO INTELLIGENCE

---

## 43. Stage 8 Objective

> **Close the loop between investment thesis and actual company outcome.**

---

## 44. Candidate Capabilities

- automated monitoring,
- metric ingestion,
- thesis tracking,
- alerts,
- milestone comparison,
- portfolio risk summary,
- follow-on intelligence,
- outcome learning.

---

## 45. Expected vs Actual

A core capability should compare:

**Expected at investment**  
with  
**Observed later**

This may apply to:

- growth,
- margin,
- hiring,
- product milestones,
- market expansion,
- partnerships,
- regulatory risk.

---

## 46. Stage 8 Learning Goal

The system should help answer:

> What did we get right?

> What did we get wrong?

> What should the firm learn?

---

## 47. Stage 8 Exit Criteria

Stage 8 is mature when:

- original thesis remains visible,
- monitoring uses reliable data,
- material changes are detectable,
- outcome learning is grounded,
- follow-on decisions can use prior history.

---

# PART XII — STAGE 9: PRODUCTION PLATFORM

---

## 48. Stage 9 Objective

> **Turn KRAVV-IENT from a high-quality product system into a dependable production platform.**

---

## 49. Candidate Production Capabilities

- production identity,
- organization tenancy,
- SSO,
- MFA/passkeys,
- RBAC,
- audit trails,
- managed database,
- managed storage,
- backups,
- disaster recovery,
- observability,
- rate limiting,
- secret management,
- infrastructure security,
- deployment pipelines.

---

## 50. Integration Maturity

Potential integrations:

- CRM,
- Google Drive,
- market data providers,
- cap table tools,
- accounting systems,
- email,
- Slack,
- legal/data-room tools.

---

## 51. Stage 9 Exit Criteria

Production readiness requires more than passing builds.

It may eventually require:

- operational reliability,
- security testing,
- data recovery,
- tenancy isolation,
- support processes,
- deployment discipline,
- organization controls.

---

# PART XIII — ROADMAP GATES

---

## 52. Gate 1 — Product Comprehension

Before deeper automation:

> Can a human understand the workflow without AI?

If not, fix the product model first.

---

## 53. Gate 2 — Evidence Integrity

Before advanced analysis:

> Can the system reliably distinguish source, evidence, calculation, and interpretation?

If not, do not increase reasoning complexity.

---

## 54. Gate 3 — Historical Integrity

Before collaborative or cross-case intelligence:

> Are historical runs, reviews, recommendations, and decisions preserved correctly?

---

## 55. Gate 4 — Human Authority

Before assistant write-actions:

> Is user confirmation explicit and auditable?

---

## 56. Gate 5 — Privacy

Before real AI sends confidential context externally:

> Are provider boundaries understood?

---

## 57. Gate 6 — Team Governance

Before production collaboration:

> Are roles, permissions, and decision authority understood?

---

# PART XIV — LEARNING LOOPS

---

## 58. Every Stage Should Produce Learning

Each stage should generate product knowledge.

A stage is not complete merely because code exists.

---

## 59. Product Learning Questions

After a stage, ask:

- What assumptions were wrong?
- What users actually needed?
- What fields were unnecessary?
- Which objects should change?
- Which workflow steps caused friction?
- Which intelligence outputs were trusted?
- Which outputs were ignored?

---

## 60. Technical Learning Questions

Ask:

- Which abstractions held?
- Which storage model became limiting?
- Which tests protected real behavior?
- Which integration was fragile?
- Which provider constraints mattered?

---

# PART XV — ROADMAP PRIORITY MODEL

---

## 61. Priority Should Follow Product Leverage

A feature should be prioritized when it strongly improves:

- decision traceability,
- evidence quality,
- user comprehension,
- analytical leverage,
- learning,
- workflow continuity.

---

## 62. Priority Should Not Follow Novelty

Do not prioritize something because it is:

- trendy,
- visually impressive,
- technically difficult,
- AI-heavy,
- fashionable.

Novelty is not product value.

---

# PART XVI — FEATURE CANDIDATE CLASSIFICATION

---

## 63. Now

Features that strengthen the current stage.

Examples:

- documentation,
- usability fixes,
- missing current-state clarity,
- validation.

---

## 64. Next

Features that naturally enable the next maturity stage.

Current likely category:

- grounded assistant,
- provider abstraction,
- evidence retrieval,
- limited real LLM integration.

---

## 65. Later

Capabilities that depend on more mature foundations.

Examples:

- automated extraction,
- advanced RAG,
- external research,
- collaboration,
- institutional memory.

---

## 66. Future / Research

Ideas that are interesting but not yet validated enough to schedule.

Examples:

- sophisticated firm learning,
- automatic thesis calibration,
- advanced multi-agent research,
- predictive portfolio intelligence.

---

# PART XVII — PROTECTED NON-GOALS

---

## 67. Do Not Rush Production Security

Production hardening should not be implemented before the product model stabilizes.

---

## 68. Do Not Rush Multi-User Collaboration

Collaboration dramatically increases complexity.

Add it when single-user workflow is understood.

---

## 69. Do Not Rush Full RAG

Structured case objects may solve many retrieval needs before vector infrastructure is necessary.

---

## 70. Do Not Rush Multi-Agent Architecture

Multiple agents should only exist when distinct responsibilities justify them.

Avoid complexity theater.

---

## 71. Do Not Rush Universal Scoring

Investment reasoning should remain richer than one number.

---

# PART XVIII — OPTIONAL EXPERIMENT TRACKS

---

## 72. Experiments Can Run Beside the Main Roadmap

Some ideas may be explored without becoming core architecture.

Examples:

- different LLM providers,
- alternate extraction models,
- UI experiments,
- scoring prototypes,
- retrieval methods,
- market-data integrations.

---

## 73. Experiment Rule

An experiment should be clearly labeled:

> Experimental

and should not silently redefine the product.

---

# PART XIX — DOCUMENTATION EVOLUTION

---

## 74. Documentation Is Part of the Roadmap

As the product evolves:

- current-state docs should update,
- vision docs should remain directional,
- historical reports should remain preserved,
- decision records should explain major changes.

---

## 75. Required Documentation Update Triggers

Update canonical docs when:

- a major product object changes,
- a previously simulated capability becomes real,
- a business rule is approved,
- a new maturity stage begins,
- security boundaries change,
- persistence architecture changes materially.

---

# PART XX — VERSIONING THE PRODUCT

---

## 76. Milestone Naming

Potential product milestones may use capability names rather than calendar labels.

Examples:

- Functional PoC
- Evidence Intelligence
- Grounded Assistant
- Real Analysis
- Collaborative Workflow
- Institutional Memory

---

## 77. Avoid Artificial Major Versions

Do not call something “v4” only because a lot of time passed.

Versioning should reflect meaningful product change.

---

# PART XXI — PAUSE & RESUME STRATEGY

---

## 78. The Project Should Survive Pauses

KRAVV-IENT is a long-term personal project.

Development may pause for:

- school,
- work,
- exams,
- other projects,
- personal priorities.

That is acceptable.

---

## 79. Resume Procedure

When returning after a long pause:

1. Read Project Overview.
2. Read Product Vision.
3. Read Current Functional PoC State.
4. Read this Roadmap.
5. Check latest repository commit.
6. Run the current system.
7. Revisit open questions.
8. Continue from the current maturity stage.

This prevents unnecessary project reconstruction.

---

# PART XXII — CURRENT NEAR-TERM DIRECTION

---

## 80. Current Recommended Next Direction

Given the current baseline, the strongest next intelligence experiment is:

> **Grounded read-only Investment Case Assistant with a real LLM provider.**

This is preferred over immediately building:

- full automatic extraction,
- multi-agent research,
- firm collaboration,
- advanced portfolio automation.

---

## 81. Why This Is the Right Next Experiment

It tests:

- real model integration,
- case context assembly,
- evidence grounding,
- provider abstraction,
- response quality,
- source referencing,
- failure handling,

while preserving the current product structure.

---

## 82. Possible Prototype Provider

A low-cost/free-tier provider can be used for experimentation.

The provider should remain replaceable.

The provider choice is not a roadmap commitment.

---

# PART XXIII — CURRENT PROJECT CHECKPOINT

---

## 83. Current Baseline Summary

KRAVV-IENT currently has:

- functional workspace,
- persistent local identity,
- current case architecture,
- source/evidence separation,
- simulated historical analysis,
- diligence,
- human review,
- recommendation,
- final decision,
- portfolio,
- monitoring,
- design language,
- documentation foundation.

This means future work can now focus on **quality of intelligence** rather than inventing the basic product.

---

# PART XXIV — SUCCESS CRITERIA BY MATURITY

---

## 84. Functional Workspace Success

> A user can complete the full decision journey.

---

## 85. Evidence Intelligence Success

> Raw information becomes structured evidence faster without losing provenance.

---

## 86. Grounded Assistant Success

> A user can ask natural questions and receive case-grounded answers.

---

## 87. Real Analysis Success

> Real model reasoning produces inspectable, historically stable analysis.

---

## 88. Research & Challenge Success

> The system expands and challenges understanding instead of only summarizing supplied information.

---

## 89. Collaboration Success

> Multiple users can work together without losing authority, history, or clarity.

---

## 90. Institutional Memory Success

> Historical decisions become reusable intelligence.

---

## 91. Portfolio Intelligence Success

> The firm can compare original beliefs with actual outcomes.

---

## 92. Production Success

> The system is reliable, secure, governable, and operable for sustained real-world use.

---

# PART XXV — ROADMAP RISKS

---

## 93. Risk: Feature Expansion Before Learning

Adding too many features may hide weak assumptions.

### Mitigation

Use stage exit criteria.

---

## 94. Risk: AI Becomes the Product

The product could drift into a generic assistant.

### Mitigation

Keep Investment Case architecture central.

---

## 95. Risk: Architecture Over-Engineering

Future needs could be guessed too early.

### Mitigation

Build for current stage plus clear next-stage needs.

---

## 96. Risk: Endless PoC

The project could remain permanently in prototype mode.

### Mitigation

Use maturity criteria and consciously declare stage transitions.

---

## 97. Risk: Premature Enterprise Complexity

Security, tenancy, compliance, and collaboration could consume the project before user value is proven.

### Mitigation

Delay enterprise infrastructure until the product model justifies it.

---

# PART XXVI — ROADMAP GOVERNANCE

---

## 98. Who Changes the Roadmap

The roadmap can change when product learning justifies it.

Changes should explain:

- what changed,
- why,
- what evidence supports the change,
- which stage is affected.

---

## 99. Roadmap Decisions Should Be Explicit

Examples:

> Grounded Assistant moved before Extraction because structured evidence already supports useful Q&A.

or:

> Automatic extraction moved earlier because manual evidence entry became the primary workflow bottleneck.

This creates product reasoning history.

---

# PART XXVII — FINAL ROADMAP VIEW

---

## 100. Long-Term Evolution

The full evolution can be summarized as:

**Functional Workspace**  
→ **Evidence Intelligence**  
→ **Grounded Assistant**  
→ **Real Analysis Engine**  
→ **Research & Challenge**  
→ **Collaborative Workflow**  
→ **Institutional Decision Memory**  
→ **Portfolio Intelligence**  
→ **Production Platform**

The sequence is directional.

The project may evolve differently as learning accumulates.

---

## 101. Final Roadmap Principle

KRAVV-IENT does not need to be finished quickly.

It needs to become more coherent with each stage.

The strongest development strategy is therefore:

> **Build enough to learn.  
> Learn enough to decide.  
> Decide enough to build the next layer deliberately.**

The roadmap exists so the project can be paused, resumed, improved, and expanded without losing its identity.

The long-term goal is not maximum feature count.

The goal is a system that becomes progressively better at preserving and compounding investment intelligence.
