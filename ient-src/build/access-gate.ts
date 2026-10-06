import type {IncomingMessage, ServerResponse} from 'node:http';
import {randomBytes} from 'node:crypto';
import type {ViteDevServer} from 'vite';
import {AccessStore, AccessError, SESSION_COOKIE, DEVICE_COOKIE, LEGACY_COOKIE, SESSION_SECONDS, DEVICE_SECONDS} from './access-store.mjs';
import {gatePage} from './access-pages.mjs';

const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);
const loopbackAddresses = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const authCookies = new Set([SESSION_COOKIE, DEVICE_COOKIE, LEGACY_COOKIE, '__sites_local_auth']);
const authPath = (path: string) => path === '/access' || path.startsWith('/access/') || ['/local-login','/local-logout','/signin-with-chatgpt','/signout-with-chatgpt','/callback'].includes(path);
function removeHeader(request: IncomingMessage, name: string) {
  delete request.headers[name];
  for (let i = request.rawHeaders.length - 2; i >= 0; i -= 2) if (request.rawHeaders[i].toLowerCase() === name) request.rawHeaders.splice(i, 2);
}
function setHeader(request: IncomingMessage, name: string, value: string) {
  removeHeader(request, name); request.headers[name] = value; request.rawHeaders.push(name, value);
}
function cookie(name: string, token: string, secure: boolean, seconds = 0) {
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}; Max-Age=${seconds}`;
}
function redirect(response: ServerResponse, location = '/') {
  response.statusCode = 303; response.setHeader('Location', location); response.setHeader('Cache-Control', 'private, no-store'); response.end();
}
function render(response: ServerResponse, view: string, options: Record<string, string> = {}, status = 200) {
  const nonce = randomBytes(18).toString('base64');
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'private, no-store');
  response.setHeader('Pragma', 'no-cache');
  // Native same-origin POST forms need their Origin preserved. no-referrer
  // makes browsers send Origin: null, correctly rejected by both origin guards.
  // Still omit referrers for cross-origin navigation; never allow null origins.
  response.setHeader('Referrer-Policy', 'same-origin');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Content-Security-Policy', `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`);
  response.end(gatePage(view, {...options, nonce}));
}
async function formData(request: IncomingMessage) {
  if (!String(request.headers['content-type'] ?? '').startsWith('application/x-www-form-urlencoded')) throw new AccessError('Submit the Access Gate form.', 400, 'INVALID_INPUT');
  const chunks: Buffer[] = []; let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 8192) throw new AccessError('Access form is too large.', 413, 'INVALID_INPUT');
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
}

/** Installed only by the portable local-development server, never in the hosted worker. */
export function installAccessGate(server: ViteDevServer, root: string) {
  const store = new AccessStore(root);
  const secure = Boolean(server.config.server.https);
  server.config.logger.info('KRAVV Access Gate: /access · local development only');
  server.middlewares.use((request, response, next) => {
    // Drop client-supplied identity hints before any host/origin or session decision.
    for (const name of Object.keys(request.headers)) if (name.startsWith('oai-authenticated-user-') || name.startsWith('x-kravv-')) removeHeader(request, name);
    const handle = async () => {
      let url: URL;
      try {
        const origin = new URL(`${secure ? 'https' : 'http'}://${request.headers.host}`);
        url = new URL(request.url ?? '/', origin);
        if (url.origin !== origin.origin) throw new Error('Absolute origin mismatch');
      } catch { response.statusCode = 403; response.end(); return; }
      const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
      if (!loopbackHosts.has(hostname) || !loopbackAddresses.has(request.socket.remoteAddress ?? '')) {
        if (authPath(url.pathname)) { response.statusCode = 403; response.end(); }
        else next();
        return;
      }
      const cookies = (request.headers.cookie ?? '').split(';').map(part => part.trim()).filter(Boolean);
      const token = (name: string) => {
        const values = cookies.filter(part => part.startsWith(`${name}=`));
        return values.length === 1 ? values[0].slice(name.length + 1) : '';
      };
      const session = token(SESSION_COOKIE), device = token(DEVICE_COOKIE), legacyToken = token(LEGACY_COOKIE);
      const applicationCookies = cookies.filter(part => !authCookies.has(part.split('=')[0]));
      removeHeader(request, 'cookie');
      if (applicationCookies.length) setHeader(request, 'cookie', applicationCookies.join('; '));
      setHeader(request, 'x-kravv-local-mode', '1');
      const identity = await store.authenticate(session, device);
      const legacy = !identity && !session ? await store.legacyIdentity(legacyToken) : null;

      if (!authPath(url.pathname)) {
        const operator = identity ?? legacy;
        if (operator) {
          setHeader(request, 'x-kravv-operator-id', operator.userId);
          setHeader(request, 'x-kravv-operator-name', encodeURIComponent(operator.operator));
          setHeader(request, 'x-kravv-access-mode', operator.mode);
          if (identity) setHeader(request, 'x-kravv-workspace-id', identity.workspaceId);
          if (legacy) setHeader(request, 'x-kravv-legacy-email', legacy.email);
        }
        next(); return;
      }
      if ((request.headers.origin && request.headers.origin !== url.origin) || request.headers['sec-fetch-site'] === 'cross-site') {
        response.statusCode = 403; response.end(); return;
      }
      if (request.headers['next-router-prefetch'] !== undefined || request.headers['x-middleware-prefetch'] === '1' || [request.headers.purpose, request.headers['sec-purpose']].some(value => typeof value === 'string' && /prefetch/i.test(value))) {
        response.statusCode = 204; response.end(); return;
      }
      if (['/local-login','/signin-with-chatgpt'].includes(url.pathname)) { redirect(response, '/access'); return; }
      if (['/local-logout','/signout-with-chatgpt'].includes(url.pathname)) { redirect(response, '/access/signout'); return; }
      if (url.pathname === '/callback') { response.statusCode = 501; response.end(); return; }

      const view = url.pathname === '/access' ? 'entry' : url.pathname.slice('/access/'.length);
      if (!['entry','initialize','login','recover','legacy','signout','continue'].includes(view)) { response.statusCode = 404; response.end(); return; }
      if (request.method === 'GET') {
        if (identity && ['entry','login','initialize','continue'].includes(view)) { redirect(response); return; }
        render(response, view === 'continue' ? 'entry' : view); return;
      }
      if (request.method !== 'POST' || view === 'entry') { response.statusCode = 405; response.setHeader('Allow','GET, POST'); response.end(); return; }
      let form = new URLSearchParams();
      try {
        form = await formData(request);
        if (view === 'signout') {
          await store.signout(session);
          // Device registration deliberately survives sign-out; workspace data is untouched.
          response.setHeader('Set-Cookie', [cookie(SESSION_COOKIE,'',secure), cookie(LEGACY_COOKIE,'',secure), cookie('__sites_local_auth','',secure)]);
          redirect(response, '/access'); return;
        }
        if (view === 'continue') {
          if (!identity) throw new AccessError('Your session is unavailable. Enter your Workspace ID to continue.');
          if (form.get('saved') !== 'yes') throw new AccessError('Confirm that you saved your Workspace ID and Recovery Key.',400,'INVALID_INPUT');
          redirect(response); return;
        }
        if (view === 'legacy') {
          const signed = await store.legacyToken(form.get('operator'), form.get('email'), form.get('demo') === 'yes');
          // The worker checks existing D1 records without creating a new legacy owner.
          // Use the actual listener port, not a caller-controlled Host port.
          const legacyResponse = await fetch(`${secure ? 'https' : 'http'}://localhost:${request.socket.localPort}/api/workspace`, {headers: {Cookie: `${LEGACY_COOKIE}=${signed}`}, redirect: 'error'});
          if (!legacyResponse.ok) throw new AccessError('No existing legacy workspace could be opened. Check the previous identity and this project’s local data folder.', 400, 'LEGACY_UNAVAILABLE');
          response.setHeader('Set-Cookie', [cookie(LEGACY_COOKIE,signed,secure,SESSION_SECONDS),cookie(SESSION_COOKIE,'',secure)]);
          redirect(response); return;
        }
        if (view === 'initialize' && identity) { redirect(response); return; }
        const result = view === 'initialize'
          ? await store.create(form.get('operator'), form.get('phrase'), form.get('confirmation'))
          : await store.login(form.get('workspaceId'), form.get('phrase'), device, view === 'recover' ? form.get('recoveryKey') ?? '' : null);
        response.setHeader('Set-Cookie', [
          cookie(SESSION_COOKIE,result.session,secure,SESSION_SECONDS), cookie(DEVICE_COOKIE,result.device,secure,DEVICE_SECONDS),
          cookie(LEGACY_COOKIE,'',secure), cookie('__sites_local_auth','',secure),
        ]);
        if (view === 'initialize' && 'recoveryKey' in result) render(response, 'created', {id: result.workspaceId, operator: result.operator, recoveryKey: String(result.recoveryKey)}, 201);
        else redirect(response);
      } catch (error) {
        if (!(error instanceof AccessError)) throw error;
        const show = error.code === 'RECOVERY_REQUIRED' ? 'recover' : view === 'continue' ? 'login' : view;
        render(response, show, {error: error.message, id: (form.get('workspaceId') ?? '').slice(0,32), operator: (form.get('operator') ?? '').slice(0,80)}, error.status);
      }
    };
    void handle().catch(error => {
      // Never log request bodies, credentials, cookies or recovery material.
      server.config.logger.error(`Access Gate unavailable: ${error instanceof AccessError ? error.code : 'LOCAL_STORAGE_ERROR'}`);
      if (!response.headersSent) render(response, 'entry', {error: 'Local access storage is unavailable. Keep your local data files and inspect the development server.'}, 503);
      else response.end();
    });
  });
}
