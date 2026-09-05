import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

if (process.platform !== 'darwin') {
  console.error(
    'Este comando requiere macOS y Xcode. En Windows usa el flujo privado de GitHub Actions.',
  );
  process.exit(1);
}
const env = { ...process.env, CI: '1', NODE_BINARY: process.execPath };
if (!env.EXPO_PUBLIC_API_URL) throw new Error('Configura EXPO_PUBLIC_API_URL antes de compilar.');
const api = new URL(env.EXPO_PUBLIC_API_URL);
if (
  !['http:', 'https:'].includes(api.protocol) ||
  ['localhost', '127.0.0.1', '::1'].includes(api.hostname)
)
  throw new Error('La API debe tener una dirección accesible desde el iPhone.');
env.EXPO_PUBLIC_SHARE_URL ||= env.EXPO_PUBLIC_API_URL;
function run(command, args, cwd = process.cwd()) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} terminó con código ${result.status}`);
}
run(process.execPath, [
  'node_modules/expo/bin/cli',
  'prebuild',
  '--platform',
  'ios',
  '--no-install',
]);
run('pod', ['install', '--project-directory=ios']);
const workspace = readdirSync('ios').find((name) => name.endsWith('.xcworkspace'));
if (!workspace) throw new Error('No se ha generado el proyecto de Xcode.');
const scheme = workspace.replace('.xcworkspace', '');
const artifacts = resolve('artifacts');
mkdirSync(artifacts, { recursive: true });
const staging = mkdtempSync(join(artifacts, 'sideload-build-'));
run('xcodebuild', [
  '-workspace',
  join('ios', workspace),
  '-scheme',
  scheme,
  '-configuration',
  'Release',
  '-sdk',
  'iphoneos',
  '-destination',
  'generic/platform=iOS',
  '-derivedDataPath',
  join(staging, 'DerivedData'),
  'CODE_SIGNING_ALLOWED=NO',
  'CODE_SIGNING_REQUIRED=NO',
  'CODE_SIGN_IDENTITY=',
  'ARCHS=arm64',
  'ONLY_ACTIVE_ARCH=NO',
  'build',
]);
const products = join(staging, 'DerivedData', 'Build', 'Products', 'Release-iphoneos');
const appName = readdirSync(products).find((name) => name.endsWith('.app'));
if (!appName) throw new Error('Xcode no ha generado la aplicación para iPhone.');
const app = join(products, appName);
if (!existsSync(join(app, 'main.jsbundle')))
  throw new Error('Falta el código JavaScript incluido en la app.');
run('plutil', ['-extract', 'DTPlatformName', 'raw', '-o', '-', join(app, 'Info.plist')]);
run('xcrun', ['lipo', '-archs', join(app, scheme)]);
const payload = join(staging, 'Payload');
mkdirSync(payload);
cpSync(app, join(payload, appName), {
  recursive: true,
  preserveTimestamps: true,
  verbatimSymlinks: true,
});
const output = join(artifacts, 'Cesta-Sideloadly.ipa');
run('ditto', ['-c', '-k', '--norsrc', '--keepParent', payload, output]);
console.log(`IPA de iPhone sin firmar: ${output}`);
