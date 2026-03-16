import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT ?? 8080);
const wss = new WebSocketServer({ port });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'welcome', message: 'Servidor Hubv4 online' }));

  socket.on('message', (raw) => {
    const message = raw.toString();
    socket.send(JSON.stringify({ type: 'echo', payload: message }));
  });
});

console.log(`[hubv4/server] websocket disponível em ws://localhost:${port}`);
