import { createServer } from 'node:http';
import { parse } from 'node:url';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT ?? 8080);

const ROOM_SIZE = 18;
const HALF = ROOM_SIZE / 2;
const PLAYER_RADIUS = 0.35;
const MAX_STEP = 0.22;

/** @type {Map<string, {id:string,name:string,x:number,z:number,yaw:number,lastSeen:number}>} */
const players = new Map();

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function cleanName(value) {
  if (typeof value !== 'string') return 'Jogador';
  const name = value.trim().slice(0, 24);
  return name || 'Jogador';
}

function clampToRoom(x, z) {
  const min = -HALF + PLAYER_RADIUS;
  const max = HALF - PLAYER_RADIUS;
  return {
    x: Math.max(min, Math.min(max, x)),
    z: Math.max(min, Math.min(max, z))
  };
}

function sanitizeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getSnapshot() {
  const now = Date.now();
  const list = [];
  for (const p of players.values()) {
    if (now - p.lastSeen < 60_000) {
      list.push({ id: p.id, name: p.name, x: p.x, z: p.z, yaw: p.yaw });
    }
  }
  return list;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 20_000) {
        reject(new Error('payload_too_large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const { pathname } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/health') {
    return sendJson(res, 200, { ok: true, roomSize: ROOM_SIZE, players: players.size });
  }

  if (req.method === 'POST' && pathname === '/join') {
    try {
      const body = await parseBody(req);
      const id = randomUUID();
      const name = cleanName(body.name);
      const player = {
        id,
        name,
        x: 0,
        z: 0,
        yaw: 0,
        lastSeen: Date.now()
      };
      players.set(id, player);
      return sendJson(res, 200, {
        ok: true,
        you: player,
        room: { size: ROOM_SIZE },
        players: getSnapshot()
      });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  if (req.method === 'POST' && pathname === '/input') {
    try {
      const body = await parseBody(req);
      const id = typeof body.id === 'string' ? body.id : '';
      const p = players.get(id);
      if (!p) return sendJson(res, 404, { ok: false, error: 'player_not_found' });

      const dx = Math.max(-MAX_STEP, Math.min(MAX_STEP, sanitizeNumber(body.dx)));
      const dz = Math.max(-MAX_STEP, Math.min(MAX_STEP, sanitizeNumber(body.dz)));
      const yaw = sanitizeNumber(body.yaw, p.yaw);
      const next = clampToRoom(p.x + dx, p.z + dz);

      p.x = next.x;
      p.z = next.z;
      p.yaw = yaw;
      p.lastSeen = Date.now();

      return sendJson(res, 200, { ok: true, you: p, players: getSnapshot(), room: { size: ROOM_SIZE } });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  if (req.method === 'GET' && pathname === '/state') {
    return sendJson(res, 200, { ok: true, room: { size: ROOM_SIZE }, players: getSnapshot() });
  }

  sendJson(res, 404, { ok: false, error: 'not_found' });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, p] of players.entries()) {
    if (now - p.lastSeen > 60_000) players.delete(id);
  }
}, 10_000).unref();

server.listen(port, '0.0.0.0', () => {
  console.log(`[hubv4/server] online em http://localhost:${port}`);
});
