import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const port = Number(process.env.CLIENT_PORT ?? 5173);
const root = new URL('.', import.meta.url).pathname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

createServer(async (req, res) => {
  const rawPath = req.url === '/' ? '/index.html' : req.url;
  const file = join(root, rawPath);

  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] ?? 'text/plain; charset=utf-8' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`[hubv4/client] disponível em http://localhost:${port}`);
});
