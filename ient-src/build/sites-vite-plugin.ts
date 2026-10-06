// Build integration vendored from @openai/sites-vite-plugin 0.2.0.
// See sites-vite-plugin.LICENSE for the upstream MIT license.
import {access, cp, mkdir, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Plugin} from 'vite';
import {installAccessGate} from './access-gate';

async function exists(path: string) {
  try { await access(path); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false; throw error; }
}

export function sites({mockAuth = true} = {}): Plugin {
  let root = process.cwd();
  let command: 'build' | 'serve' = 'build';
  return {
    name: 'sites',
    configResolved(config) { root = config.root; command = config.command; },
    configureServer(server) { if (mockAuth) installAccessGate(server, root); },
    async closeBundle() {
      if (command !== 'build') return;
      const outputDirectory = resolve(root, 'dist', '.openai');
      await rm(outputDirectory, {recursive: true, force: true});
      await mkdir(outputDirectory, {recursive: true});
      await cp(resolve(root, '.openai', 'hosting.json'), resolve(outputDirectory, 'hosting.json'));
      const drizzleSource = resolve(root, 'drizzle');
      if (await exists(drizzleSource)) await cp(drizzleSource, resolve(outputDirectory, 'drizzle'), {recursive: true});
    },
  };
}
