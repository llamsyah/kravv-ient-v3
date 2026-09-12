# KRAVV-IENT validation and implementation status

Private version 1: https://kravv-ient-workspace.llamsyah.chatgpt.site

## 1. Fully functional within this PoC

- Desktop navigation across Dashboard, Deal Flow, Companies, Portfolio, Documents and Settings; all six case tabs and their shortcuts.
- Saved companies and investment cases, case reopening, reload persistence, and optimistic concurrency protection.
- Document uploads/downloads, manual evidence capture and source references, historical analysis input snapshots, diligence questions and resolutions.
- Human reviews tied to the original analysis run, recommendations distinct from final decisions, append-only decision and activity history.
- Explicit portfolio transition and manual monitoring updates while retaining the original case, evidence, thesis and decision history.
- Authenticated workspace/source access and server-side decision permission gates. Analyst is denied; Partner/Admin require decision rationale. Role assignment itself remains a demonstration.

Validation preserved all seven existing local cases and checked seven source downloads. Evidence/document links, analysis snapshots, reviews, recommendations, two successive decisions and the portfolio record remained intact. All case/company records were unchanged by the resumed validation. Type checking and the production build passed. The earlier full workflow test also passed, including uploaded byte equality and stale-write rejection. The hosted private workspace loads successfully.

## 2. Simulated

Analysis is a deterministic evidence-summary simulation, visibly labeled SIMULATED. It does not use live AI, extract documents, independently corroborate evidence, discover contradictions automatically, conduct external research or monitor companies autonomously. Sample companies, metrics, sources and judgments are fictional. Confidence is not calibrated. Self-switching roles demonstrate permission gates rather than production role administration.

## 3. Incomplete

Live intelligence and extraction integrations; deterministic financial calculator interfaces; complete analysis coverage across all candidate PRD dimensions; formal investment-committee governance; collaborative firm membership and role administration; automatic portfolio alerts; merged cross-case intelligence; production security hardening and certification.

These are not represented as completed functionality. End-to-end mutation and source-byte acceptance testing was performed locally. Hosted verification covers successful authenticated loading and case recovery, not a repeated full mutation suite. Local and hosted storage are separate; the previous local records were preserved, not migrated to hosting.

## 4. Assumptions

No new business rules or visual concepts were introduced in this continuation. Existing prototype assumptions remain: one workspace per signed-in owner; self-selectable demo roles; new cases start Sourced; human-assigned evidence status; 20 MB uploads; explicit portfolio entry following an Invested decision; provisional manual lifecycle transitions. Desktop-only is the current authoritative scope.

## 5. Product conflicts and unclear rules

Lifecycle terminology differs across the supplied documents. Formal role assignments, committee quorum, conditional decisions and post-investment workflow constraints are unspecified. The existing model permits reopening an invested case and recording Pass while retaining its portfolio record. This preserves history but must not be interpreted as an approved exit or cancellation policy. The referenced product overview was not supplied.

## Changes in this continuation

Preserved the existing implementation and design. Fixed shortcut URL synchronization so the active case tab reopens correctly after reload, and safely handled malformed encoded case links. Removed unused starter assets and temporary metadata, documented operation and limitations, saved the validated source, and published owner-private version 1. No additional mobile UX work was performed.
