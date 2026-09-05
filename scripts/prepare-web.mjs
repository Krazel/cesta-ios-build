import fs from 'node:fs';
import crypto from 'node:crypto';
let html = fs.readFileSync('dist/index.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
const revision = crypto.createHash('sha256').update('shell-v2:' + html).digest('hex').slice(0, 16);
// Workers redirects /index.html to /. A redirected cached response cannot
// satisfy every navigation mode, so retain the canonical document directly.
const assets = ['/', '/favicon.ico', ...scripts];
fs.writeFileSync(
  'dist/service-worker.js',
  `const CACHE='cesta-web-${revision}';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(${JSON.stringify(assets)})).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('cesta-web-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
if(request.mode==='navigate'){event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/'))));return;}
if(url.pathname.startsWith('/_expo/static/')||url.pathname==='/favicon.ico')event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});\n`,
);
html = html.replace(
  '</body>',
  `<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));}</script></body>`,
);
fs.writeFileSync('dist/index.html', html);
fs.writeFileSync(
  'dist/_headers',
  '/service-worker.js\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n/*\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n',
);
