# KRAVV-IENT — Project Overview

**Document ID:** 00  
**Document Type:** Canonical Project Overview  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Document  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026  
**Repository:** https://github.com/llamsyah/kravv-ient-v3

---

## 1. Executive Summary

KRAVV-IENT is a **private AI-assisted investment intelligence workspace** designed for venture capital and private investment workflows.

The product is built around a simple premise:

> Investment decisions should not be separated from the evidence, reasoning, uncertainty, and human judgment that produced them.

Instead of treating investment analysis as a single report, score, or AI-generated answer, KRAVV-IENT treats each opportunity as a persistent **Investment Case** that evolves over time.

A case can accumulate source documents, structured evidence, analysis runs, contradictions, diligence questions, human reviews, recommendations, decisions, and later portfolio monitoring. Historical reasoning is preserved rather than silently overwritten when new information appears.

The long-term direction is to make KRAVV-IENT an **institutional intelligence layer for investment decision-making**: a system that helps investment teams understand what they know, what they do not know, why they believe something, how that belief changed, and what ultimately happened after a decision was made.

The current implementation is a **functional local Proof of Concept (PoC)**. It already demonstrates the end-to-end product structure and persistence model, while its intelligence layer remains intentionally simulated. Real LLM intelligence, automated extraction, retrieval, external research, collaborative firm tenancy, and production-grade security remain future work.

---

## 2. Product Definition

### Canonical one-sentence definition

> **KRAVV-IENT is a private AI-assisted investment intelligence workspace that turns fragmented deal evidence into traceable analysis, structured diligence, human judgment, and persistent investment decisions.**

### Product category

KRAVV-IENT is not intended to be only:

- a pitch-deck analyzer,
- a generic chatbot for investors,
- a CRM,
- a data room,
- a scoring engine,
- an automated investment decision-maker,
- or an AI-generated investment memo tool.

It is designed as a **decision intelligence workspace** that sits between raw deal information and human investment judgment.

The product may integrate with or complement systems such as CRM platforms, market-data providers, cap-table systems, cloud storage, spreadsheets, legal workflows, and portfolio-management tools. It is not currently intended to replace every surrounding investment system.

---

## 3. The Problem

Investment workflows are often fragmented across many surfaces:

- pitch decks,
- financial models,
- founder calls,
- emails,
- messaging platforms,
- CRM records,
- spreadsheets,
- research notes,
- investment memos,
- partner discussions,
- committee decisions,
- portfolio updates.

The challenge is not only information volume.

The deeper problem is **decision traceability**.

Investment teams need to understand:

- what information existed at a given point in time,
- where that information came from,
- whether it was reported, supported, verified, conflicting, or unknown,
- what interpretation was made from it,
- what risks and counterarguments existed,
- what remained unresolved,
- what the analyst believed,
- what the final decision-maker decided,
- and whether the original thesis later proved correct.

Conventional workflows frequently preserve the final memo while losing much of the path that created it.

KRAVV-IENT is designed to preserve that path.

---

## 4. Core Product Thesis

The core thesis behind KRAVV-IENT is:

> **Investment intelligence should be built as a traceable chain from evidence to judgment, not as an isolated AI answer.**

The conceptual lifecycle is:

**Evidence → Analysis → Challenge → Human Judgment → Decision → Monitoring**

This lifecycle is intentionally more important than any individual AI model.

AI is expected to operate inside the workflow, but it should not become the workflow itself.

The product should remain useful even when a model is unavailable, replaced, upgraded, or disagreed with by a human reviewer.

---

## 5. Primary Product Object

The primary product object is the **Investment Case**.

A Company and an Investment Case are not the same thing.

A company can have multiple investment cases across time, rounds, strategies, or re-evaluations. Each case represents a specific decision context and preserves the information and reasoning associated with that context.

An Investment Case may contain:

- company and deal context,
- source documents,
- structured evidence,
- evidence status,
- analysis runs,
- findings,
- contradictions,
- critical unknowns,
- diligence questions,
- human reviews,
- analyst recommendations,
- final decisions,
- activity history,
- portfolio transition,
- monitoring updates.

This structure is intended to make historical investment reasoning durable.

---

## 6. Intended Users

The current user model is a product hypothesis rather than a finalized enterprise permission model.

### Primary user

**Investment Analyst**

The analyst is expected to:

- create and enrich investment cases,
- collect and structure evidence,
- inspect source material,
- run analysis,
- investigate contradictions,
- create diligence questions,
- review system findings,
- and produce recommendations.

### Secondary users

**Associate / Principal**

Potential responsibilities include deeper diligence, case synthesis, review, and recommendation.

**Partner / Investment Committee participant**

Expected to consume the case record, challenge assumptions, inspect evidence and human reviews, and record final investment decisions.

**Workspace / Firm Administrator**

A future role for access, policy, firm configuration, and governance. The current PoC does not implement real firm administration.

---

## 7. Current Product Workflow

At the current PoC level, KRAVV-IENT demonstrates the following journey:

**Access Gate**  
→ **Workspace**  
→ **Create Investment Case**  
→ **Enrich Case Context**  
→ **Add Source Documents**  
→ **Record Structured Evidence**  
→ **Review Analysis Readiness**  
→ **Run Simulated Analysis**  
→ **Inspect Saved Analysis Result**  
→ **Create Diligence Questions**  
→ **Record Human Review**  
→ **Record Analyst Recommendation**  
→ **Record Final Decision**  
→ **Reopen Historical Case**  
→ **Transition to Portfolio when applicable**  
→ **Record Monitoring Updates**

The user is not required to complete every step as a strict wizard.

The intended experience is a persistent workspace where the case becomes richer as information and judgment accumulate.

---

## 8. Current Functional PoC

### Current — implemented and functional

The current repository demonstrates:

- private local workspace entry through **KRAVV Access Gate**,
- generated Workspace ID,
- operator identity,
- Access Phrase,
- Recovery Key,
- registered local device/session behavior,
- persistent local workspaces,
- local sign-out and recovery,
- separate workspace ownership,
- Company and Investment Case separation,
- lightweight case creation,
- living case context,
- private source-document upload and download,
- manual structured evidence capture,
- evidence status tracking,
- historical evidence snapshots,
- versioned analysis runs,
- explicit contradiction and unknown states,
- diligence questions,
- human review separate from system assessment,
- analyst recommendation separate from final decision,
- prototype Analyst / Partner / Admin permission gates,
- append-like decision and activity history,
- explicit portfolio transition,
- manual portfolio monitoring,
- reload and historical-case persistence,
- regression tests, type checking, and production build validation.

The latest local Access Gate browser issue found during manual acceptance was fixed and the initialization flow was successfully tested manually.

### Current — intentionally simulated

The current intelligence layer uses deterministic PoC behavior.

It does **not** currently perform:

- live LLM reasoning,
- automatic document extraction,
- automated evidence verification,
- automated contradiction discovery,
- external research,
- retrieval-augmented generation,
- autonomous diligence,
- autonomous investment decisions,
- autonomous portfolio monitoring.

The visible processing sequence represents product flow, not real model telemetry or a durable background AI job.

### Current — prototype assumptions

The current PoC also includes deliberately simplified assumptions:

- one local workspace owner per generated Workspace ID,
- locally registered device/session behavior,
- self-selectable Analyst / Partner / Admin roles for demonstration,
- human-assigned evidence status,
- provisional lifecycle terminology,
- explicit portfolio entry after an invested decision,
- desktop-first experience,
- single-computer local PoC behavior.

These assumptions are not automatically promoted into future production requirements.

---

## 9. Product Vision

### Current

KRAVV-IENT currently proves that an investment workflow can be represented as a persistent, traceable product rather than a collection of disconnected screens or a single analysis output.

### Near-term direction

The next meaningful product evolution is expected to focus on **real intelligence over the existing case structure**, not on replacing the structure.

Potential near-term intelligence capabilities include:

- grounded case assistant,
- real LLM reasoning,
- evidence-aware Q&A,
- finding explanation,
- contradiction assistance,
- critical-unknown detection,
- diligence suggestion,
- comparison between historical analysis runs,
- source-aware responses,
- model/provider abstraction.

### Long-term vision

The long-term ambition is broader:

> KRAVV-IENT should become a private institutional intelligence layer that preserves and compounds the reasoning behind investment decisions across the full lifecycle of a company.

In that future state, the system could support:

- automated but auditable document extraction,
- structured fact and claim resolution,
- evidence provenance,
- grounded AI analysis,
- challenge and counter-analysis,
- research orchestration,
- investment-thesis comparison,
- decision-memory retrieval,
- cross-case intelligence,
- firm-wide knowledge,
- portfolio monitoring intelligence,
- thesis-versus-outcome learning,
- collaboration and investment-committee workflows,
- mature permissions and governance,
- production security and enterprise identity.

This vision is directional.

It is not a claim that these capabilities are already implemented.

---

## 10. Product Principles

Detailed principles are documented separately, but the current project is anchored by the following:

### Evidence Before Opinion

The system should distinguish what is known from what is inferred.

### AI Assists, Humans Decide

AI may structure, interpret, challenge, explain, or recommend questions. Final investment judgment remains human.

### Stable Facts, Flexible Reasoning

Hard facts and deterministic calculations should remain stable and traceable. Interpretive reasoning may vary when the reasoning is visible.

### Preserve Uncertainty

Unknowns and contradictions are meaningful information. They should not be hidden merely to make the interface look complete.

### Preserve History

New information should not silently rewrite what was known or believed in an earlier analysis run.

### Separate Judgment Layers

System assessment, human review, analyst recommendation, and final decision are different objects.

### No Unsupported Certainty

The product should prefer an explicit unknown over a fabricated answer.

### Product Before Model Complexity

The workflow, objects, persistence, traceability, and user experience must remain coherent independently of any specific AI provider.

---

## 11. Current Information Model

At a high level:

**Company**  
contains or links to one or more:

**Investment Cases**

Each Investment Case may contain:

**Source Documents**  
→ raw/reference material

**Structured Evidence**  
→ recorded claims, facts, values, excerpts, and their evidence state

**Analysis Runs**  
→ historical snapshots of evidence plus system-generated findings

**Diligence Questions**  
→ persistent unknowns or follow-up work selected by a human

**Human Reviews**  
→ agreement, disagreement, context, or override without erasing the original assessment

**Recommendations**  
→ analyst-level judgment

**Final Decisions**  
→ decision authority record

**Portfolio Record**  
→ post-investment continuation of the original case

**Monitoring Updates**  
→ expected-versus-actual developments over time

The detailed domain and object model belongs in a dedicated document.

---

## 12. Product Boundaries

KRAVV-IENT is deliberately opinionated about several boundaries.

### The product is not the source of truth for raw company claims

It stores and structures evidence while preserving provenance.

### The product should not silently resolve conflicting evidence

Conflict should remain visible until resolved through evidence or human judgment.

### The product should not collapse AI and human judgment into one answer

Disagreement is expected and should be preserved.

### The product should not depend on one AI provider

Provider choice should remain an implementation concern rather than a product identity.

### The product should not treat a score as the investment decision

The current direction favors structured reasoning such as:

- Why This Could Win
- Why This Could Fail
- Contradictions
- Critical Unknowns
- Diligence Priorities

rather than a universal investment score.

---

## 13. Security and Privacy Direction

Privacy is part of the product concept because investment material may contain confidential company information.

### Current PoC

The local implementation demonstrates:

- gated workspace access,
- generated workspace identity,
- hashed Access Phrase and Recovery Key,
- signed local sessions,
- registered-device behavior,
- private local persistence,
- authenticated workspace APIs,
- protected document access,
- separation between local Access Gate and hosted identity behavior.

### Future direction

Production security remains a separate maturity stage and may eventually include:

- verified accounts,
- firm tenancy,
- SSO,
- MFA or passkeys,
- real role assignment and RBAC,
- per-resource authorization,
- session policy,
- audit trails,
- secret management,
- encryption and key-management policy,
- security review and certification,
- organization-level governance.

The current PoC must not be presented as production security.

---

## 14. Design Direction

KRAVV-IENT is intended to feel like a **private intelligence workstation**, not a generic SaaS dashboard or cyberpunk AI interface.

The current design direction is summarized as:

> **Dark is the environment. Blue is the identity.**

The visual language should be:

- calm,
- precise,
- private,
- controlled,
- systemic,
- operational,
- modern,
- dense when necessary but not noisy.

The product should avoid:

- fake telemetry,
- decorative security claims,
- meaningless technical numbers,
- generic AI gradients,
- excessive glow,
- glassmorphism,
- cyberpunk/HUD styling,
- arbitrary dashboards,
- fake investment metrics,
- AI “magic” decoration.

Every visible system element should correspond to real product context, state, metadata, navigation, or user action.

---

## 15. Development Philosophy

KRAVV-IENT has no fixed commercial deadline at the current stage.

Development can therefore be maturity-driven rather than calendar-driven.

This allows the project to evolve in deliberate stages:

1. **Functional Workspace**  
   Prove the complete product workflow and persistence model.

2. **Evidence Intelligence**  
   Improve the quality, structure, provenance, and transformation of evidence.

3. **Grounded AI Assistant**  
   Add real LLM interaction over explicit case context and evidence.

4. **Advanced Analysis and Challenge**  
   Add stronger intelligence, contradiction handling, scenario analysis, and research support.

5. **Collaborative Investment Workflow**  
   Introduce real team roles, governance, review, and IC workflows.

6. **Institutional Decision Memory**  
   Make historical reasoning searchable and reusable across cases and teams.

7. **Portfolio Intelligence**  
   Compare original thesis with outcomes and support ongoing monitoring.

8. **Production Platform**  
   Mature tenancy, security, integrations, reliability, operations, and deployment.

These stages are directional, not deadlines.

A later stage should not be implemented merely because it appears next in the list. Each stage should be entered when the preceding product model is understood well enough to support it.

---

## 16. Current Success Criterion

At the current stage, KRAVV-IENT should not be judged by whether it can produce the most sophisticated AI answer.

The Functional PoC is successful if a user can understand and complete the core decision journey while preserving traceability:

> **Access → Case → Sources → Evidence → Analysis → Diligence → Human Judgment → Recommendation → Decision → History**

The next intelligence phases should improve the quality and leverage of that journey without weakening its traceability.

---

## 17. Known Open Questions

The following remain intentionally unresolved or provisional:

- final investment lifecycle taxonomy,
- formal Investment Committee governance,
- committee quorum and approval mechanics,
- real firm roles and permissions,
- collaboration model,
- post-investment case-state rules,
- exit/cancellation behavior,
- immutable diligence-to-analysis provenance,
- materiality and prioritization rules,
- production tenancy,
- production authentication,
- real intelligence architecture,
- provider selection and routing,
- retrieval strategy,
- external research boundaries,
- automated extraction policy,
- confidence calibration,
- portfolio automation policy.

These should be resolved through future product and domain work rather than silently invented during implementation.

---

## 18. Project Identity

KRAVVIENT is the broader parent identity.

KRAVV-IENT represents a **flagship-class expression of KRAVV**: a product intended to explore a deeper, more ambitious system rather than a narrowly scoped utility.

The current private investment intelligence workspace is the first flagship system carrying the bare **KRAVV-IENT** name.

The naming should not be interpreted as claiming that the product is permanently complete or the absolute maximum possible form of the ecosystem. It represents the current flagship level of ambition.

---

## 19. Documentation Authority

This document is the canonical high-level overview of KRAVV-IENT.

It should answer:

- What is the project?
- What problem does it solve?
- What exists now?
- What is simulated?
- What is the long-term direction?
- What principles should future work preserve?

It should **not** replace more detailed documents for:

- product vision,
- product principles,
- domain discovery,
- object model,
- system architecture,
- testing,
- security,
- roadmap,
- decision records,
- implementation handoff.

Historical implementation reports remain useful as evidence of what happened during earlier phases, but they should not override the latest canonical project documentation.

---

## 20. Summary

KRAVV-IENT began from a question about whether AI could turn a pitch deck into structured VC analysis.

It has evolved into a broader product thesis:

> The real opportunity is not generating one investment answer.  
> The opportunity is building a private system that preserves how investment understanding is formed, challenged, decided, and later evaluated.

The current Functional PoC establishes the first version of that system.

The long-term work is to make its intelligence deeper without losing the qualities already treated as foundational:

**evidence, provenance, uncertainty, history, challenge, and human judgment.**
