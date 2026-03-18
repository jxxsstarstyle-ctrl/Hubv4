import { access } from 'node:fs/promises';

const required = [
  'apps/client/index.html',
  'apps/client/src/main.js',
  'apps/server/src/index.mjs',
  'packages/shared/src/protocol.js',
  'docs/session-setup.md'
];

for (const path of required) {
  await access(path);
}

console.log('[check] estrutura mínima OK');
