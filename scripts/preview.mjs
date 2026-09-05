import { spawn } from 'node:child_process';

// For isolated development use npm run cloud:dev after npm run build:web.
const url = 'https://cesta.krazel-zodiac-daily.workers.dev';
const [command, args] =
  process.platform === 'win32'
    ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]];
console.log(`Cesta: ${url}`);
const child = spawn(command, args, { stdio: 'ignore', windowsHide: true });
child.on('error', () => console.log(`Abre ${url} en tu navegador.`));
