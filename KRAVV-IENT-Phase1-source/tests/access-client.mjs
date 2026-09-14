import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';

export class AccessClient {
  constructor(base, cookies = {}) {
    assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname), 'Access tests require a loopback server.');
    this.base = base;
    this.cookies = {...cookies};
  }
  get cookie() { return Object.entries(this.cookies).map(([name,value]) => `${name}=${value}`).join('; '); }
  async request(path, options = {}) {
    const response = await fetch(this.base + path, {redirect:'manual', ...options, headers:{Cookie:this.cookie, ...options.headers}});
    for (const value of response.headers.getSetCookie()) {
      const [name, ...parts] = value.split(';')[0].split('=');
      if (/Max-Age=0(?:;|$)/.test(value)) delete this.cookies[name];
      else this.cookies[name] = parts.join('=');
    }
    return response;
  }
  post(path, values, extraHeaders = {}) {
    return this.request(path,{method:'POST',headers:{Origin:this.base,'Content-Type':'application/x-www-form-urlencoded',...extraHeaders},body:new URLSearchParams(values)});
  }
  async state() {
    const response = await this.request('/api/workspace');
    assert.equal(response.status,200,'Authenticated workspace should open');
    return response.json();
  }
}
export function field(html, id) {
  const value = html.match(new RegExp(`id="${id}"[^>]*value="([^"]+)"`))?.[1];
  assert.ok(value, `Missing generated ${id}`);
  return value;
}
export async function initialize(base, operator = 'Functional PoC QA') {
  const client = new AccessClient(base);
  const phrase = `Fictional QA phrase ${randomBytes(12).toString('hex')}`;
  const response = await client.post('/access/initialize',{operator,phrase,confirmation:phrase});
  assert.equal(response.status,201,'Workspace initialization should succeed');
  const html = await response.text();
  const workspaceId = field(html,'createdWorkspaceId'), recoveryKey = field(html,'createdRecoveryKey');
  assert.match(workspaceId,/^KVI-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  const complete = await client.post('/access/continue',{saved:'yes'});
  assert.equal(complete.status,303);
  return {client,phrase,workspaceId,recoveryKey};
}
