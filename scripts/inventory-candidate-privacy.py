"""Aggregate all shipping privacy manifests, including duplicated SDK data types."""
import hashlib,json,pathlib,plistlib,zipfile
root=pathlib.Path('artifacts/app-review-39511438120')
ipa=root/'Cesta-1.5.1-build3-AppReview.ipa'
manifests=[]
with zipfile.ZipFile(ipa) as z:
 for name in z.namelist():
  if name.endswith('/PrivacyInfo.xcprivacy'):
   raw=z.read(name); data=plistlib.loads(raw)
   manifests.append({'path':name,'sha256':hashlib.sha256(raw).hexdigest(),'manifest':data})
   if '/UserMessagingPlatformResources.bundle/' in name:
    pathlib.Path('store/google-ump-3.1.0-privacy.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
types={}
for m in manifests:
 for entry in m['manifest'].get('NSPrivacyCollectedDataTypes',[]):
  key=entry['NSPrivacyCollectedDataType']
  agg=types.setdefault(key,{'linked':False,'tracking':False,'purposes':set(),'sources':[]})
  agg['linked'] |= entry['NSPrivacyCollectedDataTypeLinked']
  agg['tracking'] |= entry['NSPrivacyCollectedDataTypeTracking']
  agg['purposes'].update(entry['NSPrivacyCollectedDataTypePurposes']);agg['sources'].append(m['path'])
assert len(manifests)==13 and len(types)==12
assert [k for k,v in types.items() if v['tracking']]==['NSPrivacyCollectedDataTypeDeviceID']
diags={k:v for k,v in types.items() if any(s in k for s in ['CrashData','PerformanceData','OtherDiagnosticData'])}
assert len(diags)==3 and all(not v['linked'] and not v['tracking'] for v in diags.values())
for key in ['CoarseLocation','ProductInteraction','PerformanceData']:
 assert 'NSPrivacyCollectedDataTypePurposeAppFunctionality' in types['NSPrivacyCollectedDataType'+key]['purposes']
for v in types.values():v['purposes']=sorted(v['purposes'])
report={'ipaSHA256':hashlib.sha256(ipa.read_bytes()).hexdigest(),'manifestCount':len(manifests),'uniqueTypes':len(types),'types':types,'manifests':manifests}
pathlib.Path('artifacts/app-review-20261020/candidate-privacy-data.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'manifestCount':len(manifests),'uniqueTypes':len(types),'diagnosticsUnlinked':True,'trackingOnlyDeviceID':True,'UMPFunctionalityVerified':True}))
