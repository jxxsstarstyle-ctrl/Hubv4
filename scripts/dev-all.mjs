import { spawn } from 'node:child_process';

const procs = [
  spawn(process.execPath, ['apps/server/src/index.mjs'], { stdio: 'inherit' }),
  spawn(process.execPath, ['apps/client/dev-server.mjs'], { stdio: 'inherit' })
];

const shutdown = () => {
  for (const p of procs) p.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
