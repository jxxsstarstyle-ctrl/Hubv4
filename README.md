# Hubv4 — Lobby FPS inicial

Base funcional para começar o desenvolvimento do jogo 3D online com:

- lobby simples (entrada por nome);
- avatar em primeira pessoa;
- movimentação WASD + mouse look;
- sala inicial otimizada (raycasting em resolução interna reduzida);
- servidor autoritativo mínimo para presença e input.

## Rodando

```bash
npm run dev
```

- Cliente: `http://localhost:5173`
- Servidor: `http://localhost:8080`

## Controles

- `W A S D`: movimentação
- Mouse: olhar
- `ESC`: solta o cursor

## Endpoints

- `GET /health`
- `POST /join` `{ name }`
- `POST /input` `{ id, dx, dz, yaw }`
- `GET /state`

## Checks

```bash
npm run check
npm run smoke
```
