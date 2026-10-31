# KRAVV-IENT — Security, Privacy & Workspace Trust Vision

**Document ID:** 08  
**Document Type:** Canonical Security, Privacy & Trust Vision  
**Project:** KRAVV-IENT  
**Parent Identity:** KRAVVIENT  
**Status:** Living Canonical Document  
**Scope:** Workspace trust, identity, authentication, authorization, privacy, document protection, AI data boundaries, auditability, tenancy, recovery, and production-security evolution  
**Current Product Stage:** Functional Proof of Concept  
**Last Updated:** September 2026

---

## 1. Purpose of This Document

This document defines how KRAVV-IENT should think about trust.

It does not claim that the current Functional PoC is production secure.

It defines:

- what security means for the product,
- which trust boundaries already exist,
- which boundaries are only simulated,
- which current mechanisms are local PoC choices,
- what future production security may require,
- how privacy should interact with AI,
- how access, authority, documents, sessions, and decision history should be protected,
- and how the product should communicate security without exaggeration.

The central rule is:

> **Security in KRAVV-IENT must be real system behavior, not visual theater.**

---

# PART I — TRUST THESIS

---

## 2. Core Trust Thesis

KRAVV-IENT may contain:

- confidential pitch decks,
- financial models,
- cap tables,
- founder information,
- diligence notes,
- internal opinions,
- Investment Committee reasoning,
- investment decisions,
- portfolio information.

Therefore, privacy and trust cannot be treated as secondary decoration.

The long-term product should become a system where users can understand:

- who can access a workspace,
- who can access a case,
- who can read a document,
- who can change evidence,
- who can make a recommendation,
- who can record a final decision,
- what actions occurred,
- what data left the system,
- and how historical records are protected.

---

## 3. Trust Is More Than Login

A secure sign-in screen alone does not create a secure investment system.

Trust includes:

- identity,
- authentication,
- authorization,
- tenancy,
- session security,
- document protection,
- data isolation,
- secret handling,
- auditability,
- AI provider boundaries,
- recovery,
- backup,
- retention,
- incident handling,
- security communication.

KRAVV-IENT should evolve across all of these layers.

---

# PART II — CURRENT POC TRUST MODEL

---

## 4. Current Access Model

The current local PoC uses **KRAVV Access Gate**.

Its product flow is:

**Locked Entry**  
→ **Workspace Identity**  
→ **Operator Authentication**  
→ **Device Session**  
→ **Private Workspace**

This is a functional local trust boundary.

It is not a production enterprise identity system.

---

## 5. Current Workspace Identity

First-time initialization creates:

- operator/display name,
- generated Workspace ID,
- user-created Access Phrase,
- generated Recovery Key,
- registered local device/session.

The Workspace ID represents the local workspace identity.

It should not be interpreted as a verified legal or organizational identity.

---

## 6. Current Credential Handling

The local Access Gate stores:

- salted `scrypt` hashes for secrets,
- hashed random session/device tokens,
- signed local cookies,
- local credential registry.

Plain Access Phrases and Recovery Keys are not intended to be persisted directly.

---

## 7. Current Session Model

The current PoC includes:

- signed session,
- device association,
- session expiration,
- device expiration,
- server-side sign-out revocation,
- recovery path.

Current policy is approximately:

- session lifetime: 12 hours,
- device registration lifetime: 180 days.

These are prototype values.

They are not production policy.

---

## 8. Current Recovery Model

Recovery requires:

- Workspace ID,
- existing Access Phrase,
- Recovery Key.

Recovery:

- re-registers the device,
- retains workspace ownership,
- retains case history,
- does not reset a forgotten Access Phrase.

This is a local PoC recovery model.

---

## 9. Current Sign-Out Model

Sign-out:

- revokes the active session,
- preserves the registered device,
- preserves workspace data,
- preserves source files,
- preserves analysis and decision history.

---

## 10. Current Local Trust State

The current PoC demonstrates real behavior for:

- gated workspace entry,
- identity-scoped workspace access,
- session handling,
- device registration,
- sign-out,
- recovery,
- authenticated API access,
- private document retrieval,
- cross-workspace source protection,
- persistent local data.

These are genuine implementation boundaries.

---

## 11. What the Current PoC Does Not Prove

The current PoC does not prove:

- enterprise identity assurance,
- real firm membership,
- organization tenancy,
- production RBAC,
- formal MFA,
- certified encryption architecture,
- compliance,
- penetration testing,
- hardened rate limiting,
- mature account recovery,
- secure multi-region deployment,
- production incident response,
- production backup/disaster recovery,
- formal audit certification.

These remain future security work.

---

# PART III — SECURITY COMMUNICATION

---

## 12. Security Claims Must Match Reality

KRAVV-IENT should never imply stronger security than the implementation actually provides.

Avoid unsupported phrases such as:

- military-grade,
- bank-grade,
- fully encrypted,
- zero trust,
- enterprise secure,
- compliance ready,
- confidential by certification.

Unless those claims are genuinely supported.

---

## 13. Product Language Should Be Precise

Good language:

> Local private workspace

> Authenticated document access

> Prototype role gate

> Access Gate · Local device session

Bad language:

> Top Secret Clearance

> Vault Grade Encryption

> Maximum Security Level

unless those concepts become real product mechanisms.

---

# PART IV — TRUST BOUNDARIES

---

## 14. Core Trust Boundaries

A mature KRAVV-IENT should define at least these boundaries:

### Boundary 1 — Unauthenticated vs Authenticated

Can the actor enter the system?

### Boundary 2 — Workspace / Organization Membership

Which organization or workspace does the actor belong to?

### Boundary 3 — Role / Authority

What actions may the actor perform?

### Boundary 4 — Case Access

Which Investment Cases may the actor access?

### Boundary 5 — Document Access

Which source files may the actor read or download?

### Boundary 6 — Decision Authority

Who may record material judgments and final decisions?

### Boundary 7 — AI Data Boundary

Which data may be sent to external intelligence providers?

### Boundary 8 — Historical Integrity

Which records may be changed versus appended?

---

# PART V — IDENTITY VISION

---

## 15. Production Identity

A mature production system may support:

- verified user identity,
- organization membership,
- SSO,
- passkeys,
- MFA,
- enterprise identity providers,
- invitation workflows,
- account lifecycle management.

The exact production identity architecture is not yet approved.

---

## 16. Workspace Identity vs User Identity

The current local PoC combines workspace ownership closely with one local identity.

A future system should distinguish:

**Organization / Workspace**  
from  
**Human User**

One organization may contain many users.

One user may belong to one or more workspaces depending on product strategy.

---

## 17. Organization Identity

A future firm-level object may contain:

- organization name,
- domain,
- membership,
- policies,
- roles,
- security configuration,
- integrations,
- data-retention policy.

This is future architecture.

---

# PART VI — AUTHENTICATION VISION

---

## 18. Authentication Goal

Authentication should answer:

> Is this user genuinely the person or account they claim to be?

A future system may use combinations of:

- SSO,
- passkey,
- MFA,
- hardware-backed credentials,
- email verification,
- enterprise identity provider.

---

## 19. Authentication Should Be Replaceable

The product should not depend on one authentication vendor.

Authentication should remain a boundary service.

The core investment model should survive changes in auth infrastructure.

---

# PART VII — AUTHORIZATION VISION

---

## 20. Authorization Goal

Authorization should answer:

> What is this authenticated actor allowed to do?

This is separate from authentication.

---

## 21. Role-Based Access Control

Potential production roles may include:

- Analyst,
- Associate,
- Principal,
- Partner,
- Investment Committee Member,
- Administrator,
- Read-Only Reviewer,
- External Specialist.

Exact role taxonomy remains open.

---

## 22. Role Is Not Enough

Some access decisions may require more than role.

Examples:

- case ownership,
- team membership,
- confidential deal restriction,
- geography,
- sector group,
- IC membership,
- document sensitivity.

Future authorization may therefore combine:

- role,
- resource,
- relationship,
- policy.

---

## 23. Decision Authority

Recording a Final Decision should remain an explicitly protected action.

Future authorization should answer:

- who may decide,
- whether multiple approvals are required,
- whether a quorum exists,
- whether conditions exist,
- whether the decision can be amended.

These governance rules remain product/domain work.

---

# PART VIII — TENANCY

---

## 24. Current Tenancy

Current local PoC:

- one generated local workspace identity,
- one local owner boundary,
- no collaborative firm tenancy.

---

## 25. Future Organization Tenancy

A production system may support:

**Organization**  
→ contains **Users**  
→ contains **Companies / Cases / Documents / Portfolio**

Tenant isolation must prevent one organization from accessing another organization's data.

---

## 26. Tenant Isolation Must Be Enforced Server-Side

Tenant boundaries should not depend only on:

- hidden UI,
- client filters,
- route naming.

Every relevant backend request should validate authorization.

---

# PART IX — CASE-LEVEL ACCESS

---

## 27. Case Visibility

Some firms may require restricted cases.

Examples:

- sensitive founder relationship,
- conflict-of-interest case,
- confidential acquisition,
- Partner-only diligence.

Future KRAVV-IENT may therefore support case-level permissions.

---

## 28. Case Access Models

Potential models:

- all firm members,
- assigned deal team,
- restricted group,
- Partner only,
- explicit invite.

This remains future design.

---

# PART X — DOCUMENT SECURITY

---

## 29. Source Documents Are Sensitive Assets

Documents may include:

- financial projections,
- cap table,
- legal agreements,
- customer lists,
- technical architecture,
- internal strategy.

Document access should therefore be treated as a first-class permission problem.

---

## 30. Current PoC Document Boundary

Current behavior includes:

- private local storage,
- authenticated download,
- identity checks,
- cross-workspace rejection.

This is a real PoC boundary.

---

## 31. Future Document Permissions

A mature system may support:

- case-based access,
- document sensitivity levels,
- download restrictions,
- preview-only mode,
- expiration,
- access logging.

These are future capabilities.

---

## 32. No Public Source URLs by Default

A production architecture should avoid treating confidential investment documents as public static assets.

The V1 experiment historically exposed the risk of public-storage-style document access.

Future architecture should preserve private authenticated retrieval.

---

# PART XI — HISTORICAL INTEGRITY

---

## 33. Security Includes Data Integrity

Security is not only confidentiality.

It also includes:

- integrity,
- availability.

KRAVV-IENT must protect historical decision records from accidental rewriting.

---

## 34. Historical Records

Records that should receive strong integrity protection include:

- Analysis Runs,
- Evidence Snapshots,
- Human Reviews,
- Recommendations,
- Final Decisions,
- IC records,
- Activity / Audit history.

---

## 35. Append-Oriented Behavior

Where historical meaning matters, prefer:

- append,
- supersede,
- revoke,
- annotate,

over silent replacement.

---

# PART XII — AUDITABILITY

---

## 36. Audit Trail Vision

A mature system should be able to answer:

- who accessed a case,
- who uploaded a document,
- who changed evidence,
- who ran analysis,
- who recorded review,
- who made recommendation,
- who recorded decision,
- when each action occurred.

---

## 37. Audit Trail Is Different From Activity Feed

Activity Feed:

> user-facing case history.

Audit Trail:

> security/governance record.

The two may overlap but are not identical.

---

## 38. Audit Record Qualities

Future audit records should ideally be:

- timestamped,
- actor-attributed,
- resource-specific,
- append-oriented,
- difficult to silently alter.

---

# PART XIII — SECRETS MANAGEMENT

---

## 39. Secrets Must Not Live in Client Code

Future secrets may include:

- LLM API keys,
- database credentials,
- storage credentials,
- integration tokens,
- signing keys.

These should not be:

- committed to Git,
- embedded in frontend bundles,
- printed into UI,
- exposed in logs.

---

## 40. Local Development Secrets

Local PoC development may use environment variables or ignored runtime configuration.

The repository should remain safe to share without exposing real provider credentials.

---

## 41. Production Secret Management

Future production may use:

- managed secret storage,
- rotation,
- scoped credentials,
- audit,
- environment separation.

---

# PART XIV — AI PRIVACY BOUNDARY

---

## 42. AI Changes the Data Boundary

Once real LLM integration exists, confidential case data may leave the application boundary.

That must be explicit.

---

## 43. Provider Questions

Before sending investment data to an AI provider, evaluate:

- what data is sent,
- retention,
- training usage,
- logging,
- geography,
- contract terms,
- enterprise controls,
- deletion policy.

---

## 44. Minimal Context Principle

Only send the model what is necessary.

Do not automatically send:

- entire workspace,
- unrelated companies,
- every historical document.

Prefer task-specific context assembly.

---

## 45. Provider Independence Supports Privacy

Provider abstraction is not only an engineering benefit.

It allows the product to select providers based on:

- privacy,
- region,
- capability,
- cost,
- organizational policy.

---

# PART XV — DATA CLASSIFICATION VISION

---

## 46. Future Data Classification

A mature system may classify information such as:

- Public
- Internal
- Confidential
- Highly Restricted

Exact taxonomy remains open.

---

## 47. Classification Could Influence

- document access,
- AI-provider eligibility,
- export behavior,
- sharing,
- retention,
- audit requirements.

---

# PART XVI — DATA RETENTION

---

## 48. Retention Is a Product Decision

Not all data should automatically live forever.

Future policy may define retention for:

- source documents,
- deleted cases,
- chat history,
- audit records,
- model logs,
- portfolio data.

---

## 49. Historical Decision Memory vs Deletion Rights

KRAVV-IENT values history.

But production systems may also require:

- deletion,
- retention policy,
- legal hold,
- regulatory handling.

This tension must be resolved explicitly.

---

# PART XVII — BACKUP & RECOVERY

---

## 50. Current PoC Backup

Current local backup requires preserving both:

- `.wrangler/state`
- `.sites-runtime`

with the development server stopped.

---

## 51. Current Limitation

The local PoC does not provide a managed backup service.

A fresh clone does not contain the local workspace.

---

## 52. Production Backup Vision

A mature system may require:

- automated backups,
- versioned backups,
- point-in-time recovery,
- tested restore procedures,
- disaster recovery policy.

---

# PART XVIII — RECOVERY VISION

---

## 53. Recovery Is a Security Workflow

Recovery can become an attack path if it is weaker than normal authentication.

Future production recovery should preserve security guarantees.

---

## 54. Current Recovery Limitation

The current Recovery Key model is appropriate for local PoC experimentation.

Future production may instead use:

- passkey recovery,
- verified identity,
- admin-assisted recovery,
- enterprise IdP,
- secure recovery codes.

---

# PART XIX — SESSION SECURITY

---

## 55. Session Policy

Future session design may include:

- expiration,
- inactivity timeout,
- device management,
- session revocation,
- suspicious-session detection,
- organization policy.

---

## 56. Device Management

A production system may allow users/admins to view:

- registered devices,
- last used,
- revoke device,
- revoke all sessions.

This is outside current scope.

---

# PART XX — NETWORK & APPLICATION SECURITY

---

## 57. Production Transport

Production deployment should use secure transport.

Sensitive data should not be sent over insecure channels.

---

## 58. Server-Side Enforcement

Material security rules should be enforced on the server.

Do not rely on client-side hiding for:

- document access,
- decision permission,
- tenant isolation,
- role restriction.

---

## 59. Input Validation

All persistent or sensitive inputs should be validated.

This includes:

- IDs,
- file metadata,
- role-sensitive actions,
- analysis references,
- document requests.

---

# PART XXI — FILE SECURITY

---

## 60. Upload Validation

Future production file handling may require:

- size limits,
- type validation,
- malware scanning,
- parsing sandbox,
- metadata sanitization.

The current 20 MB limit is a PoC constraint, not a security model.

---

## 61. File Parsing Risk

Automated extraction introduces new attack surfaces.

Future parsers should be treated as untrusted-input processors.

---

# PART XXII — LOGGING

---

## 62. Logs Must Avoid Sensitive Secrets

Operational logs should not contain:

- Access Phrases,
- Recovery Keys,
- API keys,
- raw auth cookies,
- confidential document contents unless explicitly required.

---

## 63. Useful Security Logging

Future logs may include:

- auth success/failure,
- session creation/revocation,
- permission denial,
- file access,
- administrative changes,
- provider failures.

---

# PART XXIII — RATE LIMITING & ABUSE

---

## 64. Current Status

The local PoC does not implement mature production rate limiting.

---

## 65. Future Protection

Potential controls:

- login throttling,
- recovery throttling,
- API rate limits,
- upload limits,
- AI request limits,
- anomaly detection.

---

# PART XXIV — SECURITY TESTING

---

## 66. Current Functional Security Tests

Current automated validation includes:

- invalid credentials,
- device mismatch,
- recovery,
- sign-out replay denial,
- workspace isolation,
- source isolation,
- origin checks,
- host checks,
- role gate behavior.

---

## 67. Future Security Testing

Production maturity may require:

- dependency scanning,
- static analysis,
- dynamic testing,
- penetration testing,
- authorization matrix tests,
- tenant isolation tests,
- backup restore tests,
- secret leak detection.

---

# PART XXV — SECURITY INCIDENTS

---

## 68. Incident Response Vision

A mature product should define:

- detection,
- containment,
- investigation,
- notification,
- recovery,
- lessons learned.

This is not implemented today.

---

# PART XXVI — PRODUCT TRUST UX

---

## 69. Trust Should Be Visible Through Behavior

Users should gain trust because:

- permissions work,
- access is predictable,
- history is preserved,
- security boundaries are honest,
- source access is controlled,
- actions are attributable.

Not because the UI shows a lock icon everywhere.

---

## 70. Security UI

Useful trust surfaces may include:

- current organization,
- current role,
- current device/session,
- recent access,
- document sensitivity,
- permission explanation.

Avoid decorative security theater.

---

# PART XXVII — COLLABORATION TRUST

---

## 71. Collaboration Increases Security Complexity

Multi-user collaboration introduces:

- membership,
- invitations,
- revocation,
- case access,
- role assignment,
- ownership transfer,
- audit,
- external reviewers.

These should not be added casually.

---

## 72. Least Privilege

Future permissions should aim for:

> users receive only the access required for their role and task.

---

# PART XXVIII — EXTERNAL INTEGRATIONS

---

## 73. Integration Security

Future integrations may include:

- CRM,
- Drive,
- market data,
- cap table,
- email,
- Slack,
- accounting,
- data rooms.

Each integration introduces:

- credentials,
- scopes,
- data flow,
- revocation,
- audit requirements.

---

## 74. Minimal Scope

Integration tokens should request only the permissions actually needed.

---

# PART XXIX — EXPORT & SHARING

---

## 75. Export Risk

Future exports may contain highly sensitive information.

Potential exports:

- memo,
- IC packet,
- evidence report,
- decision history,
- portfolio summary.

---

## 76. Export Controls

Future product may need:

- permission checks,
- watermarking,
- expiry,
- redaction,
- download logging.

Not currently implemented.

---

# PART XXX — PRODUCTION SECURITY MATURITY MODEL

---

## 77. Stage 0 — Local Functional Trust Boundary

**Status: Current**

Includes:

- Access Gate,
- local workspace identity,
- hashed secrets,
- signed sessions,
- private source access,
- cross-workspace rejection.

Goal:

> prove basic trust boundaries in the PoC.

---

## 78. Stage 1 — Real User Identity

Potential additions:

- verified accounts,
- passkeys/MFA,
- managed sessions,
- real password/recovery policy or external IdP.

---

## 79. Stage 2 — Organization Tenancy

Potential additions:

- firm workspaces,
- membership,
- tenant isolation,
- invitation/revocation,
- workspace policies.

---

## 80. Stage 3 — Mature Authorization

Potential additions:

- RBAC,
- case permissions,
- document permissions,
- real decision authority,
- administrative role assignment.

---

## 81. Stage 4 — Audit & Governance

Potential additions:

- audit trail,
- access history,
- organization policy,
- decision governance,
- security administration.

---

## 82. Stage 5 — AI Privacy Governance

Potential additions:

- provider policy,
- data classification,
- AI routing rules,
- retention controls,
- private-model options.

---

## 83. Stage 6 — Production Hardening

Potential additions:

- monitoring,
- incident response,
- backup/DR,
- security testing,
- secret rotation,
- infrastructure hardening.

---

## 84. Stage 7 — Compliance / Enterprise Readiness

Potential work may include:

- formal controls,
- certification,
- legal review,
- regulatory obligations,
- customer security requirements.

This stage should only be claimed after actual completion.

---

# PART XXXI — SECURITY ANTI-PATTERNS

---

## 85. Security Theater

Avoid:

- fake clearance levels,
- meaningless encryption percentages,
- fictional vault terminology,
- decorative lock states.

---

## 86. Client-Only Permission

Do not treat hidden buttons as authorization.

---

## 87. Shared Global Secrets

Avoid one unrestricted credential for all environments and services.

---

## 88. Public Confidential Files

Do not expose confidential source documents through public permanent URLs by default.

---

## 89. Silent AI Data Export

Do not send confidential case content to external AI providers without an explicit architecture and policy.

---

## 90. Mutable Audit History

Do not let normal application workflows silently rewrite governance history.

---

# PART XXXII — CURRENT TRUST MATRIX

---

## 91. Current vs Future

| Trust Capability | Current State | Future Direction |
| --- | --- | --- |
| Workspace gate | Functional local PoC | Production identity |
| Workspace ID | Functional local identity | Organization/user identity model |
| Access Phrase | Functional local credential | Passkey/SSO/MFA candidate |
| Recovery Key | Functional local recovery | Mature recovery policy |
| Device session | Functional local session | Managed device/session controls |
| Workspace isolation | Functional local validation | Tenant isolation |
| Document access | Authenticated local access | Resource-level permission |
| Roles | Prototype self-selectable | Real role administration |
| Decision gate | Functional | Firm governance |
| Audit trail | Partial activity history | Dedicated security audit |
| Backup | Manual local copy | Managed backup/DR |
| AI privacy | Not active because no real AI | Provider governance |
| Production hardening | Not implemented | Future |
| Compliance | Not claimed | Future if required |

---

# PART XXXIII — FUTURE SECURITY DECISION QUESTIONS

---

## 92. Identity Questions

- Is the product firm-first or user-first?
- Will users belong to multiple firms?
- Is SSO mandatory for enterprise?
- Should passkeys be preferred?

---

## 93. Authorization Questions

- Are roles global or case-specific?
- Can Partners delegate authority?
- Can external specialists access only selected cases?
- What does Admin actually control?

---

## 94. Decision Governance Questions

- Who can record final decisions?
- Can decisions be amended?
- Is quorum required?
- How should dissent be preserved?

---

## 95. AI Privacy Questions

- Which providers are allowed?
- Can organizations disable external providers?
- Should certain documents remain local-only?
- How should AI logs be retained?

---

## 96. Data Lifecycle Questions

- How long are passed-case documents retained?
- Can a company request deletion?
- What data must remain for audit?
- How are backups expired?

---

# PART XXXIV — SECURITY HANDOFF RULES

---

## 97. Future Developer Rules

Before changing trust-related behavior:

1. inspect current Access Gate behavior,
2. understand local vs hosted identity separation,
3. preserve workspace data,
4. preserve source access controls,
5. preserve server-side decision gates,
6. do not expose runtime credentials,
7. do not weaken same-origin/host protections casually,
8. do not convert prototype roles into production claims,
9. test cross-workspace isolation,
10. document new trust assumptions.

---

## 98. Future AI Rules

Before adding real AI:

1. define which case data is sent,
2. define provider privacy boundary,
3. keep secrets server-side,
4. minimize context,
5. preserve authorization,
6. avoid logging confidential prompt contents unnecessarily,
7. preserve source provenance,
8. fail safely.

---

# PART XXXV — CURRENT SECURITY POSITIONING

---

## 99. Correct Current Statement

The correct security statement today is:

> **KRAVV-IENT currently has a functional local Access Gate, persistent workspace identity, hashed credentials, signed local sessions, authenticated API boundaries, and protected local document access suitable for a Functional PoC. It is not a production enterprise security system.**

---

## 100. Incorrect Current Statements

Do not claim:

> production secure

> enterprise-grade security

> certified encryption

> mature zero-trust architecture

> secure multi-tenant platform

> compliant investment data room

Those are not current realities.

---

# PART XXXVI — FINAL TRUST PRINCIPLE

---

## 101. Final Principle

KRAVV-IENT should earn trust through:

- real access boundaries,
- honest security claims,
- protected source material,
- preserved historical integrity,
- clear authority,
- attributable actions,
- privacy-aware AI,
- and deliberate security evolution.

The long-term goal is not to make the interface **look secure**.

The goal is to make the system behave in a way that allows an investment organization to trust:

> **who accessed what, who changed what, what information left the system, and why a decision record can still be believed later.**
