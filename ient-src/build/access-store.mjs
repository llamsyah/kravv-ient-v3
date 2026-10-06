import {createHash, createHmac, randomBytes, scrypt, timingSafeEqual} from 'node:crypto';
import {mkdir, readFile, writeFile, rename} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {promisify} from 'node:util';

const derive = promisify(scrypt);
export const SESSION_SECONDS = 12 * 60 * 60;
export const DEVICE_SECONDS = 180 * 24 * 60 * 60;
export const SESSION_COOKIE = '__kravv_access_session';
export const DEVICE_COOKIE = '__kravv_access_device';
export const LEGACY_COOKIE = '__kravv_local_identity';
const digest = value => createHash('sha256').update(value).digest('hex');
const randomToken = () => randomBytes(32).toString('base64url');
const canonicalRecovery = value => value.toUpperCase().replace(/[\s-]/g, '');
const canonicalId = value => value.trim().toUpperCase();
const equal = (a, b) => {
  const left = Buffer.from(a, 'hex'), right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
};

async function hashCredential(value) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(value, salt, 64, {N: 16384, r: 8, p: 1});
  return {algorithm: 'scrypt', salt, hash: hash.toString('hex')};
}
async function matches(value, stored) {
  const hash = await derive(value, stored.salt, 64, {N: 16384, r: 8, p: 1});
  return equal(hash.toString('hex'), stored.hash);
}
export class AccessError extends Error {
  constructor(message, status = 401, code = 'INVALID_CREDENTIALS') {
    super(message); this.status = status; this.code = code;
  }
}

/** Local PoC credential registry. Never stores phrases, recovery keys or device/session tokens. */
export class AccessStore {
  constructor(root) {
    this.path = resolve(root, '.sites-runtime/access-gate/credentials.json');
    // Retain the previous key so existing signed legacy sessions remain recoverable.
    this.keyPath = resolve(root, '.sites-runtime/local-auth-key');
    this.queue = Promise.resolve();
    this.ready = this.initialize();
  }
  async initialize() {
    await mkdir(dirname(this.path), {recursive: true});
    try { await writeFile(this.keyPath, randomBytes(32), {flag: 'wx', mode: 0o600}); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    this.secret = await readFile(this.keyPath);
    if (this.secret.length !== 32) throw new Error('Local signing key is invalid; restore the local auth backup.');
    try { await writeFile(this.path, JSON.stringify({version: 1, workspaces: {}}), {flag: 'wx', mode: 0o600}); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  async read() {
    await this.ready;
    const data = JSON.parse(await readFile(this.path, 'utf8'));
    if (data.version !== 1 || !data.workspaces || Array.isArray(data.workspaces)) throw new Error('Local access registry is invalid; restore its backup.');
    return data;
  }
  async update(action) {
    const transaction = this.queue.then(async () => {
      const data = await this.read();
      const result = await action(data);
      const temporary = `${this.path}.${randomBytes(8).toString('hex')}.tmp`;
      await writeFile(temporary, JSON.stringify(data, null, 2), {mode: 0o600});
      await rename(temporary, this.path);
      return result;
    });
    this.queue = transaction.then(() => undefined, () => undefined);
    return transaction;
  }
  sign(kind, payload) {
    const body = Buffer.from(JSON.stringify({kind, ...payload})).toString('base64url');
    return `${body}.${createHmac('sha256', this.secret).update(body).digest('base64url')}`;
  }
  decode(token, kind) {
    if (typeof token !== 'string' || token.length > 2048) return null;
    const [body, supplied, extra] = token.split('.');
    if (!body || !supplied || extra) return null;
    const expected = createHmac('sha256', this.secret).update(body).digest();
    const bytes = Buffer.from(supplied, 'base64url');
    if (bytes.length !== expected.length || !timingSafeEqual(bytes, expected)) return null;
    try {
      const value = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      return value.kind === kind ? value : null;
    } catch { return null; }
  }
  device(record, token) {
    const device = this.decode(token, 'device');
    if (!device || device.workspaceId !== record.id || typeof device.token !== 'string') return null;
    return record.devices.find(d => d.expiresAt > Date.now() && equal(d.hash, digest(device.token))) ?? null;
  }
  issue(record, deviceToken) {
    let device = this.device(record, deviceToken);
    let deviceCookie = deviceToken;
    if (!device) {
      const token = randomToken();
      device = {hash: digest(token), expiresAt: Date.now() + DEVICE_SECONDS * 1000};
      record.devices.push(device);
      deviceCookie = this.sign('device', {workspaceId: record.id, token});
    }
    const sessionToken = randomToken();
    const expiresAt = Date.now() + SESSION_SECONDS * 1000;
    record.sessions = record.sessions.filter(s => s.expiresAt > Date.now());
    record.sessions.push({hash: digest(sessionToken), deviceHash: device.hash, expiresAt});
    return {
      workspaceId: record.id, operator: record.operator,
      device: deviceCookie,
      session: this.sign('session', {workspaceId: record.id, token: sessionToken, expiresAt}),
    };
  }
  async create(operator, phrase, confirmation) {
    if (typeof operator !== 'string' || operator.trim().length < 2 || operator.trim().length > 80) throw new AccessError('Use an operator name between 2 and 80 characters.', 400, 'INVALID_INPUT');
    if (typeof phrase !== 'string' || phrase.length < 12 || phrase.length > 128 || !phrase.trim()) throw new AccessError('Use an Access Phrase between 12 and 128 characters.', 400, 'INVALID_INPUT');
    if (phrase !== confirmation) throw new AccessError('The Access Phrase confirmation does not match.', 400, 'INVALID_INPUT');
    const recoveryKey = `KVR-${randomBytes(24).toString('hex').toUpperCase().match(/.{4}/g).join('-')}`;
    const [phraseHash, recoveryHash] = await Promise.all([hashCredential(phrase), hashCredential(canonicalRecovery(recoveryKey))]);
    return this.update(data => {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let id;
      do {
        const value = [...randomBytes(8)].map(byte => alphabet[byte % 32]).join('');
        id = `KVI-${value.slice(0, 4)}-${value.slice(4)}`;
      } while (data.workspaces[id]);
      const record = {id, operator: operator.trim(), createdAt: new Date().toISOString(), phraseHash, recoveryHash, devices: [], sessions: []};
      data.workspaces[id] = record;
      return {...this.issue(record, null), recoveryKey};
    });
  }
  /** @param {unknown} id @param {unknown} phrase @param {unknown} deviceToken @param {string|null} [recoveryKey] */
  async login(id, phrase, deviceToken, recoveryKey = null) {
    if (typeof id !== 'string' || id.length > 32 || typeof phrase !== 'string' || phrase.length > 128) throw new AccessError('Workspace ID or Access Phrase is incorrect.');
    return this.update(async data => {
      const record = data.workspaces[canonicalId(id)];
      if (!record || !await matches(phrase, record.phraseHash)) throw new AccessError('Workspace ID or Access Phrase is incorrect.');
      if (recoveryKey !== null) {
        if (typeof recoveryKey !== 'string' || recoveryKey.length > 160 || !await matches(canonicalRecovery(recoveryKey), record.recoveryHash)) throw new AccessError('Recovery credentials are incorrect.', 401, 'INVALID_RECOVERY');
      } else if (!this.device(record, deviceToken)) {
        throw new AccessError('This browser needs its Recovery Key to establish a device session.', 409, 'RECOVERY_REQUIRED');
      }
      return this.issue(record, deviceToken);
    });
  }
  async authenticate(sessionToken, deviceToken) {
    await this.queue;
    const data = await this.read();
    const session = this.decode(sessionToken, 'session');
    if (!session || typeof session.workspaceId !== 'string' || typeof session.token !== 'string' || session.expiresAt <= Date.now()) return null;
    const record = data.workspaces[session.workspaceId];
    if (!record) return null;
    const device = this.device(record, deviceToken);
    if (!device || !record.sessions.some(s => s.expiresAt > Date.now() && equal(s.hash, digest(session.token)) && equal(s.deviceHash, device.hash))) return null;
    return {userId: `local_workspace_${record.id}`, operator: record.operator, workspaceId: record.id, mode: 'gate'};
  }
  async signout(sessionToken) {
    await this.ready;
    const session = this.decode(sessionToken, 'session');
    if (!session || typeof session.token !== 'string') return;
    await this.update(data => {
      const record = data.workspaces[session.workspaceId];
      if (record) record.sessions = record.sessions.filter(s => !equal(s.hash, digest(session.token)));
    });
  }
  async legacyIdentity(token) {
    await this.ready;
    // Previous signed-cookie format had no kind field. Compatibility only.
    const value = this.decode(token, undefined);
    if (!value || typeof value.email !== 'string' || typeof value.fullName !== 'string') return null;
    const id = `local_${digest(value.email).slice(0, 32)}`;
    if (value.userId !== id && !(value.userId === 'local_seedy' && value.email === 'seedy@sites.test')) return null;
    return {userId: value.userId, operator: value.fullName, email: value.email, mode: 'legacy'};
  }
  async legacyToken(name, email, demo = false) {
    await this.ready;
    if (typeof email !== 'string' || typeof name !== 'string' || email.length > 254 || name.trim().length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AccessError('Enter the name and email used in the earlier local PoC.', 400, 'INVALID_INPUT');
    const normalized = demo ? 'seedy@sites.test' : email.trim().toLowerCase();
    // Undefined kind is omitted by JSON.stringify, preserving the legacy format.
    return this.sign(undefined, {userId: demo ? 'local_seedy' : `local_${digest(normalized).slice(0, 32)}`, fullName: demo ? 'Seedy' : name.trim(), email: normalized});
  }
}
