# KRAVV-IENT V3 local setup

From this folder in PowerShell:

```powershell
npm run setup
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), choose **Open my local workspace**, and enter your name and email. The email identifies your local workspace; it is not verified and this is not a ChatGPT login. Use the same email later to reopen the same data. Sign out from Settings when needed.

Requires Node.js 22 or later. If dependencies are already installed, `npm run dev` is enough. Stop the server with Ctrl+C. Run `npm run typecheck` and `npm run build` to validate the app.

The local D1 database creates its workspace table automatically on first local sign-in. Data and uploaded files remain under `KRAVV-IENT-Phase1-source/.wrangler/state`; the local signing key remains under `KRAVV-IENT-Phase1-source/.sites-runtime`. Both are ignored by Git. Do not delete these folders if you want to keep your local cases and documents. Local data does not sync with the hosted site.

The application source and detailed functional notes are in [KRAVV-IENT-Phase1-source/README.md](KRAVV-IENT-Phase1-source/README.md).
