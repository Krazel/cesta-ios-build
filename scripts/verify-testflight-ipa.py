"""Independent read-only ZIP, identity, privacy and endpoint checks after CI."""
import datetime
import hashlib
import json
import pathlib
import plistlib
import struct
import sys
import zipfile

folder = pathlib.Path(sys.argv[1]).resolve()
manifest = json.loads((folder / 'testflight-build.json').read_text(encoding='utf-8'))
expected_version, expected_build, expected_commit, expected_run = sys.argv[2:6] if len(sys.argv) == 6 else ('1.2.1', '1', '1aa38a8b5fe68bf6f38d319b49809d836d8d6b95', '38448608042')
assert manifest['version'] == expected_version and str(manifest['build']) == expected_build
assert manifest['commit'] == expected_commit
assert str(manifest['run']) == expected_run
assert manifest['signatureVerified'] and manifest['uploadAccepted']
ipa = folder / f'Cesta-{expected_version}-build{expected_build}-TestFlight.ipa'
digest = hashlib.sha256(ipa.read_bytes()).hexdigest()
assert digest == manifest['sha256'] and ipa.stat().st_size == manifest['bytes']
with zipfile.ZipFile(ipa) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    info_path = next(p for p in names if p.startswith('Payload/') and p.count('/') == 2 and p.endswith('/Info.plist'))
    app = info_path.rsplit('/', 1)[0]
    info = plistlib.loads(archive.read(info_path))
    assert info['CFBundleIdentifier'] == manifest['bundleId'] == 'com.dmkr.cesta.B2X6D3A9J9'
    assert info['CFBundleShortVersionString'] == expected_version and str(info['CFBundleVersion']) == expected_build
    assert info['MinimumOSVersion'] == '16.4'
    assert int(info['DTXcode']) >= 2640
    assert info['CFBundleSupportedPlatforms'] == ['iPhoneOS']
    assert set(info['UIDeviceFamily']) == {1, 2}
    for key in ['NSFaceIDUsageDescription', 'NSCameraUsageDescription', 'NSMicrophoneUsageDescription', 'NSLocalNetworkUsageDescription']:
        assert key not in info, key
    assert not info.get('NSAppTransportSecurity', {}).get('NSAllowsArbitraryLoads', False)
    for filename in names:
        if filename.endswith('/InfoPlist.strings'):
            localized = archive.read(filename)
            assert b'NSFaceIDUsageDescription' not in localized
            assert b'NSLocalNetworkUsageDescription' not in localized
    executable = archive.read(app + '/' + info['CFBundleExecutable'])
    assert executable[:4] == b'\xcf\xfa\xed\xfe'
    assert struct.unpack('<I', executable[4:8])[0] == 0x100000C
    js = archive.read(app + '/main.jsbundle')
    assert b'https://cesta.krazel-zodiac-daily.workers.dev' in js
    if expected_version == '1.3':
        for marker in [b'View tutorial', b'Start another shop', b'Choose unit']:
            assert marker in js or marker.decode().encode('utf-16le') in js, marker
    if expected_version == '1.4':
        for marker in [b'purchaseSources', b'Update saved list', b'Finish shop', b'Bought', b'You can shop together']:
            assert marker in js or marker.decode().encode('utf-16le') in js, marker
    profile = archive.read(app + '/embedded.mobileprovision')
    start = profile.index(b'<?xml')
    end = profile.index(b'</plist>', start) + len(b'</plist>')
    provisioning = plistlib.loads(profile[start:end])
    assert provisioning['UUID'] == manifest['profileId']
    assert 'B2X6D3A9J9' in provisioning['TeamIdentifier']
    assert provisioning['Entitlements']['application-identifier'].endswith('.' + manifest['bundleId'])
    assert not provisioning['Entitlements'].get('get-task-allow', False)
    assert provisioning['ExpirationDate'] > datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    privacy = [p for p in names if p.endswith('/PrivacyInfo.xcprivacy')]
    for filename in privacy:
        assert not plistlib.loads(archive.read(filename)).get('NSPrivacyTracking', False)
    receipt = {
        'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'version': expected_version, 'build': expected_build, 'sha256': digest, 'bytes': ipa.stat().st_size,
        'commit': manifest['commit'], 'run': manifest['run'], 'zipEntries': len(names),
        'zipCRCVerified': True, 'arm64Verified': True, 'httpsInJavaScript': True,
        'minimumOS': info['MinimumOSVersion'], 'Xcode': info['DTXcode'], 'SDK': info['DTSDKName'],
        'unusedPermissionsAbsent': True, 'profileIdentityAndExpiryVerified': True,
        'privacyManifestCount': len(privacy), 'codesignVerifiedInCI': True,
        'nativePhysicalQA': False,
    }
(folder / 'ipa-verification.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
print(json.dumps(receipt))
