# KRAVV-IENT — Experience & Design System Vision

**Document ID:** 07  
**Document Type:** Canonical Experience & Design System Vision  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Product experience, interaction architecture, information density, navigation, visual language, state design, and interface principles  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document defines how KRAVV-IENT should feel, behave, and communicate through its interface.

It is not a component library specification.

It is not a CSS reference.

It is not a visual mood board.

It is the product-level design system vision that should guide:

- information architecture,
- navigation,
- hierarchy,
- density,
- interaction,
- visual identity,
- state design,
- loading behavior,
- empty states,
- errors,
- system feedback,
- AI surfaces,
- and future collaborative workflows.

The goal is to make KRAVV-IENT feel like a coherent private intelligence workstation rather than a generic SaaS dashboard or an AI demo.

---

# PART I — EXPERIENCE THESIS

---

## 2. Core Experience Thesis

KRAVV-IENT should feel like:

> **a calm, private, high-trust intelligence workstation for investment decision-making.**

The product should communicate:

- control,
- seriousness,
- confidentiality,
- precision,
- operational depth,
- historical continuity,
- decision context.

It should not communicate intelligence through spectacle.

It should communicate intelligence through structure.

---

## 3. Experience North Star

The experience should help a user answer:

- Where am I?
- What case am I working on?
- What information exists?
- What is missing?
- What changed?
- What deserves attention?
- What does the system think?
- What do humans think?
- What can I do next?
- What happened historically?

The interface should reduce cognitive reconstruction.

It should not force the user to remember the product state from memory.

---

## 4. The Product Should Feel Like a Workstation

The target metaphor is not:

- social app,
- chat app,
- CRM,
- analytics dashboard,
- hacker terminal,
- futuristic control room.

The target metaphor is:

> **a serious workstation where analysis, evidence, judgment, and history coexist.**

This gives KRAVV-IENT permission to be dense when necessary.

But density must remain controlled.

---

# PART II — VISUAL IDENTITY

---

## 5. Core Visual Statement

> **Dark is the environment. Blue is the identity.**

This should remain the visual anchor.

Darkness is not decorative.

It supports:

- focus,
- seriousness,
- privacy,
- reduced visual noise,
- high information density.

Blue is not the background theme.

It is the identity and system signal.

---

## 6. Color Philosophy

### Environment

Use:

- near-black,
- graphite,
- deep neutral surfaces,
- cold grays.

### Identity

Use blue for:

- active state,
- current selection,
- system emphasis,
- important action,
- key focus,
- product identity.

### Text

Use:

- cold white for primary text,
- muted gray for secondary text,
- lower-contrast gray for metadata.

### Semantic colors

Use semantic color sparingly for:

- success,
- warning,
- danger,
- conflict,
- verification.

Semantic color should communicate meaning, not decorate the interface.

---

## 7. Color Restraint

Avoid:

- full-screen blue washes,
- blue/purple gradients,
- neon blue glow,
- excessive cyan,
- glowing borders,
- multiple accent colors competing for attention.

Blue should remain rare enough that it still means something.

---

# PART III — TYPOGRAPHY

---

## 8. Typography Philosophy

KRAVV-IENT should use typography to distinguish:

- human-readable investment content,
- system metadata,
- identifiers,
- timestamps,
- technical state.

---

## 9. Sans Serif Role

Use a modern sans-serif family for:

- headings,
- body content,
- case descriptions,
- findings,
- recommendations,
- diligence,
- decision rationale.

This is the primary content typography.

---

## 10. Monospace Role

Use monospace selectively for:

- Workspace ID,
- run IDs,
- evidence references,
- timestamps,
- system identifiers,
- technical state,
- source locators.

Do not use monospace for large narrative content.

The product should feel systematic, not retro.

---

## 11. Typography Hierarchy

Hierarchy should rely on:

- size,
- weight,
- spacing,
- position,
- contrast.

Avoid solving hierarchy primarily with:

- boxes,
- borders,
- badges,
- color.

The UI should remain readable even if all borders disappeared.

---

# PART IV — LAYOUT ARCHITECTURE

---

## 12. Global Navigation

The current canonical direction uses:

- a contextual top bar,
- a bottom global navigation rail,
- case-local horizontal navigation.

Primary global destinations include:

- Dashboard,
- Deal Flow,
- Companies,
- Portfolio,
- Documents,
- Settings.

The product should not default back to a permanent generic left sidebar unless there is a strong product reason.

---

## 13. Why Bottom Navigation Works Here

The bottom rail creates a distinct workstation identity.

It also keeps:

- global navigation persistent,
- case content visually dominant,
- the main workspace less crowded.

This is a product identity choice, not a universal design pattern.

---

## 14. Top Context Bar

The top bar should answer:

- what object is active,
- where the user is,
- what context matters now,
- what global action is available.

Potential contents:

- active case/company title,
- search,
- contextual metadata,
- profile/settings access,
- current workspace state.

The bar should remain quiet.

---

## 15. Case-Local Navigation

Within an Investment Case, horizontal navigation should expose the core case surfaces:

- Overview
- Evidence
- Analysis
- Diligence
- Decision
- Activity

This reinforces the idea that these are different views of the same persistent decision object.

---

## 16. Contextual Side Panels

Right-side inspectors or left-side task panels should appear only when the task benefits from them.

Examples:

- source inspection,
- evidence detail,
- finding inspection,
- review context,
- diligence detail.

Avoid permanent side panels that reduce usable space without providing active value.

---

# PART V — INFORMATION DENSITY

---

## 17. Dense but Controlled

KRAVV-IENT may contain a lot of information.

The design goal is not minimalism.

The design goal is:

> **high signal density without visual chaos.**

---

## 18. Density Techniques

Use:

- clear grouping,
- consistent spacing,
- strong headings,
- compact metadata,
- expandable detail,
- tab-local context,
- progressive disclosure,
- inline references,
- meaningful rows.

Avoid:

- giant cards,
- excessive whitespace,
- one metric per huge panel,
- dashboard tiles that waste space.

---

## 19. Progressive Disclosure

Show the minimum needed for comprehension.

Allow deeper inspection when the user asks.

Examples:

- finding summary first,
- evidence details on expand,
- source excerpt on inspect,
- historical comparison on demand.

The interface should reward curiosity without overwhelming first glance.

---

# PART VI — SURFACE PHILOSOPHY

---

## 20. Tonal Surfaces Over Excessive Borders

Prefer:

- subtle tonal separation,
- spacing,
- grouping,
- hierarchy.

Use borders only when they improve structure.

Do not put every content block inside a bordered card.

---

## 21. Cards Are Not the Default

A card should exist because the object deserves a contained surface.

Not because modern SaaS interfaces commonly use cards.

Avoid:

- card grids for everything,
- endless rounded rectangles,
- decorative metric tiles.

---

## 22. Panels Should Represent Product Meaning

A panel may represent:

- one finding,
- one decision,
- one source,
- one review,
- one diligence question,
- one analysis section.

It should not merely be decorative grouping.

---

# PART VII — SHAPE & RADIUS

---

## 23. Radius Philosophy

Use small or restrained radii.

The system should feel modern, not playful.

Avoid:

- overly pill-shaped containers,
- bubble-heavy interfaces,
- soft consumer-app aesthetics.

---

## 24. Pills & Badges

Use pills only for compact state where appropriate.

Examples:

- status,
- role,
- evidence state,
- run context.

Avoid using badges for every metadata field.

Too many badges destroy hierarchy.

---

# PART VIII — MOTION

---

## 25. Motion Philosophy

Motion should communicate:

- state change,
- progression,
- entry/exit,
- confirmation.

It should not exist to make the product feel “AI-powered.”

---

## 26. Good Motion

Examples:

- subtle panel transition,
- loading progress,
- expanding finding,
- toast appearance,
- saved-state confirmation.

---

## 27. Bad Motion

Avoid:

- glowing AI pulses,
- animated scanning lines,
- constant background motion,
- orbiting particles,
- fake model visualization,
- dramatic transition for routine actions.

---

# PART IX — LOADING & PROCESSING STATES

---

## 28. Processing Should Explain Work

When the system performs a meaningful process, the user should understand what stage it is in.

Example:

- Preparing evidence snapshot
- Reviewing evidence states
- Preserving conflicts
- Building findings
- Saving analysis run

This is better than:

> “AI thinking…”

---

## 29. Avoid Fake Telemetry

Do not display:

- model temperature,
- GPU percentage,
- neural activity,
- token counters,
- fake confidence,
- processing IDs,

unless they serve a real user need.

---

## 30. Simulated Processing Must Stay Honest

If processing is simulated, label it.

Do not imply live telemetry.

The current PoC uses a short illustrative sequence and should remain explicit about that.

---

# PART X — EMPTY STATES

---

## 31. Empty States Should Teach the Product Model

Empty states are an opportunity to explain the next meaningful action.

Example:

### No Evidence

> Add structured evidence from your source material before running a meaningful analysis.

This is better than:

> Nothing here yet.

---

## 32. Empty State Structure

A strong empty state may contain:

- current state,
- why it matters,
- next recommended action,
- optional secondary action.

Avoid long tutorial paragraphs.

---

# PART XI — ERROR STATES

---

## 33. Errors Should Be Specific

Prefer:

> Access Phrase is incorrect.

over:

> Authentication failed.

Prefer:

> This source belongs to another workspace.

over:

> Something went wrong.

---

## 34. Error Severity

Differentiate:

- field validation,
- recoverable request error,
- permission denial,
- provider outage,
- corrupted state,
- destructive conflict.

The interface should not treat every problem as the same generic red toast.

---

## 35. Graceful AI Errors

Future AI failures should clearly distinguish:

- rate limit,
- provider unavailable,
- timeout,
- malformed response,
- insufficient evidence,
- retrieval failure.

The product should remain usable.

---

# PART XII — SUCCESS & CONFIRMATION STATES

---

## 36. Confirmation Should Be Quiet

Routine success should not be theatrical.

Examples:

- small toast,
- inline state update,
- subtle confirmation indicator.

Avoid:

- celebration animations,
- oversized success modals,
- dramatic color changes.

---

# PART XIII — SEARCH

---

## 37. Search as a Core Workstation Tool

Search should become increasingly important as the workspace grows.

Current direction includes keyboard-first access such as:

`Ctrl / Cmd + K`

---

## 38. Future Search Scope

Search may eventually include:

- Companies,
- Investment Cases,
- Sources,
- Evidence,
- Findings,
- Diligence,
- Decisions,
- Portfolio updates.

Later, natural-language retrieval may supplement structured search.

---

# PART XIV — DASHBOARD EXPERIENCE

---

## 39. Dashboard Purpose

The Dashboard should answer:

- What needs my attention?
- What changed?
- Which cases are active?
- Where should I continue?

It should not become a vanity metrics page.

---

## 40. Dashboard Content

Prefer:

- active cases,
- unresolved diligence,
- recent analysis,
- decision activity,
- monitoring changes,
- tasks or meaningful follow-up.

Avoid:

- decorative charts,
- meaningless total counters,
- fake productivity metrics.

---

# PART XV — DEAL FLOW EXPERIENCE

---

## 41. Deal Flow Purpose

Deal Flow should provide:

- pipeline overview,
- case status,
- ownership,
- stage,
- current action,
- decision progress.

A table or compact pipeline view is often more appropriate than oversized cards.

---

## 42. Lifecycle Flexibility

Because lifecycle terminology remains provisional, the UI should not harden one workflow unnecessarily.

---

# PART XVI — COMPANY EXPERIENCE

---

## 43. Company View Purpose

Company should represent the long-lived identity.

The user should be able to understand:

- linked Investment Cases,
- previous decisions,
- current relationship,
- historical context.

---

## 44. Company Is Not the Decision Screen

The Company page should not merge all case-specific reasoning into one undifferentiated view.

---

# PART XVII — INVESTMENT CASE EXPERIENCE

---

## 45. Overview

Overview should answer:

- What is this case?
- What stage is it in?
- What is the current thesis?
- What is missing?
- What should I do next?

---

## 46. Evidence

Evidence should make source quality and uncertainty legible.

Users should be able to distinguish:

- reported,
- supported,
- verified,
- conflicting,
- unknown.

---

## 47. Analysis

Analysis should feel like structured intelligence, not a generated essay.

Prefer:

- synthesis,
- findings,
- evidence links,
- win/fail reasoning,
- contradictions,
- unknowns,
- diligence priorities.

---

## 48. Diligence

Diligence should feel operational.

It should show:

- what needs to be resolved,
- who owns it,
- why it exists,
- status,
- response.

---

## 49. Decision

Decision should clearly separate:

- system assessment,
- human review,
- recommendation,
- final decision.

This separation is a major UX responsibility.

---

## 50. Activity

Activity should provide temporal understanding.

The user should be able to reconstruct what happened over time.

---

# PART XVIII — AI ASSISTANT EXPERIENCE

---

## 51. Assistant Placement

The assistant should not dominate the workspace.

It should appear as a contextual intelligence surface.

Possible forms:

- right-side panel,
- contextual command surface,
- expandable assistant drawer,
- case-specific query interface.

The exact form remains open.

---

## 52. Assistant Should Know Context

When opened inside a case, the assistant should understand:

- active Company,
- active Investment Case,
- selected run,
- selected finding,
- selected source where relevant.

The user should not need to restate context constantly.

---

## 53. Assistant Should Show Grounding

Where practical, answers should include:

- evidence references,
- run reference,
- source references,
- limitation.

The assistant should visually distinguish:

- retrieved fact,
- interpretation,
- suggestion.

---

## 54. Assistant Should Not Feel Like a Generic Chat App

Avoid:

- giant chat bubbles,
- mascot-like behavior,
- decorative avatars,
- “AI friend” tone,
- consumer assistant styling.

The assistant should feel like part of the workstation.

---

# PART XIX — HUMAN REVIEW EXPERIENCE

---

## 55. Human Review Must Preserve Agency

Review actions should be explicit.

Examples:

- Agree
- Disagree
- Add Context
- Override

The user should understand that their review becomes part of history.

---

## 56. Review Should Not Rewrite

The UI should visually reinforce:

> original analysis remains intact.

Review is additive.

---

# PART XX — DECISION EXPERIENCE

---

## 57. Decision Should Feel Deliberate

Recording a final decision is more important than editing a note.

The interface should communicate consequence.

That does not require a dramatic modal.

It requires:

- clear action,
- authority context,
- rationale field,
- visible outcome,
- historical record.

---

## 58. Role Visibility

The interface should show when the current role does or does not have decision authority.

Avoid letting the user reach the end of the flow before discovering permission denial.

---

# PART XXI — HISTORY EXPERIENCE

---

## 59. History Is a First-Class UX Concept

KRAVV-IENT is historical by design.

The interface should make it easy to understand:

- previous runs,
- previous decisions,
- previous reviews,
- current-vs-past evidence.

---

## 60. Time Should Be Visible

Use timestamps where they help reconstruct sequence.

Do not hide all historical information behind generic “latest state” UI.

---

# PART XXII — RESPONSIVE STRATEGY

---

## 61. Current Scope

Desktop is the current authoritative product surface.

This is intentional.

---

## 62. Why Desktop First

Core workflows require:

- evidence comparison,
- source inspection,
- dense analysis,
- multi-object context,
- historical navigation.

These benefit from wide screens.

---

## 63. Future Mobile Role

Mobile may later support:

- alerts,
- quick review,
- comments,
- simple approvals,
- portfolio updates.

It should not be forced to reproduce the full workstation.

---

# PART XXIII — ACCESSIBILITY

---

## 64. Accessibility Direction

The dark interface should remain readable.

Future implementation should consider:

- contrast,
- keyboard navigation,
- focus states,
- semantic labels,
- screen-reader meaning,
- reduced motion.

Dark design is not an excuse for low contrast.

---

# PART XXIV — CONTENT DESIGN

---

## 65. Writing Tone

The product should sound:

- direct,
- precise,
- calm,
- professional,
- clear.

Avoid:

- hype,
- pseudo-technical language,
- excessive jargon,
- anthropomorphic AI language,
- security theater.

---

## 66. Good Copy

Examples:

> 3 unresolved diligence questions

> Evidence changed since Run #2

> Provider temporarily unavailable

> This claim is founder-reported only

---

## 67. Bad Copy

Avoid:

> Neural engine synchronizing

> Intelligence confidence 98.4%

> Clearance verified

> Deep AI scan complete

unless these statements correspond to real system behavior.

---

# PART XXV — SYSTEM STATES

---

## 68. Canonical State Categories

The design system should account for:

- default,
- hover,
- focus,
- active,
- selected,
- disabled,
- loading,
- success,
- warning,
- conflict,
- error,
- unknown,
- empty,
- historical.

---

## 69. Historical State

Historical records should visually communicate that they are past snapshots.

They should not look indistinguishable from current mutable state.

---

# PART XXVI — DESIGN TOKENS VISION

---

## 70. Token Categories

A mature design system may define tokens for:

- environment surfaces,
- text hierarchy,
- identity blue,
- semantic states,
- spacing,
- radii,
- typography,
- elevation,
- motion.

The exact token values belong in a lower-level implementation document.

---

# PART XXVII — DESIGN ANTI-PATTERNS

---

## 71. AI Slop

Avoid generic AI-interface habits:

- gradient blobs,
- glowing orbs,
- sparkle icons,
- waveform decoration,
- “smart” cards everywhere,
- meaningless model badges.

---

## 72. Cyberpunk Theater

Avoid:

- neon HUDs,
- scanlines,
- fake radar,
- clearance labels,
- “vault” language without actual meaning,
- random encryption numbers.

---

## 73. Dashboard Theater

Avoid:

- giant metric tiles,
- decorative charts,
- random trend lines,
- fake performance indicators.

---

## 74. Excessive Pills

Avoid turning all metadata into pill badges.

Use text and hierarchy where possible.

---

## 75. Everything in a Card

Avoid card nesting.

Prefer page structure and semantic grouping.

---

# PART XXVIII — CURRENT POC EXPERIENCE

---

## 76. Current Strengths

The current PoC already demonstrates:

- dark workstation environment,
- restrained blue identity,
- bottom global navigation,
- contextual top bar,
- case-local navigation,
- dense-but-controlled layouts,
- no fake telemetry,
- evidence-aware analysis presentation.

---

## 77. Current Limitations

The current PoC is not yet a finished design system.

Future refinement may still improve:

- spacing consistency,
- typography hierarchy,
- state consistency,
- empty states,
- form ergonomics,
- inspector patterns,
- assistant placement,
- accessibility.

---

# PART XXIX — EXPERIENCE MATURITY MODEL

---

## 78. Stage 1 — Functional Navigation

Goal:

> Users can reach every major product surface and understand the hierarchy.

Status: substantially achieved.

---

## 79. Stage 2 — Workflow Clarity

Goal:

> Users understand the journey from source to decision.

Status: current focus.

---

## 80. Stage 3 — Intelligence Integration

Goal:

> Real AI surfaces feel native to the product rather than bolted on.

Future.

---

## 81. Stage 4 — Collaborative Workstation

Goal:

> Multiple users can review, comment, challenge, and decide without losing clarity.

Future.

---

## 82. Stage 5 — Institutional Intelligence UX

Goal:

> Historical retrieval, cross-case learning, and portfolio intelligence remain understandable even at high complexity.

Future.

---

# PART XXX — DESIGN REVIEW CHECKLIST

---

## 83. Before Approving a New Surface

Ask:

- Does this surface represent a real product object?
- Is the hierarchy clear?
- Is the current state obvious?
- Does the user know what to do next?
- Is blue still meaningful?
- Is there unnecessary decoration?
- Can detail be progressively disclosed?
- Are historical and current states distinguishable?
- Is the content denser than necessary?
- Is the interface teaching the product model?

---

## 84. Before Approving an AI Surface

Ask:

- Does it show grounding?
- Does it distinguish fact from interpretation?
- Does it expose limitations?
- Is it taking action or suggesting action?
- Is user confirmation clear?
- Does the UI imply more intelligence than the system actually has?
- Could the same value be delivered with simpler UI?

---

# PART XXXI — DESIGN LANGUAGE SUMMARY

---

## 85. KRAVV-IENT Should Feel

**PRIVATE**  
because investment work can be confidential.

**CONTROLLED**  
because state and authority matter.

**PRECISE**  
because evidence and decisions must be traceable.

**SYSTEMIC**  
because the product is larger than one screen or model response.

**CONFIDENTIAL**  
because data boundaries should feel real, not decorative.

**OPERATIONAL**  
because the product exists to support real work.

**CALM**  
because complexity should not become visual anxiety.

**NEXT-GENERATION**  
because the product should feel modern without relying on gimmicks.

---

## 86. Final Experience Principle

KRAVV-IENT should never need to look loud to feel advanced.

The product should earn its sense of intelligence through:

- clear structure,
- meaningful history,
- evidence-linked reasoning,
- precise interaction,
- restrained visual identity,
- useful state,
- and human control.

The strongest future version of KRAVV-IENT should feel like:

> **a quiet system that knows exactly where every important piece of investment reasoning belongs.**
