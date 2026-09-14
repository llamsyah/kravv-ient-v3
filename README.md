# KRAVV-IENT V3 local setup

From this folder in PowerShell:

```powershell
npm run setup
npm run dev
```

Open [KRAVV Access Gate](http://localhost:5173/access). On first use, choose **Initialize private workspace**, enter your display name and an Access Phrase (12–128 characters), and save the generated **Workspace ID** and **Recovery Key**. The Recovery Key is displayed once. No email or ChatGPT account is required locally.

To return, use **Enter Workspace** with the same Workspace ID and Access Phrase. A registered browser opens a session. If its device cookie is missing or expired, **Recover workspace access** requires the Workspace ID, Access Phrase and Recovery Key. Recovery registers the browser; it does not reset a forgotten phrase. Sign out through Settings. Signing out keeps your device registration, cases, source files and history.

For data created before Access Gate, choose **Access data from the earlier local PoC**, using the previous local name/email (or the separate earlier demo option). This opens existing records only, retaining their original unverified access boundary. Creating a new Workspace ID creates a separate workspace; it does not migrate or overwrite old data.

Requires Node.js 22.13 or later. If dependencies are already installed, `npm run dev` is enough. Stop with Ctrl+C. Only run one development server for this checkout; port 5173 is strict. The root scripts start the application in `KRAVV-IENT-Phase1-source`.

Local database and uploaded files persist in `KRAVV-IENT-Phase1-source/.wrangler/state`. Credential hashes, registered devices and sessions persist in `.sites-runtime/access-gate/credentials.json`; the signing key is `.sites-runtime/local-auth-key`, both inside the application folder. Back up both runtime folders together with the server stopped. They are ignored by Git and never pushed. A fresh clone has no local accounts or saved cases from another computer. Hosted Sites data and authentication remain separate.

This is a desktop, single-computer Functional PoC. Access Gate is installed by the development server, not the production worker. The production build retains the hosted Sites/ChatGPT identity path. It is not production security or collaborative tenancy.

Validation from this root:

```powershell
npm run typecheck
npm run build
```

With the development server running, from `KRAVV-IENT-Phase1-source`:

```powershell
node tests/auth-access.mjs
node tests/workflow.mjs
node tests/analysis-workflow.mjs
node tests/analysis-view.mjs
```

The acceptance tests create isolated fictional workspaces. After `auth-access.mjs`, restart the development server and run `node tests/auth-access.mjs --verify-restart` to validate the persisted session and complete saved workspace. Its temporary probe stays in the ignored runtime directory and is removed after successful verification.

See the [functional notes](KRAVV-IENT-Phase1-source/README.md) and [Functional PoC Completion Report](functional-poc-completion-report.md) for boundaries and validation limitations.
