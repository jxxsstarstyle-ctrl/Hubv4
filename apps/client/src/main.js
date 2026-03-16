const SERVER = `${location.protocol}//${location.hostname}:8080`;
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d', { alpha: false });

const lobby = document.querySelector('#lobby');
const joinForm = document.querySelector('#join-form');
const statusEl = document.querySelector('#status');
const hud = document.querySelector('#hud');
const playerLabel = document.querySelector('#player-label');
const playersCount = document.querySelector('#players-count');

if (!ctx || !joinForm || !statusEl || !lobby || !hud || !playerLabel || !playersCount) {
  throw new Error('UI inválida');
}

const state = {
  me: null,
  players: [],
  roomSize: 18,
  keys: new Set(),
  yaw: 0,
  pos: { x: 0, z: 0 },
  lock: false,
  lastInputSync: 0,
  running: false
};

const MAP = {
  size: 18,
  walls: []
};

for (let z = 0; z < MAP.size; z++) {
  for (let x = 0; x < MAP.size; x++) {
    const border = x === 0 || z === 0 || x === MAP.size - 1 || z === MAP.size - 1;
    const pillar = (x % 4 === 0 && z % 4 === 0 && x > 2 && z > 2 && x < MAP.size - 3 && z < MAP.size - 3);
    MAP.walls.push(border || pillar ? 1 : 0);
  }
}

function cellAt(x, z) {
  if (x < 0 || z < 0 || x >= MAP.size || z >= MAP.size) return 1;
  return MAP.walls[(z | 0) * MAP.size + (x | 0)];
}

function worldToMap(x, z) {
  const half = state.roomSize / 2;
  return { mx: x + half, mz: z + half };
}

function canMoveTo(nx, nz) {
  const { mx, mz } = worldToMap(nx, nz);
  return cellAt(mx, mz) === 0;
}

async function api(path, method = 'GET', body) {
  const res = await fetch(`${SERVER}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * 0.55 * dpr);
  canvas.height = Math.floor(window.innerHeight * 0.55 * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

window.addEventListener('resize', resize);
resize();

joinForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#name').value.trim();
  statusEl.textContent = 'Entrando na sala...';

  try {
    const payload = await api('/join', 'POST', { name });
    state.me = payload.you.id;
    state.players = payload.players;
    state.roomSize = payload.room.size;
    state.pos.x = payload.you.x;
    state.pos.z = payload.you.z;
    state.yaw = payload.you.yaw;

    lobby.classList.add('hidden');
    hud.classList.remove('hidden');
    canvas.classList.remove('hidden');
    playerLabel.textContent = `Você: ${payload.you.name}`;

    statusEl.textContent = 'Conectado';
    state.running = true;
    requestPointerLock();
    requestAnimationFrame(loop);
  } catch (err) {
    statusEl.textContent = `Falha no join: ${err.message}`;
  }
});

function requestPointerLock() {
  canvas.requestPointerLock?.();
}

canvas.addEventListener('click', requestPointerLock);

document.addEventListener('pointerlockchange', () => {
  state.lock = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (event) => {
  if (!state.lock) return;
  state.yaw += event.movementX * 0.0025;
});

document.addEventListener('keydown', (event) => {
  if (['w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
    state.keys.add(event.key.toLowerCase());
  }
});

document.addEventListener('keyup', (event) => {
  state.keys.delete(event.key.toLowerCase());
});

function simulateMovement(dt) {
  const speed = 2.9;
  const forward = (state.keys.has('w') ? 1 : 0) + (state.keys.has('s') ? -1 : 0);
  const strafe = (state.keys.has('d') ? 1 : 0) + (state.keys.has('a') ? -1 : 0);

  if (!forward && !strafe) return { dx: 0, dz: 0 };

  const sin = Math.sin(state.yaw);
  const cos = Math.cos(state.yaw);

  const vx = (sin * forward + cos * strafe) * speed * dt;
  const vz = (cos * forward - sin * strafe) * speed * dt;

  const nx = state.pos.x + vx;
  const nz = state.pos.z + vz;

  if (canMoveTo(nx, state.pos.z)) state.pos.x = nx;
  if (canMoveTo(state.pos.x, nz)) state.pos.z = nz;

  return { dx: state.pos.x - (state.lastX ?? state.pos.x), dz: state.pos.z - (state.lastZ ?? state.pos.z) };
}

function renderSkyFloor() {
  const { width, height } = canvas;
  ctx.fillStyle = '#5f89c4';
  ctx.fillRect(0, 0, width, height / 2);
  ctx.fillStyle = '#20242b';
  ctx.fillRect(0, height / 2, width, height / 2);
}

function castRays() {
  const { width, height } = canvas;
  const fov = Math.PI / 3;
  const maxDist = 24;
  const { mx, mz } = worldToMap(state.pos.x, state.pos.z);

  for (let x = 0; x < width; x += 2) {
    const cameraX = (x / width - 0.5) * fov;
    const angle = state.yaw + cameraX;
    const rayX = Math.sin(angle);
    const rayZ = Math.cos(angle);

    let dist = 0.01;
    let hit = false;
    while (dist < maxDist) {
      const tx = mx + rayX * dist;
      const tz = mz + rayZ * dist;
      if (cellAt(tx, tz) > 0) {
        hit = true;
        break;
      }
      dist += 0.05;
    }

    if (hit) {
      const corrected = dist * Math.cos(cameraX);
      const wallH = Math.min(height, (height * 0.82) / corrected);
      const y = (height - wallH) / 2;
      const shade = Math.max(30, 220 - corrected * 20) | 0;
      ctx.fillStyle = `rgb(${shade}, ${shade + 12}, ${shade + 20})`;
      ctx.fillRect(x, y, 2, wallH);
    }
  }
}

function renderCrosshair() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx, cy + 8);
  ctx.stroke();
}

async function syncServer(dx, dz) {
  if (!state.me) return;
  const now = performance.now();
  if (now - state.lastInputSync < 80) return;
  state.lastInputSync = now;

  try {
    const payload = await api('/input', 'POST', {
      id: state.me,
      dx,
      dz,
      yaw: state.yaw
    });
    state.players = payload.players;
    playersCount.textContent = `Jogadores na sala: ${payload.players.length}`;
  } catch {
    playersCount.textContent = 'Reconectando...';
  }
}

let last = performance.now();
function loop(now) {
  if (!state.running) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  state.lastX = state.pos.x;
  state.lastZ = state.pos.z;
  const movement = simulateMovement(dt);

  renderSkyFloor();
  castRays();
  renderCrosshair();

  syncServer(movement.dx, movement.dz);
  requestAnimationFrame(loop);
}

(async function bootstrap() {
  try {
    const health = await api('/health');
    statusEl.textContent = `Servidor online • sala ${health.roomSize}x${health.roomSize}`;
  } catch {
    statusEl.textContent = 'Servidor offline em http://localhost:8080';
  }
})();
