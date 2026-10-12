"""Read only: inventory the preserved TestFlight binary, never sign or upload."""
import hashlib
import json
import pathlib
import plistlib
import zipfile

root = pathlib.Path(__file__).resolve().parents[1]
ipa = root / 'artifacts/testflight-36933000531/Cesta-1.2-build1-TestFlight.ipa'
expected = '790680d0f8e8de403cb0f5de5f732cd1746f54cebeba6bacc5665db3de20a98a'
digest = hashlib.sha256(ipa.read_bytes()).hexdigest()
assert digest == expected, 'Preserved delivery does not match its receipt'
with zipfile.ZipFile(ipa) as archive:
    assert archive.testzip() is None, 'Invalid ZIP entry'
    info_name = next(name for name in archive.namelist()
                     if name.startswith('Payload/') and name.count('/') == 2 and name.endswith('/Info.plist'))
    info = plistlib.loads(archive.read(info_name))
    assert (info['CFBundleShortVersionString'], info['CFBundleVersion']) == ('1.2', '1')
    manifests = []
    for name in archive.namelist():
        if name.endswith('/PrivacyInfo.xcprivacy'):
            manifests.append({'path': name, 'content': plistlib.loads(archive.read(name))})
    receipt = {
        'purpose': 'Preserved 1.2(1) inventory; does not validate the October candidate on iPhone',
        'ipa': str(ipa.relative_to(root)), 'sha256': digest, 'zipCRCVerified': True,
        'bundle': info['CFBundleIdentifier'], 'version': '1.2', 'build': '1',
        'minimumOS': info.get('MinimumOSVersion'),
        'permissions': {key: value for key, value in info.items() if key.startswith('NS') and key.endswith('UsageDescription')},
        'ATS': info.get('NSAppTransportSecurity'),
        'privacyManifests': manifests,
    }
output = root / 'artifacts/qa-october/delivered-ipa-inventory.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'verified': True, 'version': '1.2', 'build': '1', 'privacyManifestCount': len(manifests),
                  'permissionKeys': list(receipt['permissions'])}))
