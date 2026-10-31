# KRAVV-IENT — Intelligence & AI Architecture Vision

**Document ID:** 06  
**Document Type:** Canonical Intelligence & AI Architecture Vision  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Vision Document  
**Scope:** AI architecture, grounded intelligence, extraction, retrieval, assistant behavior, challenge systems, provider abstraction, and future intelligence maturity  
**Current Product Stage:** Functional Proof of Concept with Simulated Intelligence  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document defines how intelligence should evolve inside KRAVV-IENT.

It does not describe only one chatbot.

It defines the broader intelligence architecture that may eventually support:

- document extraction,
- structured evidence generation,
- deterministic metrics,
- grounded analysis,
- case-aware assistant interaction,
- contradiction detection,
- diligence generation,
- challenge and counter-analysis,
- external research,
- cross-case retrieval,
- portfolio monitoring intelligence,
- institutional decision memory.

The purpose is to ensure that future AI work strengthens the product model rather than bypassing it.

The central rule is:

> **AI should operate through the Investment Case architecture, not around it.**

---

# PART I — INTELLIGENCE THESIS

---

## 2. Core Intelligence Thesis

KRAVV-IENT should not become:

> User prompt → LLM → answer

The target architecture is closer to:

> **User / System Intent → Context Assembly → Evidence Retrieval → Deterministic Processing → Model Reasoning → Challenge → Grounded Output → Human Review → Persistent Action only when confirmed**

The model is one component inside a larger decision system.

---

## 3. Intelligence Exists Above Product Structure

The current Functional PoC already contains:

- Company,
- Investment Case,
- Source Documents,
- Structured Evidence,
- Analysis Runs,
- Diligence Questions,
- Human Reviews,
- Recommendations,
- Decisions,
- Portfolio history.

Future intelligence should consume and enrich these objects.

It should not replace them with a chat transcript.

---

## 4. Intelligence Objective

The long-term objective is:

> **Turn fragmented investment information into explainable, traceable, challengeable, and reusable decision intelligence.**

This means AI should help answer:

- What do we know?
- What is only claimed?
- What conflicts?
- What is missing?
- What does the evidence imply?
- What alternative interpretation exists?
- What should we investigate next?
- What changed since the last analysis?
- Why did the team make this decision?
- What happened afterward?

---

# PART II — CURRENT BASELINE

---

## 5. Current Intelligence State

Today, KRAVV-IENT uses a deterministic simulated analysis layer.

Current intelligence behavior:

- does not call a live LLM,
- does not extract uploaded documents,
- does not run RAG,
- does not research externally,
- does not verify claims independently,
- does not discover contradictions automatically,
- does not perform autonomous monitoring.

The current product therefore proves workflow and history before real AI is introduced.

---

## 6. Why This Order Is Intentional

Real AI was deliberately deferred until the product structure existed.

This reduces the risk of building:

- a generic AI wrapper,
- a pitch-deck summarizer,
- a chatbot without product memory,
- analysis without provenance,
- model output that cannot be tied to workflow state.

The current architecture gives future intelligence a stable place to operate.

---

# PART III — TARGET INTELLIGENCE LAYERS

---

## 7. Layered Intelligence Architecture

A mature KRAVV-IENT may contain several distinct intelligence layers.

### Layer 1 — Ingestion

Receives:

- source documents,
- notes,
- structured inputs,
- external data.

### Layer 2 — Extraction

Produces:

- candidate claims,
- candidate facts,
- entities,
- dates,
- metrics,
- source locators.

### Layer 3 — Evidence Structuring

Transforms extracted candidates into:

- Structured Evidence,
- provenance,
- support relationships,
- conflict relationships,
- verification state.

### Layer 4 — Deterministic Computation

Produces:

- ratios,
- growth rates,
- runway,
- margins,
- valuation math,
- ownership math,
- scenario outputs.

### Layer 5 — Analytical Reasoning

Produces:

- findings,
- synthesis,
- interpretation,
- risks,
- opportunities,
- unknowns.

### Layer 6 — Challenge

Produces:

- counterarguments,
- contradictory interpretations,
- missing evidence,
- downside scenarios,
- assumption stress tests.

### Layer 7 — Diligence

Produces:

- suggested questions,
- investigation priorities,
- follow-up work.

### Layer 8 — Human Interaction

Supports:

- assistant Q&A,
- explanation,
- comparison,
- review,
- confirmation.

### Layer 9 — Decision Memory

Preserves:

- human judgment,
- recommendations,
- decisions,
- historical context.

### Layer 10 — Learning

Eventually compares:

- prior thesis,
- later outcomes,
- repeated patterns,
- institutional lessons.

---

# PART IV — NEAR-TERM REAL INTELLIGENCE PHASE

---

## 8. First Real AI Milestone

The first real intelligence milestone should be intentionally narrow.

Recommended scope:

> **Grounded read-only Investment Case Assistant**

This milestone should prove that a real LLM can reason over KRAVV-IENT case context without bypassing evidence provenance or decision boundaries.

---

## 9. Near-Term Assistant Goals

The first real assistant should be able to:

- answer questions about the current Investment Case,
- summarize current evidence,
- explain current findings,
- identify visible conflicts,
- list unknowns,
- compare Analysis Runs,
- suggest diligence questions,
- challenge the current thesis,
- explain why a conclusion is limited,
- reference relevant evidence.

It should not initially:

- edit evidence automatically,
- mark evidence Verified,
- change recommendations,
- record final decisions,
- create portfolio entries,
- silently mutate persistent case state.

---

## 10. Near-Term Assistant Architecture

A practical first architecture:

**User Question**  
→ **Intent Resolver**  
→ **Case Context Builder**  
→ **Relevant Evidence / Run Selection**  
→ **Prompt / Context Assembly**  
→ **LLM Provider Adapter**  
→ **Grounded Response**  
→ **Evidence References**  
→ **Optional Human-Saved Action**

The goal is not maximum sophistication.

The goal is trustworthy integration with the existing product.

---

# PART V — CASE CONTEXT BUILDER

---

## 11. Purpose

The Case Context Builder should prepare only the information needed for the current intelligence task.

It should not blindly send the entire workspace to the model.

---

## 12. Context Sources

Potential context inputs include:

- Company identity,
- Investment Case metadata,
- current case context,
- current Structured Evidence,
- evidence status,
- selected Analysis Run,
- historical Analysis Runs,
- findings,
- contradictions,
- unknowns,
- diligence questions,
- Human Reviews,
- Recommendations,
- Final Decisions,
- Portfolio updates.

---

## 13. Context Selection

Context should be task-sensitive.

Example:

Question:

> “What changed between Run #1 and Run #2?”

The assistant needs:

- Run #1 snapshot,
- Run #2 snapshot,
- findings from both,
- evidence deltas.

It does not necessarily need the entire workspace.

---

## 14. Context Budget

Model context is finite and may be expensive.

The architecture should therefore prefer:

- structured retrieval,
- summarized stable context,
- selected evidence,
- referenced historical objects,
- incremental context assembly.

Avoid:

- sending every document,
- sending the entire database,
- duplicating large context blocks,
- including irrelevant historical cases.

---

# PART VI — INTENT RESOLUTION

---

## 15. Why Intent Matters

Different user questions require different system behavior.

Examples:

> “What ARR is recorded?”

This is primarily a factual retrieval question.

> “Is growth quality strong?”

This is interpretive.

> “What changed since the last run?”

This is comparative.

> “Challenge my thesis.”

This is adversarial analytical reasoning.

> “Create a diligence question.”

This is a proposed write-action.

The intelligence layer should recognize these differences.

---

## 16. Possible Intent Classes

A future resolver may distinguish:

- factual retrieval,
- evidence lookup,
- analysis explanation,
- run comparison,
- contradiction inspection,
- diligence suggestion,
- thesis challenge,
- portfolio monitoring query,
- workflow navigation,
- write-action request.

The exact taxonomy should remain flexible.

---

# PART VII — EVIDENCE RETRIEVAL

---

## 17. Retrieval Principle

> **Retrieve structured evidence before relying on free-form model memory.**

The assistant should prefer current case records as the authoritative local context.

---

## 18. Retrieval Priority

A possible priority order:

1. Structured Evidence
2. Analysis Run snapshot
3. Source references
4. Human Reviews
5. Diligence records
6. Recommendation / Decision
7. Portfolio updates
8. External research where explicitly enabled

---

## 19. Current Structured Retrieval Before RAG

The first real assistant does not necessarily require a full vector database.

Because the current PoC already contains structured objects, an early implementation may retrieve directly by:

- case ID,
- object type,
- status,
- run ID,
- source reference,
- timestamps.

A vector or embedding layer should be introduced only when it solves an actual retrieval problem.

---

# PART VIII — RAG VISION

---

## 20. RAG Is a Capability, Not the Product

Retrieval-Augmented Generation may become useful when:

- source documents become large,
- evidence history grows,
- many cases exist,
- cross-case search becomes important.

RAG should not be added only because it is common in AI products.

---

## 21. Future RAG Layers

A future retrieval system may contain:

### Structured retrieval

For:

- evidence,
- runs,
- decisions,
- company metadata.

### Semantic retrieval

For:

- long documents,
- notes,
- meeting transcripts,
- historical narrative.

### Hybrid retrieval

Combines:

- filters,
- keywords,
- embeddings,
- case boundaries,
- source quality.

---

## 22. Retrieval Boundaries

Future retrieval must respect:

- workspace ownership,
- case access,
- organization permissions,
- document permissions,
- historical boundaries.

Cross-case intelligence should never bypass access control.

---

# PART IX — DOCUMENT EXTRACTION

---

## 23. Extraction Principle

> **Extraction should produce candidates, not unquestionable truth.**

A model may extract:

> ARR = $4.2M

But the system should preserve:

- source,
- page/locator,
- original excerpt,
- extraction method,
- confidence/quality signal where meaningful.

---

## 24. Proposed Extraction Pipeline

**Document Upload**  
→ **Document Parsing**  
→ **Chunk / Section Identification**  
→ **Candidate Claim Extraction**  
→ **Normalization**  
→ **Source Linking**  
→ **Duplicate / Conflict Check**  
→ **Human Review or Rule-Based Acceptance**  
→ **Structured Evidence**

---

## 25. Candidate Evidence State

Future extracted information may enter as:

- Candidate,
- Unreviewed,
- Proposed Evidence,

rather than immediately becoming canonical Structured Evidence.

Exact terminology remains open.

---

## 26. Extraction Scope

Potential source types:

- PDF pitch decks,
- financial spreadsheets,
- text documents,
- meeting notes,
- transcripts,
- data-room files.

Each format may require different extraction strategies.

---

# PART X — EVIDENCE GRAPH VISION

---

## 27. Evidence Graph Concept

A mature intelligence layer may understand relationships such as:

**Source**  
→ states **Claim**

**Source B**  
→ supports **Claim**

**Source C**  
→ contradicts **Claim**

**Claim**  
→ becomes **Structured Evidence**

**Evidence**  
→ supports **Finding**

**Finding**  
→ contributes to **Recommendation**

**Decision**  
→ later compared with **Outcome**

---

## 28. Why a Graph Matters

The value is not visual graph UI.

The value is relationship-aware intelligence.

The system may eventually answer:

- Which findings depend on this claim?
- Which decisions relied on this evidence?
- Which source conflicts with this metric?
- What changed after this new document arrived?
- Which evidence remains single-source?

---

# PART XI — DETERMINISTIC INTELLIGENCE

---

## 29. Deterministic Financial Layer

Certain analytical work should not be delegated to an LLM.

Potential deterministic calculations:

- ARR growth,
- MRR growth,
- gross margin,
- burn multiple,
- runway,
- CAC,
- LTV,
- retention,
- concentration,
- ownership,
- dilution,
- valuation multiples,
- scenario arithmetic.

---

## 30. Calculation Architecture

Conceptually:

**Structured Inputs**  
→ **Validated Numeric Types**  
→ **Deterministic Formula**  
→ **Derived Metric**  
→ **Source Input References**

Each output should be reproducible.

---

## 31. LLM Role Around Calculations

The LLM may explain:

> “Burn multiple is high relative to growth.”

But it should not invent or inconsistently calculate the burn multiple when deterministic code can calculate it.

---

# PART XII — ANALYSIS ENGINE VISION

---

## 32. Modular Analysis

A future real Analysis Run should not necessarily use one giant prompt.

A more robust architecture may use:

1. evidence preparation,
2. metric computation,
3. category analysis,
4. challenge pass,
5. synthesis pass,
6. source/reference validation,
7. persistence.

---

## 33. Candidate Analysis Categories

Potential categories include:

- Team
- Product
- Technology
- Market
- Competition
- Traction
- Customers
- Business Model
- Financials
- Capital Structure
- Legal / Regulatory
- Fund Fit
- Key Risks
- Critical Unknowns

This list is directional.

Not every case requires equal depth in every category.

---

## 34. Analysis Output Contract

A mature finding should ideally separate:

### Observation

What the evidence shows.

### Interpretation

What it may mean.

### Supporting Evidence

What supports the interpretation.

### Counter-Evidence

What weakens it.

### Uncertainty

What remains unresolved.

### Implication

Why it matters.

This structure is preferable to an opaque paragraph.

---

# PART XIII — CHALLENGE ENGINE

---

## 35. Challenge Is a Separate Intelligence Function

The system should not only produce a thesis.

It should challenge the thesis.

A future architecture may run a separate challenge pass after initial analysis.

---

## 36. Challenge Inputs

Challenge may inspect:

- current thesis,
- supporting findings,
- contradictory evidence,
- unknowns,
- diligence gaps,
- historical comparable cases.

---

## 37. Challenge Outputs

Potential outputs:

- strongest counterargument,
- assumption risk,
- evidence weakness,
- missing alternative explanation,
- downside scenario,
- confirmation-bias warning,
- contradiction requiring resolution.

---

## 38. Challenge Should Not Become Artificial Negativity

The purpose is not to produce a bearish answer.

The purpose is to test robustness.

A strong thesis may survive the challenge.

---

# PART XIV — DILIGENCE INTELLIGENCE

---

## 39. Diligence Generation

AI may help transform uncertainty into useful questions.

A good diligence suggestion should explain:

- what is unknown,
- why it matters,
- which evidence triggered the question,
- what information could resolve it.

---

## 40. Diligence Priority

Future prioritization may consider:

- materiality,
- decision impact,
- evidence weakness,
- contradiction severity,
- time sensitivity.

No universal priority model is currently approved.

---

## 41. Persistence Boundary

Generated diligence remains a suggestion until explicitly accepted.

The human decides whether it becomes a persistent Diligence Question.

---

# PART XV — GROUNDED ASSISTANT VISION

---

## 42. Assistant Identity

The KRAVV-IENT assistant should feel like:

> **an intelligence interface to the Investment Case**

not:

> a generic chatbot embedded in a sidebar.

---

## 43. Assistant Modes

Potential modes may include:

### Explain

“Why did this finding appear?”

### Retrieve

“What ARR is currently recorded?”

### Compare

“What changed since Run #1?”

### Challenge

“What is the strongest argument against our thesis?”

### Diligence

“What should we ask the founder next?”

### Historical

“Why did we pass on this company last year?”

### Portfolio

“Which original assumptions have changed?”

---

## 44. Response Structure

Depending on intent, a grounded response may contain:

- Direct Answer
- Evidence
- Interpretation
- Limitation
- Relevant Sources
- Optional Suggested Next Step

Not every response needs every section.

The structure should fit the question.

---

## 45. Factual Questions

For factual retrieval:

> “What ARR is recorded?”

The assistant should retrieve the Structured Evidence.

If conflicting values exist, it should say so.

It should not choose silently.

---

## 46. Interpretive Questions

For interpretation:

> “Is growth quality strong?”

The assistant may reason.

But it should separate:

**Evidence**  
from  
**Interpretation**

and expose relevant limitations.

---

## 47. Unsupported Questions

If the current case does not support an answer:

> “The current case does not contain enough evidence to answer that reliably.”

This is successful behavior.

---

# PART XVI — WRITE-ACTION ARCHITECTURE

---

## 48. Read First, Write Later

The first real assistant should be primarily read-oriented.

This reduces the risk of model-driven product corruption.

---

## 49. Future Write Actions

Possible future assistant actions:

- draft evidence candidate,
- draft diligence question,
- draft note,
- draft recommendation,
- propose context update.

---

## 50. Confirmation Pattern

For material writes:

**AI proposes**  
→ **User reviews**  
→ **User confirms**  
→ **System persists**  
→ **Activity records action**

---

## 51. Restricted Actions

AI should not autonomously:

- mark final verification,
- record final investment decision,
- delete historical state,
- change role authority,
- remove source evidence.

These would require explicit product reconsideration.

---

# PART XVII — EXTERNAL RESEARCH

---

## 52. Research Layer

Future external research may enrich the Investment Case.

Potential sources:

- company website,
- public filings,
- market reports,
- news,
- competitor sites,
- developer documentation,
- public repositories,
- investment databases,
- regulatory information.

---

## 53. Research Provenance

External findings should preserve:

- source URL/reference,
- retrieval date,
- source type,
- extracted claim,
- supporting excerpt where appropriate,
- relationship to existing evidence.

---

## 54. Company Claim vs External Evidence

The product should make it possible to show:

> Company-reported claim

and separately:

> External supporting / conflicting evidence

This is preferable to blending both into one AI answer.

---

# PART XVIII — PROVIDER ABSTRACTION

---

## 55. Provider Independence

KRAVV-IENT should not be structurally dependent on a single model provider.

Conceptually:

**Intelligence Service**  
→ **Provider Adapter**  
→ **Provider / Model**

---

## 56. Near-Term Provider Choice

A low-cost or free-tier provider may be appropriate for early experimentation.

That provider choice should be treated as:

**prototype infrastructure**

not:

**product identity**

The architecture should make later migration possible.

---

## 57. Provider Adapter Responsibilities

An adapter may normalize:

- model request,
- response format,
- errors,
- timeouts,
- token usage,
- rate limits,
- model identity,
- streaming behavior.

---

## 58. Multi-Provider Future

A mature system may use different providers for different tasks.

Example:

- fast model for classification,
- stronger model for synthesis,
- deterministic code for financial math,
- embeddings for retrieval,
- specialized extraction models.

This is a future option, not a current requirement.

---

# PART XIX — PROMPT ARCHITECTURE

---

## 59. Prompting Should Be Modular

Avoid one massive universal prompt for all intelligence.

Prefer task-specific prompts or contracts.

Examples:

- extraction prompt,
- evidence classification prompt,
- analysis prompt,
- challenge prompt,
- diligence prompt,
- assistant response prompt.

---

## 60. Product Rules Should Not Live Only in Prompts

Important rules such as:

- Analyst cannot record final decision,
- historical runs remain immutable,
- source ≠ evidence,

should be enforced by application logic where appropriate.

Prompts are not reliable authorization boundaries.

---

## 61. Structured Output

Where model output becomes system data, prefer structured schemas.

Potential benefits:

- validation,
- testing,
- safer persistence,
- clearer failures,
- easier provider replacement.

---

# PART XX — MODEL VERSIONING

---

## 62. Model Identity Should Be Recorded

Future real Analysis Runs may preserve:

- provider,
- model,
- prompt version,
- analysis pipeline version,
- timestamp.

This helps explain historical differences.

---

## 63. Analysis Run Reproducibility

Perfect LLM reproducibility may not be possible.

The goal should instead be:

- stable evidence snapshot,
- stable deterministic inputs,
- known model/prompt version,
- preserved output,
- preserved human review.

---

# PART XXI — COST & RATE LIMIT ARCHITECTURE

---

## 64. Cost Is a Product Constraint

Real AI introduces:

- token cost,
- rate limits,
- latency,
- provider outages.

These should be treated as architecture concerns.

---

## 65. Cost Control Strategies

Potential approaches:

- context minimization,
- task-specific prompts,
- cached stable summaries,
- deterministic preprocessing,
- smaller models for low-risk tasks,
- user-triggered deep analysis,
- avoiding repeated document re-processing.

---

## 66. Rate Limit Behavior

A provider rate limit should not corrupt the case.

The product should:

- preserve existing state,
- return a clear temporary failure,
- allow retry,
- keep the workspace functional.

---

# PART XXII — GRACEFUL DEGRADATION

---

## 67. Core Workspace Must Survive AI Failure

If AI is unavailable:

the user should still be able to:

- access the workspace,
- open cases,
- inspect sources,
- inspect evidence,
- view historical runs,
- record diligence,
- review previous analysis,
- record human judgment,
- inspect decisions.

---

## 68. Failure States

Future UI should distinguish:

- provider unavailable,
- rate limited,
- timeout,
- malformed model response,
- insufficient context,
- retrieval failure,
- unauthorized source access.

Avoid generic:

> “Something went wrong.”

where a more meaningful failure state is available.

---

# PART XXIII — SECURITY & PRIVACY FOR AI

---

## 69. Sensitive Context

Investment material may contain confidential information.

Future AI integration must consider:

- what leaves the local/application boundary,
- which provider receives data,
- logging,
- retention,
- training policy,
- API key management,
- organization controls.

---

## 70. Provider Privacy Is Not Automatically Product Privacy

Using a private workspace UI does not guarantee that an external AI request satisfies all enterprise privacy requirements.

Future production design must evaluate providers and contracts explicitly.

---

## 71. Secrets

API keys should never be:

- embedded in client code,
- committed to Git,
- exposed in UI,
- stored in user-visible logs.

---

# PART XXIV — OBSERVABILITY

---

## 72. Real Operational Observability

Future intelligence infrastructure may need real telemetry for:

- request latency,
- provider errors,
- rate limits,
- cost,
- token usage,
- extraction failures,
- retrieval quality,
- structured-output validation.

This telemetry should exist for actual operations.

---

## 73. Do Not Turn Operational Telemetry Into Visual Theater

The user interface should only expose technical telemetry when it helps the user.

Avoid fake:

- model confidence meters,
- token animations,
- “neural processing” indicators,
- GPU graphics,
- meaningless intelligence percentages.

---

# PART XXV — EVALUATION & TESTING

---

## 74. AI Quality Requires Evaluation

Real intelligence should not be judged only by:

> “The answer looks smart.”

Future evaluation should test specific capabilities.

---

## 75. Grounding Evaluation

Questions:

- Did the answer use the correct evidence?
- Did it cite relevant evidence?
- Did it invent unsupported facts?
- Did it preserve conflicts?
- Did it admit missing evidence?

---

## 76. Extraction Evaluation

Questions:

- Was the correct value extracted?
- Was the source locator preserved?
- Was the unit normalized correctly?
- Was a claim incorrectly promoted to fact?
- Were duplicates handled correctly?

---

## 77. Analysis Evaluation

Questions:

- Are observations supported?
- Are interpretations distinguishable from evidence?
- Are counterarguments meaningful?
- Are critical unknowns surfaced?
- Are deterministic calculations correct?

---

## 78. Assistant Evaluation

Questions:

- Did the assistant understand intent?
- Did it retrieve the right case objects?
- Did it avoid unrelated context?
- Did it preserve permission boundaries?
- Did it avoid making persistent changes without confirmation?

---

## 79. Regression Sets

A future evaluation suite should contain fictional cases with known expected behavior.

Examples:

- conflicting ARR,
- missing churn,
- strong growth but high concentration,
- updated evidence after Run #1,
- historical pass then re-evaluation.

These cases can test whether intelligence behavior remains aligned over model changes.

---

# PART XXVI — HUMAN-IN-THE-LOOP

---

## 80. Human Review Is Not a Temporary Safety Patch

Human review is part of the product model.

It should remain useful even when models become stronger.

---

## 81. Human Confirmation Points

Likely confirmation points include:

- accepting extracted evidence,
- changing verification state,
- saving diligence,
- recording recommendation,
- recording final decision,
- applying material assistant write-actions.

---

## 82. Human Disagreement Should Remain Visible

Future AI should not erase:

- analyst disagreement,
- partner disagreement,
- prior model output.

The intelligence system becomes more useful when disagreement is preserved.

---

# PART XXVII — CROSS-CASE INTELLIGENCE

---

## 83. Future Cross-Case Retrieval

Once enough historical cases exist, KRAVV-IENT may support questions such as:

- “Show similar companies we passed on.”
- “Which cases had high growth but poor retention?”
- “Where did our thesis fail historically?”
- “Which risks recur in vertical SaaS?”

---

## 84. Cross-Case Guardrails

Cross-case intelligence must preserve:

- access permissions,
- company confidentiality,
- historical context,
- source provenance.

It should not flatten all cases into one anonymous embedding pool without governance.

---

# PART XXVIII — INSTITUTIONAL MEMORY

---

## 85. Decision Memory

The long-term strategic intelligence asset is the historical chain of:

- evidence,
- analysis,
- challenge,
- human judgment,
- decisions,
- outcomes.

---

## 86. Learning Loop

A mature system may support:

**Historical Thesis**  
→ **Observed Outcome**  
→ **Lesson**  
→ **Future Case Context**

This creates compounding firm knowledge.

---

## 87. No Automatic “Learning” Without Governance

The system should not silently convert one historical outcome into a universal investment rule.

Learning should remain:

- inspectable,
- contextual,
- revisable.

---

# PART XXIX — PORTFOLIO INTELLIGENCE

---

## 88. Monitoring Intelligence

Future monitoring may combine:

- portfolio metrics,
- company updates,
- news,
- market context,
- original thesis.

---

## 89. Expected vs Actual

One of the most important long-term intelligence capabilities is:

> Compare what the firm expected at investment with what actually happened.

---

## 90. Monitoring Outputs

Potential future outputs:

- thesis drift,
- milestone progress,
- material change summary,
- emerging risk,
- follow-on signal,
- unresolved concern,
- new opportunity.

---

# PART XXX — INTELLIGENCE MATURITY MODEL

---

## 91. Stage 0 — Simulated Intelligence

**Status: Current**

Capabilities:

- deterministic simulated analysis,
- structured result experience,
- historical run behavior.

Purpose:

> Prove product workflow before model integration.

---

## 92. Stage 1 — Grounded Case Assistant

Capabilities:

- real LLM,
- read-only case Q&A,
- evidence references,
- run comparison,
- thesis challenge,
- diligence suggestion.

Purpose:

> Prove real intelligence can operate safely inside the existing case model.

---

## 93. Stage 2 — Evidence Intelligence

Capabilities:

- document parsing,
- candidate extraction,
- provenance,
- duplicate/conflict detection,
- human-reviewed persistence.

Purpose:

> Reduce manual evidence-entry friction.

---

## 94. Stage 3 — Real Analysis Pipeline

Capabilities:

- deterministic calculations,
- category analysis,
- challenge pass,
- grounded synthesis,
- model versioning.

Purpose:

> Replace simulated analysis with real structured intelligence.

---

## 95. Stage 4 — External Research

Capabilities:

- source-aware research,
- competitor context,
- market evidence,
- corroboration.

Purpose:

> Expand case intelligence beyond supplied documents.

---

## 96. Stage 5 — Cross-Case Intelligence

Capabilities:

- historical retrieval,
- comparisons,
- precedent discovery,
- firm memory.

Purpose:

> Compound intelligence across decisions.

---

## 97. Stage 6 — Portfolio Intelligence

Capabilities:

- monitoring,
- thesis tracking,
- outcome comparison,
- learning loops.

Purpose:

> Connect investment reasoning with reality.

---

## 98. Stage 7 — Institutional Intelligence

Capabilities:

- firm-wide memory,
- configurable governance,
- collaborative reasoning,
- learned patterns,
- mature decision support.

Purpose:

> Make the system part of how the investment organization thinks.

---

# PART XXXI — NEAR-TERM IMPLEMENTATION SHAPE

---

## 99. Recommended First Real AI Boundary

A practical first implementation should be intentionally small:

### Input

- current Investment Case,
- selected relevant evidence,
- selected historical Analysis Run if needed,
- user question.

### Model

- one real LLM through provider adapter.

### Output

- grounded answer,
- evidence references,
- limitations.

### Persistence

- conversation may be ephemeral initially,
- no automatic mutation of evidence or decisions.

---

## 100. Why This Is a Good First Step

It tests:

- context assembly,
- model grounding,
- provider integration,
- failure handling,
- evidence references,
- real user value.

without immediately requiring:

- full document extraction,
- vector infrastructure,
- automatic research,
- complex multi-agent orchestration.

---

# PART XXXII — INTELLIGENCE ANTI-PATTERNS

---

## 101. Generic Chatbot Wrapper

Avoid:

> send every user message directly to a general model with no case structure.

---

## 102. One Giant Prompt

Avoid asking one model call to:

- parse documents,
- extract facts,
- calculate metrics,
- detect contradictions,
- analyze the company,
- generate diligence,
- make recommendation,
- decide invest/pass.

This creates low traceability.

---

## 103. Hidden Retrieval

Avoid answers where the user cannot understand what case information influenced the response.

---

## 104. Automatic Verification

Avoid promoting model-extracted content to Verified without a defined verification process.

---

## 105. Model-Controlled Business Rules

Avoid using prompts as the only enforcement mechanism for:

- permissions,
- decision authority,
- historical immutability,
- data access.

---

## 106. Fake Confidence

Avoid unexplained:

`Confidence: 93%`

unless the system can justify and calibrate the metric.

---

## 107. Autonomous Decision Theater

Avoid presenting:

> “AI recommends INVEST”

as the product's final authority.

The system may analyze and challenge.

Humans decide.

---

# PART XXXIII — OPEN INTELLIGENCE QUESTIONS

---

## 108. Retrieval

Open:

- when structured retrieval is enough,
- when embeddings become necessary,
- chunking strategy,
- cross-case retrieval boundaries.

---

## 109. Extraction

Open:

- which document types first,
- candidate-review workflow,
- automatic acceptance thresholds,
- spreadsheet extraction architecture.

---

## 110. Verification

Open:

- what “Verified” should mean in production,
- who can assign it,
- whether the system can suggest it,
- what external corroboration is required.

---

## 111. Model Strategy

Open:

- provider selection,
- model selection,
- routing,
- fallback,
- streaming,
- latency targets,
- cost policy.

---

## 112. External Research

Open:

- allowed sources,
- freshness,
- source authority,
- research persistence,
- citation storage.

---

## 113. Cross-Case Learning

Open:

- firm permission model,
- confidentiality,
- outcome labels,
- historical bias,
- model personalization.

---

# PART XXXIV — ARCHITECTURAL INVARIANTS

---

## 114. Intelligence Must Preserve These Boundaries

Future AI must preserve:

- Source ≠ Evidence
- Evidence ≠ Interpretation
- Interpretation ≠ Human Judgment
- Human Judgment ≠ Recommendation
- Recommendation ≠ Decision
- Current Evidence ≠ Historical Snapshot
- AI Suggestion ≠ Persistent Action
- Provider ≠ Product Identity

---

## 115. Intelligence Must Be Replaceable

Changing model provider should not require redesigning the Investment Case.

---

## 116. Intelligence Must Fail Safely

A failed model request should not damage persistent case state.

---

## 117. Intelligence Must Be Inspectable

Material output should expose its basis.

---

## 118. Intelligence Must Admit Uncertainty

Unsupported certainty is a product defect.

---

# PART XXXV — FINAL INTELLIGENCE VISION

---

## 119. Final Architecture Direction

The mature intelligence system should evolve toward:

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
→ **Monitoring**  
→ **Institutional Learning**

The system may use multiple AI models, deterministic code, retrieval systems, external data sources, and human review.

But those are implementation mechanisms.

The real architecture is the chain of meaning.

---

## 120. Final Intelligence Principle

The goal is not to make KRAVV-IENT appear intelligent.

The goal is to make the investment process itself more intelligent.

That means intelligence must remain:

- grounded,
- traceable,
- modular,
- challengeable,
- historically aware,
- human-governed,
- replaceable at the model layer,
- useful even when AI is temporarily unavailable.

The ideal future KRAVV-IENT is not an AI that says:

> “Here is the answer.”

It is a system that can say:

> **“Here is what we know, here is why we think this, here is what challenges that view, here is what remains unknown, and here is the evidence behind each step.”**
