# KRAVV-IENT — Product Principles

**Document ID:** 02  
**Document Type:** Canonical Product Principles  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Product behavior, intelligence boundaries, decision philosophy, and durable design rules  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document defines the product principles that should guide KRAVV-IENT as it evolves.

These principles are not feature requirements.

They are the rules used to judge whether a feature, workflow, AI capability, interface decision, data model, or future architecture is aligned with the product.

The purpose is to preserve product coherence over time.

KRAVV-IENT is expected to evolve significantly. Models will change. Providers may change. Interfaces will change. Storage may change. Collaboration may be introduced. New intelligence capabilities may be added.

The principles in this document should survive those changes unless the product thesis itself is deliberately reconsidered.

---

## 2. Principle Hierarchy

Not all principles have the same role.

This document separates them into four groups:

### A. Foundational Principles

These define what KRAVV-IENT fundamentally is.

### B. Intelligence Principles

These define how AI and analytical reasoning should behave.

### C. Decision and History Principles

These define how judgments, decisions, revisions, and historical records should be preserved.

### D. Experience and System Principles

These define how the product should feel and how complexity should be presented.

Where principles conflict, foundational principles take priority.

---

# PART I — FOUNDATIONAL PRINCIPLES

---

## 3. Evidence Before Opinion

### Principle

> **KRAVV-IENT should distinguish what is known from what is believed.**

Evidence should precede interpretation.

The product should make it possible to tell:

- what a source says,
- what was extracted from the source,
- what was recorded as evidence,
- what was calculated,
- what was inferred,
- what was interpreted,
- and what was judged by a human.

### Why this matters

Investment analysis often mixes facts, founder claims, analyst assumptions, calculations, and opinions in the same document.

When those layers become indistinguishable, later users cannot easily tell which conclusions were grounded and which were interpretive.

KRAVV-IENT should preserve the distinction.

### Product implications

The system should maintain conceptual separation between:

- Source Document
- Claim
- Structured Evidence
- Derived Metric
- Interpretation
- Finding
- Human Review
- Recommendation
- Decision

### Current PoC implication

Document upload does not automatically mean extraction or verification.

Evidence is recorded separately from uploaded source material.

### Future implication

Automated extraction may be added, but extracted facts should remain traceable to their source and should not automatically become verified truth.

### Anti-patterns

Avoid:

- treating uploaded files as already understood,
- displaying model interpretation as fact,
- hiding the source behind a summary,
- silently promoting a company claim to verified evidence,
- combining source, evidence, and conclusion into one opaque AI response.

### Status

**Locked foundational direction.**

---

## 4. Traceability Over Convenience

### Principle

> **A conclusion should remain explainable even when the system could make the workflow faster by hiding intermediate reasoning.**

KRAVV-IENT should prioritize traceability when convenience and traceability conflict in material investment decisions.

### Why this matters

A user may initially prefer a faster answer.

But investment decisions can be revisited months or years later.

The ability to explain why a judgment existed may become more important than the speed at which it was produced.

### Product implications

Important outputs should retain references to:

- relevant evidence,
- source material,
- analysis run,
- assumptions,
- human reviewer,
- decision context,
- timestamp or version where applicable.

### Future implication

A mature assistant should be able to explain:

> “This conclusion was based on these evidence records from this analysis run.”

### Anti-patterns

Avoid:

- source-free synthesis,
- mutable conclusions without historical context,
- “AI says so” explanations,
- overwriting the record to simplify the current interface.

### Status

**Locked foundational direction.**

---

## 5. Investment Case Is the Core Decision Object

### Principle

> **The primary unit of decision reasoning is the Investment Case, not the Company and not the Analysis output.**

### Why this matters

A company can be evaluated multiple times under different conditions.

A firm may pass on a company at Seed and reconsider it at Series A.

The company remains the same.

The decision context does not.

### Product implications

A Company may have multiple Investment Cases.

Each Investment Case should preserve:

- its own context,
- evidence,
- analysis history,
- diligence,
- review,
- recommendation,
- decision,
- and relevant portfolio transition.

### Anti-patterns

Avoid:

- one mutable “company analysis” that overwrites earlier evaluations,
- treating analysis output as the main persistent object,
- combining multiple decision contexts into one undifferentiated record.

### Status

**Locked foundational direction.**

---

## 6. Company and Investment Case Are Distinct

### Principle

> **Company identity should persist across time; decision context should remain case-specific.**

### Why this matters

Long-term company intelligence and historical decision integrity require both objects.

### Product implications

Company-level information may include:

- canonical company identity,
- website,
- sector,
- geography,
- long-term relationship,
- linked cases.

Case-level information may include:

- investment stage,
- round context,
- owner,
- thesis,
- target check,
- valuation,
- case-specific evidence,
- recommendation,
- decision.

### Future implication

Cross-case company intelligence should aggregate history without flattening historical cases into one mutable object.

### Status

**Locked foundational direction.**

---

## 7. Preserve Uncertainty

### Principle

> **Unknown, conflicting, and incomplete information are legitimate product states.**

### Why this matters

Investment work is performed under uncertainty.

A system that tries to make every field complete and every analysis decisive can create false confidence.

### Product implications

The product should support explicit states such as:

- Reported
- Supported
- Verified
- Conflicting
- Unknown

The exact taxonomy may evolve, but uncertainty itself should remain visible.

### AI implication

When evidence is insufficient, the system should say so.

It should not generate certainty because a user expects an answer.

### Anti-patterns

Avoid:

- filling unknown fields with assumptions,
- hiding conflicts,
- resolving contradictory data without evidence,
- arbitrary certainty percentages,
- presenting incomplete information as final.

### Status

**Locked foundational direction.**

---

## 8. Product Before Model Complexity

### Principle

> **The product workflow should remain coherent independently of any specific AI model.**

### Why this matters

Models change rapidly.

The product should not need to be redesigned every time a provider, model family, cost structure, or capability changes.

### Product implications

The core value should remain in:

- workflow,
- evidence structure,
- case history,
- traceability,
- human review,
- decision memory.

AI models should operate inside this structure.

### Architecture implication

Model providers should be abstractable where practical.

### Anti-patterns

Avoid:

- designing the product around one model’s quirks,
- exposing provider-specific behavior as product identity,
- coupling business logic directly to one LLM API,
- rebuilding core workflows because a new model becomes available.

### Status

**Locked foundational direction.**

---

# PART II — INTELLIGENCE PRINCIPLES

---

## 9. AI Assists, Humans Decide

### Principle

> **AI may support investment reasoning; humans remain responsible for final investment judgment.**

### Why this matters

Investment decisions involve accountability, uncertainty, context, and values that should not be delegated implicitly to a model.

### AI may

- summarize,
- structure,
- compare,
- calculate,
- explain,
- challenge,
- identify gaps,
- propose diligence,
- generate scenarios,
- suggest interpretations.

### AI should not silently

- finalize an investment decision,
- change a human recommendation,
- rewrite evidence,
- delete disagreement,
- move a company into portfolio,
- impersonate an Investment Committee decision.

### Future write-actions

If AI is later allowed to create or update persistent records, material actions should require explicit user confirmation and produce an activity trail.

### Status

**Locked foundational direction.**

---

## 10. Stable Facts, Flexible Reasoning

### Principle

> **Hard facts and deterministic calculations should be stable; interpretive reasoning may vary when its basis is visible.**

### Why this matters

Users should not receive different factual answers every time an analysis runs.

At the same time, investment reasoning is inherently interpretive.

Different models, contexts, and reviewers may produce different interpretations.

### Stable layer

Examples:

- reported revenue,
- customer count,
- valuation,
- ownership,
- calculated growth rate,
- runway,
- margin,
- burn multiple.

### Flexible layer

Examples:

- competitive durability,
- strategic differentiation,
- market quality,
- execution risk,
- founder interpretation,
- thesis attractiveness.

### Product implication

The UI and data model should help users understand which layer they are looking at.

### Anti-patterns

Avoid:

- model-generated arithmetic when deterministic code is available,
- treating interpretive assessments as immutable facts,
- allowing changing model wording to alter stored source facts.

### Status

**Locked intelligence direction.**

---

## 11. Deterministic Where Deterministic Is Possible

### Principle

> **Do not use probabilistic AI for work that can be reliably performed with deterministic logic.**

### Why this matters

Deterministic calculations are easier to verify, reproduce, test, and explain.

### Examples

Prefer code or formulas for:

- ratios,
- growth rates,
- financial math,
- ownership math,
- runway,
- date calculations,
- scenario arithmetic.

Use models for:

- interpretation,
- synthesis,
- challenge,
- contextual reasoning,
- open-ended comparison.

### Status

**Locked intelligence direction.**

---

## 12. No Unsupported Certainty

### Principle

> **The product should prefer a clear limitation over a confident fabrication.**

### AI behavior

A good answer may be:

> “The current evidence does not support a reliable conclusion.”

That is preferable to an impressive but unsupported narrative.

### Product implication

Findings should be able to expose:

- evidence basis,
- conflicting evidence,
- missing evidence,
- uncertainty,
- limitation.

### Anti-patterns

Avoid:

- fabricated numbers,
- invented sources,
- unsupported market claims,
- unexplained confidence scores,
- wording that implies verification when only a founder claim exists.

### Status

**Locked intelligence direction.**

---

## 13. Ground Answers in the Case

### Principle

> **Contextual intelligence should use the Investment Case as its primary working context.**

### Why this matters

A generic LLM can answer investment questions.

KRAVV-IENT should answer questions in relation to:

- this company,
- this case,
- this evidence,
- this analysis run,
- this history,
- this firm context where appropriate.

### Assistant implication

A future assistant should retrieve relevant case information rather than blindly receiving the entire database.

### Product implication

Answers should cite or reference underlying evidence where practical.

### Status

**Near-term locked direction.**

---

## 14. Challenge, Do Not Only Confirm

### Principle

> **KRAVV-IENT should help users test a thesis, not merely make it sound stronger.**

### Why this matters

A system that only summarizes or agrees creates confirmation risk.

### Challenge behaviors may include

- identifying counter-evidence,
- exposing contradictions,
- proposing alternative interpretations,
- testing assumptions,
- identifying missing evidence,
- exploring downside scenarios,
- comparing with prior failed theses.

### Anti-patterns

Avoid:

- automatic agreement with analyst framing,
- optimistic synthesis by default,
- hiding evidence that weakens the thesis.

### Status

**Locked vision direction.**

---

## 15. Contradictions Are Information

### Principle

> **Conflicting evidence should be preserved until resolved, not automatically blended into one answer.**

### Example

If:

- Pitch Deck reports ARR = $4.2M
- Financial Model reports ARR = $3.9M

the system should not silently choose one.

It should preserve both claims and expose the conflict.

### Future intelligence behavior

AI may:

- detect the contradiction,
- explain why it matters,
- suggest follow-up diligence,
- identify which source appears more authoritative.

AI should not silently erase the conflict.

### Status

**Locked foundational direction.**

---

## 16. Suggestions Are Not Persistent Actions Until Confirmed

### Principle

> **An AI suggestion should not become workflow state merely because it was generated.**

### Example

An AI-generated diligence question remains a suggestion until the user explicitly creates it.

### Why this matters

Generated ideas and accepted workflow commitments are different.

### Future implication

The same principle should apply to:

- tasks,
- evidence updates,
- recommendations,
- follow-ups,
- portfolio actions.

### Status

**Locked interaction direction.**

---

## 17. Confidence Must Be Earned

### Principle

> **Do not display numerical confidence unless the system can explain and calibrate what the number means.**

### Preferred language

Use observable descriptions:

- Supported by two independent sources
- Founder-reported only
- Conflicting values
- Missing supporting evidence
- Interpretation depends on assumption X

### Future confidence model

If numerical confidence is later introduced, it should relate to measurable factors such as:

- source independence,
- source quality,
- contradiction level,
- evidence completeness,
- model consistency,
- historical calibration.

### Status

**Locked direction against arbitrary confidence scoring.**

---

## 18. AI Output Must Be Inspectable

### Principle

> **Material AI findings should have an inspectable basis.**

### Product implication

A user should be able to move from:

Finding  
→ Evidence  
→ Source

where applicable.

### Why this matters

Trust should come from inspectability, not visual authority.

### Anti-patterns

Avoid:

- unreferenced executive synthesis,
- generic “AI insight” cards,
- findings with no observable basis.

### Status

**Locked intelligence direction.**

---

# PART III — DECISION AND HISTORY PRINCIPLES

---

## 19. Preserve History, Do Not Rewrite It

### Principle

> **New information should not silently change what was known or believed in the past.**

### Why this matters

Historical reasoning is part of the investment record.

### Current implementation

Analysis runs save evidence snapshots.

New evidence may trigger a new run.

Older runs remain unchanged.

### Future implication

The system may support richer version comparison, but historical records should remain inspectable.

### Anti-patterns

Avoid:

- editing old analysis automatically,
- replacing past conclusions with the latest model output,
- erasing evidence that was available at the time.

### Status

**Locked foundational direction.**

---

## 20. New Evidence Creates New Understanding, Not New History

### Principle

> **Later evidence should enrich the current case without retroactively changing prior evidence snapshots.**

### Example

Run #1 used:

- 10 evidence records.

Later:

- 3 new documents arrive,
- 4 new evidence records are added,
- 1 prior evidence record changes status.

Run #1 should remain intact.

A new Run #2 may use the new state.

### Product implication

The user should be able to see that the current case differs from an old analysis run.

### Status

**Locked historical behavior.**

---

## 21. System Assessment and Human Judgment Are Separate

### Principle

> **Human review should not overwrite the system assessment.**

### Why this matters

Disagreement is useful.

### Product implication

A case should be able to preserve:

- system assessment,
- analyst agreement,
- analyst disagreement,
- additional context,
- override rationale.

### Future implication

This distinction becomes increasingly important as real AI is introduced.

### Status

**Locked foundational direction.**

---

## 22. Recommendation and Final Decision Are Separate

### Principle

> **An analyst recommendation is not the same object as an investment decision.**

### Why this matters

Organizations separate analysis from decision authority.

### Product implication

A user may recommend:

- proceed,
- pass,
- continue diligence,
- or another future recommendation state.

The final authority may decide differently.

Both records should remain visible.

### Status

**Locked foundational direction.**

---

## 23. Decision Rationale Matters

### Principle

> **Important decisions should retain the reasoning behind them.**

A final decision without rationale loses much of its future learning value.

### Product implication

Material decisions should require or strongly encourage rationale.

### Current PoC

Partner/Admin final decision behavior requires rationale.

### Future implication

Formal IC decisions may preserve:

- participants,
- rationale,
- dissent,
- conditions,
- follow-up actions.

### Status

**Locked direction; exact governance remains provisional.**

---

## 24. Human Disagreement Is First-Class Data

### Principle

> **Differences in judgment should be preserved, not normalized away.**

### Why this matters

A firm can learn from disagreement.

### Future possibilities

The system may eventually analyze:

- recurring analyst/partner disagreement,
- disagreement associated with successful outcomes,
- common thesis conflicts,
- historical dissent.

### Anti-patterns

Avoid:

- forcing one final narrative,
- hiding dissent after a decision,
- replacing prior views with the winning view.

### Status

**Locked vision direction.**

---

## 25. Activity History Should Be Durable

### Principle

> **Material changes should leave a trace.**

### Relevant events may include

- case creation,
- evidence addition,
- analysis run,
- diligence creation,
- human review,
- recommendation,
- final decision,
- portfolio entry,
- monitoring update.

### Future implication

A production system may evolve toward richer audit trails.

### Status

**Current product direction; depth may evolve.**

---

## 26. Monitoring Closes the Decision Loop

### Principle

> **The investment lifecycle should eventually connect original beliefs to actual outcomes.**

### Why this matters

Without outcome comparison, a firm preserves decisions but not learning.

### Product implication

Portfolio monitoring should retain the original thesis and allow expected-vs-actual comparison.

### Future intelligence implication

KRAVV-IENT may eventually help identify:

- which assumptions were correct,
- which assumptions failed,
- which risks materialized,
- which signals mattered.

### Status

**Locked long-term direction.**

---

# PART IV — EXPERIENCE AND SYSTEM PRINCIPLES

---

## 27. The Product Should Teach Through Structure

### Principle

> **A first-time user should understand the workflow because the product structure makes sense, not because the interface is covered in tutorials.**

### Product implication

Users should naturally discover:

Source  
→ Evidence  
→ Analysis  
→ Diligence  
→ Judgment  
→ Decision

### UX implication

Use:

- contextual copy,
- empty states,
- meaningful labels,
- clear transitions.

Avoid:

- excessive tutorial overlays,
- arrows everywhere,
- “click here” babysitting,
- onboarding that explains around a confusing product model.

### Status

**Locked experience direction.**

---

## 28. Progressive Disclosure Over Visual Overload

### Principle

> **Complexity should be available when needed, not displayed all at once.**

### Why this matters

Investment work is inherently dense.

The goal is not to remove complexity but to manage it.

### Product implication

Use:

- expandable findings,
- contextual inspectors,
- focused case tabs,
- detail on demand,
- structured hierarchy.

### Status

**Locked design direction.**

---

## 29. Every Visible System Element Must Mean Something

### Principle

> **Visible system elements should correspond to real context, state, metadata, navigation, or user action.**

### Avoid

- fake telemetry,
- decorative logs,
- arbitrary status indicators,
- meaningless counters,
- invented security levels,
- non-functional charts,
- AI activity theater.

### Why this matters

KRAVV-IENT should look advanced because the product is advanced, not because it imitates a movie interface.

### Status

**Locked design direction.**

---

## 30. Dark Is the Environment. Blue Is the Identity.

### Principle

> **Visual identity should remain restrained, private, and operational.**

### Current direction

- near-black / graphite environment,
- cold white and gray typography,
- restrained blue as identity and system signal,
- modern sans for content,
- mono selectively for IDs, timestamps, run IDs, and technical state.

### Avoid

- blue-purple AI gradients,
- excessive glow,
- glassmorphism,
- cyberpunk HUD design,
- arbitrary neon,
- fake terminal aesthetics.

### Status

**Current canonical visual direction.**

---

## 31. System-Oriented, Not Hacker-Oriented

### Principle

> **KRAVV-IENT may feel technical without performing “technical theater.”**

A serious system can use:

- IDs,
- timestamps,
- run history,
- evidence references,
- structured state.

It does not need:

- matrix effects,
- scanning animations,
- “clearance level” language,
- fake encryption meters,
- random command-line output.

### Status

**Locked design direction.**

---

## 32. Dense but Controlled

### Principle

> **Information density is acceptable when it supports investment work.**

The goal is not minimalism for its own sake.

The goal is controlled density.

### Product implication

A complex case may contain significant information.

The interface should prioritize:

- hierarchy,
- grouping,
- whitespace,
- typography,
- meaningful surface separation.

### Status

**Locked experience direction.**

---

## 33. Desktop-First Until the Workflow Proves Otherwise

### Principle

> **Do not force a mobile experience before the core investment workflow is understood.**

### Current scope

The PoC is desktop-first.

This is appropriate for:

- evidence inspection,
- multi-panel analysis,
- document review,
- diligence,
- decision history.

### Future

Mobile may later support:

- review,
- alerts,
- quick comments,
- monitoring,
- lightweight decision participation.

### Status

**Current scope, not permanent product law.**

---

## 34. Local Complexity Should Not Leak Into Product Meaning

### Principle

> **Implementation details should not become user-facing product concepts unless they are genuinely useful.**

Examples:

A user does not need to understand:

- D1 internals,
- R2 implementation,
- provider SDK details,
- model routing internals,
- local signing-key storage.

The product should expose meaningful concepts such as:

- Workspace,
- Source,
- Evidence,
- Analysis Run,
- Decision.

### Status

**Locked UX direction.**

---

## 35. Private by Product Intent

### Principle

> **Privacy should be part of the product architecture, not merely a visual theme.**

### Current PoC

The system demonstrates:

- gated local workspace,
- authenticated APIs,
- private source access,
- separate workspace ownership.

### Future

Production privacy may require:

- verified identity,
- organization tenancy,
- RBAC,
- audit logs,
- encryption policy,
- data governance.

### Anti-pattern

Do not display “private”, “encrypted”, or “secure” claims that the actual system cannot support.

### Status

**Locked product direction; implementation maturity will evolve.**

---

## 36. Security Claims Must Match Reality

### Principle

> **The product must not imply stronger security than it actually implements.**

### Why this matters

False security language is worse than honest prototype language.

### Current example

KRAVV Access Gate is a Functional PoC access model.

It should not be described as production enterprise security.

### Status

**Locked integrity principle.**

---

# PART V — DEVELOPMENT AND GOVERNANCE PRINCIPLES

---

## 37. Unknown Business Rule = Do Not Invent Silently

### Principle

> **When a business rule is unknown, the system or developer should not quietly invent one and later treat it as canonical.**

### Allowed responses

- mark as TODO,
- document as Open Question,
- use a clearly labeled Prototype Assumption,
- request a product decision.

### Examples of currently unresolved areas

- final lifecycle taxonomy,
- IC quorum,
- conditional decisions,
- post-investment outcome changes,
- formal role administration,
- materiality rules.

### Status

**Locked development rule.**

---

## 38. Prototype Assumptions Must Stay Labeled

### Principle

> **A shortcut used to make the PoC work should not automatically become a production requirement.**

### Current examples

- self-selectable roles,
- local Access Gate,
- single-computer local workspace,
- manual evidence status,
- provisional lifecycle.

### Status

**Locked development rule.**

---

## 39. Do Not “Fix” Intentional Product Behavior Without Evidence

### Principle

> **Before changing behavior that looks unusual, understand why it exists.**

### Examples

Do not casually change:

- immutable historical runs,
- Company/Case separation,
- recommendation/decision separation,
- explicit diligence creation,
- conflict preservation.

These may look like extra complexity but are intentional.

### Status

**Locked handoff rule.**

---

## 40. Preserve Existing Data Before Refactoring

### Principle

> **Product evolution should not casually destroy historical cases or local workspaces.**

### Required mindset

Before changes to:

- identity,
- persistence,
- model schema,
- case history,
- analysis runs,

first inspect existing data and migration implications.

### Current precedent

The Access Gate implementation preserved earlier local workspaces instead of silently replacing them.

### Status

**Locked engineering/product rule.**

---

## 41. Tests Should Protect Product Invariants

### Principle

> **Tests should validate important product behavior, not only code execution.**

### Important invariant tests include

- historical run immutability,
- role decision restrictions,
- workspace isolation,
- source download authorization,
- recommendation/decision separation,
- human review preservation,
- stale revision rejection,
- Access Gate behavior,
- persistence after restart.

### Future

As intelligence becomes real, tests should also protect:

- provenance,
- grounding,
- deterministic calculations,
- unsupported-answer behavior,
- provider failure handling.

### Status

**Locked quality direction.**

---

## 42. Build for Replaceable Intelligence

### Principle

> **Intelligence components should be replaceable without rewriting product structure.**

### Architecture implication

Prefer:

Product logic  
→ Intelligence interface  
→ Provider adapter  
→ Provider/model

instead of embedding provider calls throughout business logic.

### Why this matters

Current experimentation may use one provider.

Future production may use another or several.

### Status

**Locked future architecture direction.**

---

## 43. Graceful Degradation

### Principle

> **The core workspace should remain useful when an intelligence provider is unavailable.**

### Example

If a future LLM provider hits a rate limit:

- the user should still access the case,
- sources should remain available,
- evidence should remain visible,
- historical analysis should remain accessible,
- decisions should remain intact.

The system may state that intelligence is temporarily unavailable.

### Status

**Locked future architecture direction.**

---

## 44. No Deadline-Driven Feature Inflation

### Principle

> **KRAVV-IENT should evolve by product maturity, not by pressure to fill a roadmap.**

### Why this matters

The project currently has no fixed commercial deadline.

That is an advantage.

It allows features to be added when their underlying model is understood.

### Product implication

Do not enter the next maturity stage simply because the previous one has a label.

### Status

**Current project philosophy.**

---

## 45. Learn Before Automating

### Principle

> **Do not automate a workflow that is not yet understood.**

### Why this matters

Automation can hide misunderstanding.

Before introducing:

- automated extraction,
- AI diligence,
- IC automation,
- portfolio monitoring,

the manual workflow and domain logic should be understood sufficiently.

### Status

**Locked development philosophy.**

---

# PART VI — PRINCIPLE APPLICATION

---

## 46. How to Evaluate a New Feature

Before adding a feature, ask:

### Product fit

- Does this improve understanding, traceability, challenge, judgment, or learning?
- Which product object does it belong to?
- Does it preserve the Investment Case model?

### Evidence integrity

- What evidence does it use?
- Can the user inspect the basis?
- Does it distinguish fact from interpretation?

### Historical integrity

- Could it rewrite prior state?
- Does it preserve previous reasoning?

### Human authority

- Is the feature making a suggestion or taking an action?
- Does the user remain responsible for material decisions?

### Intelligence quality

- Should this be deterministic or probabilistic?
- What happens if the model is wrong?
- What happens if the provider is unavailable?

### Experience

- Is the feature adding real capability or visual noise?
- Can complexity be disclosed progressively?

### Governance

- Is the required business rule actually known?
- If not, is it clearly labeled as provisional?

If these questions cannot be answered, the feature is not ready for implementation.

---

## 47. How to Evaluate an AI Feature

A proposed AI capability should answer:

1. **What question is the AI helping answer?**
2. **What data is it allowed to use?**
3. **What is evidence versus interpretation?**
4. **How is the response grounded?**
5. **What happens when evidence is insufficient?**
6. **Can the user inspect the basis?**
7. **Can the user disagree?**
8. **Does the output become persistent automatically?**
9. **Could this change historical state?**
10. **What happens if the model/provider fails?**

A feature that cannot answer these questions should not be treated as production-ready intelligence.

---

## 48. How to Evaluate a Design Change

A design change should improve at least one of:

- comprehension,
- hierarchy,
- navigation,
- focus,
- state visibility,
- traceability,
- task efficiency.

It should not exist merely to make the product look more “AI”.

Ask:

- Does the element represent real system state?
- Does it help the user decide what to do?
- Is the information density controlled?
- Is the blue accent still meaningful?
- Is the interface becoming more generic?
- Is technical styling replacing actual product structure?

---

## 49. How to Evaluate a Business Rule

Before encoding a business rule:

1. Is it supported by the product vision?
2. Is it supported by domain understanding?
3. Is it universal enough to belong in the product?
4. Could different firms operate differently?
5. Should it be configurable?
6. Is it currently only a prototype assumption?

If the answer is uncertain, document it rather than silently hard-code it.

---

# PART VII — CURRENT PRINCIPLE REGISTER

---

## 50. Locked Principles

The following are currently treated as durable product decisions:

- Evidence Before Opinion
- Traceability Over Convenience
- Investment Case as the core decision object
- Company and Investment Case remain distinct
- Preserve uncertainty
- Product before model complexity
- AI Assists, Humans Decide
- Stable Facts, Flexible Reasoning
- Deterministic where deterministic is possible
- No unsupported certainty
- Challenge, do not only confirm
- Contradictions are information
- Suggestions are not persistent actions until confirmed
- Preserve history
- New evidence does not rewrite old analysis
- System assessment and human judgment remain separate
- Recommendation and final decision remain separate
- Human disagreement is preserved
- Security claims must match implementation
- Unknown business rules must not be invented silently
- Prototype assumptions must remain labeled
- Historical data should be preserved during evolution

---

## 51. Strong Direction, Not Yet Fully Implemented

The following are strong product directions but remain incomplete:

- grounded case assistant,
- evidence-aware Q&A,
- automated but auditable extraction,
- challenge/counter-analysis,
- source-aware external research,
- deterministic financial engine,
- provider-independent intelligence layer,
- cross-case intelligence,
- institutional decision memory,
- portfolio thesis-vs-outcome learning,
- collaborative firm workflow,
- formal IC workflow,
- mature production security.

---

## 52. Provisional Areas

The following areas should remain open until further product/domain work:

- exact lifecycle states,
- lifecycle transition rules,
- role taxonomy,
- IC quorum,
- conditional decisions,
- post-investment decision changes,
- exit/cancellation semantics,
- materiality ranking,
- diligence prioritization,
- immutable question-to-run relationships,
- confidence calibration,
- external-source trust model,
- production tenancy model.

---

## 53. Principle Conflict Resolution

When two goals conflict, prefer the following order:

1. **Data and historical integrity**
2. **Human accountability**
3. **Evidence traceability**
4. **Product clarity**
5. **Analytical quality**
6. **Workflow efficiency**
7. **Visual convenience**
8. **Novelty**

Example:

If automatically merging conflicting evidence makes the UI cleaner but destroys traceability, preserve the conflict.

If an AI-generated recommendation is faster but obscures evidence, expose the evidence.

If a redesign looks more impressive but introduces fake information, reject the redesign.

---

## 54. Final Principle

The simplest test for KRAVV-IENT is:

> **Can the system help a human understand not only what the current conclusion is, but how that conclusion came to exist?**

If the answer is yes, the product is moving in the right direction.

If the answer is no, more AI, more automation, or more visual complexity will not solve the underlying problem.

KRAVV-IENT should remain a system for:

**evidence, reasoning, challenge, judgment, history, and learning.**
