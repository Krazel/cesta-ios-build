import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const out = 'artifacts/native-qa';
fs.mkdirSync(out, { recursive: true });
const run = (cmd, args, options = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, ...options });
  if (r.status !== 0) throw Error(`${cmd} ${args.join(' ')} failed: ${r.stderr || ''}`);
  return r.stdout;
};
const devices = JSON.parse(run('xcrun', ['simctl','list','devices','available','--json']));
fs.writeFileSync(`${out}/devices.json`, JSON.stringify(devices, null, 2));
const available = Object.entries(devices.devices).filter(([key]) => key.includes('iOS')).flatMap(([,values]) => values);
const phone = available.find(d => /iPhone.*Pro Max/.test(d.name));
const tablet = available.find(d => /iPad Pro.*13-inch/.test(d.name));
if (!phone || !tablet) throw Error('Largest iPhone and 13-inch iPad simulators required');
const common = ['-workspace','ios/Cesta.xcworkspace','-scheme','Cesta','-configuration','Release','-sdk','iphonesimulator','-derivedDataPath',`${out}/DerivedData`,'CODE_SIGNING_ALLOWED=NO','-parallel-testing-enabled','NO'];
const xcode = (args, name) => {
  const fd = fs.openSync(`${out}/${name}.log`, 'w');
  const r = spawnSync('xcodebuild', args, { stdio: ['ignore', fd, fd] });
  fs.closeSync(fd);
  console.log(fs.readFileSync(`${out}/${name}.log`,'utf8').split('\n').filter(l => /error:|BUILD |TEST |Executed|failed|passed/i.test(l)).slice(-45).join('\n'));
  return r.status === 0;
};
if (!xcode([...common,'-destination',`platform=iOS Simulator,id=${phone.udid}`,'build-for-testing'], 'build')) process.exit(1);
const results = [];
for (const [kind, device] of [['phone',phone],['tablet',tablet]]) {
  if (device.state !== 'Booted') run('xcrun',['simctl','boot',device.udid]);
  run('xcrun',['simctl','bootstatus',device.udid,'-b']);
  run('xcrun',['simctl','status_bar',device.udid,'override','--time','9:41','--dataNetwork','wifi','--wifiMode','active','--wifiBars','3','--batteryState','charged','--batteryLevel','100']);
  for (const language of ['Spanish','English']) {
    spawnSync('xcrun',['simctl','uninstall',device.udid,'com.dmkr.cesta.B2X6D3A9J9']);
    const name = `${kind}-${language.toLowerCase()}`, bundle = `${out}/${name}.xcresult`;
    const ok = xcode([...common,'-destination',`platform=iOS Simulator,id=${device.udid}`,'-resultBundlePath',bundle,`-only-testing:CestaUITests/CestaUITests/test${language}`,'test-without-building'],name);
    const captureDir = `${out}/captures/${name}`;
    fs.mkdirSync(captureDir,{recursive:true});
    if (fs.existsSync(bundle)) {
      const r = spawnSync('xcrun',['xcresulttool','export','attachments','--path',bundle,'--output-path',captureDir],{encoding:'utf8'});
      fs.writeFileSync(`${out}/${name}-attachments.log`,r.stdout+r.stderr);
    }
    results.push({kind,language,device:device.name,ok});
    fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
    if (!ok) process.exit(1);
  }
  run('xcrun',['simctl','shutdown',device.udid]);
}
if (!xcode([...common,'-destination',`platform=iOS Simulator,id=${phone.udid}`,'-only-testing:CestaUITests/CestaUITests/testConsentFailsClosed','test-without-building'],'consent')) process.exit(1);
console.log(JSON.stringify({nativePassed:true,results}));
