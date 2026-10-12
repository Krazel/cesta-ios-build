import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Personal-list preview only. No cloud proxy, user database, deployment or uploads.
const root = path.resolve('dist');
const port = Number(process.env.CESTA_PREVIEW_PORT || 8790);
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(
        JSON.stringify({
          message:
            'Necesitas conexión para compartir. Tus cambios siguen guardados en este dispositivo.',
        }),
      );
      return;
    }
    const file = path.resolve(
      root,
      '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)),
    );
    if (!file.startsWith(root + path.sep) || request.method !== 'GET') {
      response.writeHead(404);
      response.end();
      return;
    }
    const body = await readFile(file);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.ico': 'image/x-icon',
      '.json': 'application/json',
    };
    response.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Cesta local candidate: http://127.0.0.1:${port} (personal lists; no cloud)`),
);
