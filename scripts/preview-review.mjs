import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('design/review-20261016');
const port = Number(process.env.CESTA_REVIEW_PORT || 8791);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(
      root,
      '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)),
    );
    if (req.method !== 'GET' || !file.startsWith(root + path.sep) || !types[path.extname(file)])
      throw Error('Not found');
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Cesta review: http://127.0.0.1:${port}/ (local only)`),
);
