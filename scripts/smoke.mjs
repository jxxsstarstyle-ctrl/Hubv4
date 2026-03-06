import { spawn } from 'node:child_process';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function post(path, body) {
  const res = await fetch(`http://127.0.0.1:8091${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

const child = spawn(process.execPath, ['apps/server/src/index.mjs'], {
  env: { ...process.env, PORT: '8091' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
child.stdout.on('data', (data) => { output += data.toString(); });
child.stderr.on('data', (data) => { output += data.toString(); });

await wait(600);

const started = output.includes('http://localhost:8091');
if (!started) {
  child.kill('SIGTERM');
  console.error('[smoke] servidor não iniciou corretamente');
  process.exit(1);
}

const join = await post('/join', { name: 'Smoke' });
if (!join?.ok || !join?.you?.id) {
  child.kill('SIGTERM');
  console.error('[smoke] /join falhou');
  process.exit(1);
}

const input = await post('/input', { id: join.you.id, dx: 0.1, dz: 0.1, yaw: 0.5 });
if (!input?.ok || !Array.isArray(input?.players) || input.players.length < 1) {
  child.kill('SIGTERM');
  console.error('[smoke] /input falhou');
  process.exit(1);
}

child.kill('SIGTERM');
console.log('[smoke] servidor e fluxo de lobby/input OK');
