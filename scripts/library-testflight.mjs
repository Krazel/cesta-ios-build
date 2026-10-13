import fs from 'node:fs';
import assert from 'node:assert/strict';

// Token arrives on hidden stdin, stays in memory, and is sent only to the library.
const raw = await new Promise((resolve, reject) => {
  let input = '';
  const tty = process.stdin.isTTY;
  if (tty) process.stdin.setRawMode(true);
  process.stderr.write('Ready for authorized library input on hidden stdin.\n');
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', value => {
    input += value;
    if (input.length > 20000) reject(Error('Invalid input'));
    if (/[\r\n]/.test(input)) {
      process.stdin.removeAllListeners('data');
      if (tty) process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve(input);
    }
  });
  process.stdin.resume();
});
const { token, phase } = JSON.parse(raw);
assert(['start', 'complete'].includes(phase));
const base = 'https://krazel-studio.krazel.chatgpt.site';
const api = async (method = 'GET', body) => {
  const response = await fetch(base + '/api/projects', {
    method, headers: { 'OAI-Sites-Authorization': 'Bearer ' + token,
      Origin: base, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw Error('Library HTTP ' + response.status);
  return response.json();
};
const current = (await api()).projects.find(p => p.id === 'PR-016');
assert(current && /Cesta/i.test(current.name), 'Expected existing Cesta project');
const run = 'https://github.com/Krazel/cesta-ios-build/actions/runs/38448608042';
const changes = phase === 'start' ? {
  stage: 'En producción',
  detail: '13/10: candidata correctiva 1.2.1(1) en compilación/firma/subida interna. Cola recuperable, plurales y permisos depurados; 13 pruebas correctas. Última beta disponible 1.2(1). Repo PUBLIC por instrucción expresa posterior del usuario, CI estándar sin gasto activado.',
  next: `Esperar CI ${run}, validar IPA y procesado Apple y asignar 1.2.1(1) al grupo interno existente. Repo PUBLIC por petición humana del13/10, secretos protegidos/main; sin App Review ni externos. QA física pendiente. Propietario 01a06e9f-beba-7de0-b5d6-1cdf79cc0479.`,
} : {
  version: '1.2.1', build: 1,
  detail: '13/10: Cesta 1.2.1(1) entregada en TestFlight interno, procesada VALID y grupo existente verificado. Recuperación de cola, plurales y permisos corregidos. Repo PUBLIC por petición expresa para CI estándar. QA física de esta build pendiente; sin App Review ni externos.',
  distribution: 'Web pública + TestFlight interno 1.2.1 (1)',
  next: `Instalar 1.2.1(1) desde TestFlight y comprobar teclado/fotos/reutilización/sincronización entre redes según store/QA-IPHONE-OCTUBRE.md. CI ${run}. Completar capturas nativas, edad y App Privacy del binario exacto antes de envío comercial autorizado. Repo PUBLIC por petición del13/10; soporte/privacidad independientes conservados.`,
  tracking: { ...current.tracking, testflight: 'Interno', appStore: 'En preparación' },
};
if (phase === 'complete') {
  const receipt = JSON.parse(fs.readFileSync('artifacts/TESTFLIGHT-VERIFICACION.json', 'utf8'));
  assert.equal(receipt.version, '1.2.1');
  assert.equal(receipt.buildNumber, '1');
  assert.equal(receipt.build.attributes.processingState, 'VALID');
  assert.equal(receipt.betaDetail.attributes.internalBuildState, 'IN_BETA_TESTING');
}
assert(changes.detail.length <= 500 && changes.next.length <= 1000);
if (Object.entries(changes).some(([key, value]) => JSON.stringify(current[key]) !== JSON.stringify(value)))
  await api('PUT', { revision: current.revision, project: { ...current, ...changes } });
const fresh = (await api()).projects.find(p => p.id === current.id);
for (const [key, value] of Object.entries(changes)) assert.deepEqual(fresh[key], value);
for (const [key, value] of Object.entries(current))
  if (!(key in changes) && !['revision', 'updatedAt'].includes(key)) assert.deepEqual(fresh[key], value);
fs.mkdirSync('artifacts/testflight-20261013', { recursive: true });
fs.writeFileSync(`artifacts/testflight-20261013/library-${phase}.json`, JSON.stringify({
  verifiedAt: new Date().toISOString(), id: fresh.id, revision: fresh.revision, changes,
}, null, 2));
console.log(JSON.stringify({ verified: true, id: fresh.id, revision: fresh.revision, phase }));
