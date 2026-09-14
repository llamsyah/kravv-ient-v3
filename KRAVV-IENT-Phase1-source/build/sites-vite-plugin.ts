// Vendored from @openai/sites-vite-plugin 0.2.0 (openai/sites#9).
// See sites-vite-plugin.LICENSE for the upstream MIT license.
import { access, cp, mkdir, rm } from "node:fs/promises";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";

const localCookieName = "__sites_local_auth";
const personalCookieName = "__kravv_local_identity";
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const localAddresses = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const authPaths = new Set([
  "/signin-with-chatgpt",
  "/signout-with-chatgpt",
  "/callback",
  "/local-login",
  "/local-logout",
]);

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export function sites({ mockAuth = true } = {}): Plugin {
  let root = process.cwd();
  let command: "build" | "serve" = "build";

  return {
    name: "sites",
    configResolved(config) {
      root = config.root;
      command = config.command;
    },
    configureServer(server) {
      if (!mockAuth) return;
      const secure = Boolean(server.config.server.https);
      const localSecret = readLocalSecret(resolve(root, ".sites-runtime", "local-auth-key"));

      server.config.logger.info("KRAVV-IENT local sign-in: /local-login");
      server.middlewares.use((request, response, next) => {
        for (const name of Object.keys(request.headers)) {
          if (name.startsWith("oai-authenticated-user-")) {
            removeHeader(request, name);
          }
        }

        let authority: URL;
        let url: URL;
        try {
          authority = new URL(
            `${secure ? "https" : "http"}://${request.headers.host}`,
          );
          url = new URL(request.url ?? "/", authority);
        } catch {
          if (authPaths.has((request.url ?? "/").split("?")[0])) {
            respond(response, 403);
          } else {
            next();
          }
          return;
        }

        const hostname = authority.hostname
          .replace(/^\[|\]$/g, "")
          .toLowerCase();
        if (
          !localHosts.has(hostname) ||
          !localAddresses.has(request.socket.remoteAddress ?? "") ||
          url.origin !== authority.origin
        ) {
          if (authPaths.has(url.pathname)) respond(response, 403);
          else next();
          return;
        }

        if (url.pathname === "/local-login" || url.pathname === "/local-logout") {
          if ((request.headers.origin && request.headers.origin !== url.origin) ||
              request.headers["sec-fetch-site"] === "cross-site") {
            respond(response, 403);
            return;
          }
          if (url.pathname === "/local-logout") {
            response.statusCode = 303;
            response.setHeader("Location", "/");
            response.setHeader("Cache-Control", "private, no-store");
            response.setHeader("Set-Cookie", [personalCookie(personalCookieName, "", secure, true), personalCookie(localCookieName, "", secure, true)]);
            response.end();
            return;
          }
          if (request.method === "GET") {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.setHeader("Cache-Control", "private, no-store");
            response.end(localSignInPage());
            return;
          }
          if (request.method !== "POST" || !String(request.headers["content-type"] ?? "").startsWith("application/x-www-form-urlencoded")) {
            respond(response, 405);
            return;
          }
          void readForm(request).then(form => {
            const fullName = (form.get("fullName") ?? "").trim();
            const email = (form.get("email") ?? "").trim().toLowerCase();
            if (fullName.length < 2 || fullName.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              response.statusCode = 400;
              response.setHeader("Content-Type", "text/html; charset=utf-8");
              response.setHeader("Cache-Control", "private, no-store");
              response.end(localSignInPage("Enter a name and a valid email address."));
              return;
            }
            const userId = `local_${createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
            const payload = Buffer.from(JSON.stringify({userId, email, fullName})).toString("base64url");
            const signature = createHmac("sha256", localSecret).update(payload).digest("base64url");
            response.statusCode = 303;
            response.setHeader("Cache-Control", "private, no-store");
            response.setHeader("Location", "/");
            response.setHeader("Set-Cookie", [personalCookie(personalCookieName, `${payload}.${signature}`, secure),personalCookie(localCookieName, "", secure, true)]);
            response.end();
          }).catch(() => respond(response, 400));
          return;
        }

        setHeader(request, "x-kravv-local-mode", "1");

        const cookies = (request.headers.cookie ?? "")
          .split(";")
          .map((cookie) => cookie.trim())
          .filter(Boolean);
        const personalCookies = cookies.filter(cookie => cookie.startsWith(`${personalCookieName}=`));
        const applicationCookies = cookies.filter(
          (cookie) => !cookie.startsWith(`${localCookieName}=`) && !cookie.startsWith(`${personalCookieName}=`),
        );
        if (applicationCookies.length !== cookies.length) {
          removeHeader(request, "cookie");
          if (applicationCookies.length) {
            setHeader(request, "cookie", applicationCookies.join("; "));
          }
        }

        if (url.pathname === "/callback") {
          respond(response, 501);
          return;
        }

        const signIn = url.pathname === "/signin-with-chatgpt";
        const signOut = url.pathname === "/signout-with-chatgpt";
        if (!signIn && !signOut) {
          const localIdentity = personalCookies.length === 1 ? verifyLocalIdentity(personalCookies[0].slice(personalCookieName.length + 1), localSecret) : null;
          if (localIdentity) {
            setHeader(request, "oai-authenticated-user-id", localIdentity.userId);
            setHeader(request, "oai-authenticated-user-email", localIdentity.email);
            setHeader(request, "oai-authenticated-user-full-name", encodeURIComponent(localIdentity.fullName));
            setHeader(request, "oai-authenticated-user-full-name-encoding", "percent-encoded-utf-8");
          }
          next();
          return;
        }

        if (
          (request.headers.origin && request.headers.origin !== url.origin) ||
          request.headers["sec-fetch-site"] === "cross-site"
        ) {
          respond(response, 403);
          return;
        }

        if (
          request.headers["next-router-prefetch"] !== undefined ||
          request.headers["x-middleware-prefetch"] === "1" ||
          [request.headers.purpose, request.headers["sec-purpose"]].some(
            (value) =>
              typeof value === "string" &&
              value
                .split(/[;,]/)
                .some((part) => part.trim().toLowerCase() === "prefetch"),
          )
        ) {
          respond(response, 204);
          return;
        }

        if (
          request.method !== "GET" &&
          (!signOut || request.method !== "POST")
        ) {
          response.setHeader("Allow", signIn ? "GET" : "GET, POST");
          respond(response, 405);
          return;
        }

        if (signIn) {
          response.statusCode = 302;
          response.setHeader("Cache-Control", "private, no-store");
          response.setHeader("Location", "/local-login");
          response.end();
          return;
        }

        response.statusCode = request.method === "POST" ? 303 : 302;
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader(
          "Location",
          safeReturn(url.searchParams.get("return_to")),
        );
        response.setHeader(
          "Set-Cookie",
          [personalCookie(personalCookieName, "", secure, true), personalCookie(localCookieName, "", secure, true)],
        );
        response.end();
      });
    },
    async closeBundle() {
      if (command !== "build") return;

      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }
    },
  };
}

function removeHeader(request: IncomingMessage, name: string): void {
  delete request.headers[name];
  for (let index = request.rawHeaders.length - 2; index >= 0; index -= 2) {
    if (request.rawHeaders[index]?.toLowerCase() === name) {
      request.rawHeaders.splice(index, 2);
    }
  }
}

function setHeader(
  request: IncomingMessage,
  name: string,
  value: string,
): void {
  removeHeader(request, name);
  request.headers[name] = value;
  request.rawHeaders.push(name, value);
}

function respond(response: ServerResponse, status: number): void {
  response.statusCode = status;
  response.setHeader("Cache-Control", "private, no-store");
  response.end();
}

function safeReturn(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost" || authPaths.has(url.pathname)) {
      return "/";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function readLocalSecret(path: string): Buffer {
  mkdirSync(resolve(path, ".."), {recursive: true});
  try { return readFileSync(path); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    try { writeFileSync(path, randomBytes(32), {flag: "wx", mode: 0o600}); }
    catch (writeError) { if ((writeError as NodeJS.ErrnoException).code !== "EEXIST") throw writeError; }
    return readFileSync(path);
  }
}

function personalCookie(name: string, value: string, secure: boolean, clear = false) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}${clear ? "; Max-Age=0" : ""}`;
}

function verifyLocalIdentity(token: string, secret: Buffer): {userId:string;email:string;fullName:string}|null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || payload.length > 1024) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(signature, "base64url"); }
  catch { return null; }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof value.email !== "string" || typeof value.fullName !== "string" || typeof value.userId !== "string") return null;
    const expectedId = `local_${createHash("sha256").update(value.email).digest("hex").slice(0, 32)}`;
    return value.userId === expectedId ? value : null;
  } catch { return null; }
}

async function readForm(request: IncomingMessage): Promise<URLSearchParams> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) throw new Error("Local sign-in form is too large");
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function localSignInPage(error = "") {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KRAVV-IENT local sign-in</title><style>body{font:16px system-ui,sans-serif;background:#11171f;color:#ebf2fa;min-height:100vh;display:grid;place-items:center;margin:0}main{width:min(390px,calc(100vw - 40px));background:#1c2532;padding:36px;border-top:2px solid #7198d3}h1{font-size:27px;font-weight:500;margin:12px 0 20px}p,small{color:#b6c5d8;line-height:1.6}label{display:block;margin:18px 0 6px}input{box-sizing:border-box;width:100%;padding:12px;color:white;background:#131b26;border:1px solid #4c5b70;border-radius:4px;font:inherit}button{margin-top:24px;background:#3568aa;border:0;border-radius:4px;padding:12px 18px;color:white;font:inherit;cursor:pointer}strong{color:#efb2ad}</style><main><small>KRAVV-IENT · LOCAL WORKSPACE</small><h1>Sign in locally</h1><p>Use your name and email to open your own workspace on this computer. This local identity does not verify your email or sign in to ChatGPT.</p>${error ? `<strong>${error}</strong>` : ""}<form method="post" action="/local-login"><label for="fullName">Your name</label><input id="fullName" name="fullName" autocomplete="name" maxlength="80" required><label for="email">Your email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required><button type="submit">Open my workspace</button></form><p><small>Data is stored in this project's local D1 database and document bucket.</small></p></main></html>`;
}
