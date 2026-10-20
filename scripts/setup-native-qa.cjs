// Adds a test-only target to Expo's generated project. Never run for archives.
const fs = require('node:fs');
const path = require('node:path');
const xcode = require('xcode');
const root = 'ios/Cesta.xcodeproj';
const p = xcode.project(`${root}/project.pbxproj`);
p.parseSync();
const app = p.getFirstTarget();
const oldDeps = [...app.firstTarget.dependencies];
const test = p.addTarget('CestaUITests', 'unit_test_bundle', 'CestaUITests', 'com.dmkr.cesta.B2X6D3A9J9.uitests');
test.pbxNativeTarget.productType = '"com.apple.product-type.bundle.ui-testing"';
app.firstTarget.dependencies = oldDeps;
p.addTargetDependency(test.uuid, [app.uuid]);
p.addTargetAttribute('TestTargetID', app.uuid, test);
const file = p.pbxFileReferenceSection()[test.pbxNativeTarget.productReference];
file.path = 'CestaUITests.xctest';
file.name = 'CestaUITests.xctest';
file.explicitFileType = 'wrapper.cfbundle';
const configs = p.pbxXCConfigurationList()[test.pbxNativeTarget.buildConfigurationList].buildConfigurations;
for (const ref of configs) {
  const b = p.pbxXCBuildConfigurationSection()[ref.value].buildSettings;
  delete b.INFOPLIST_FILE;
  Object.assign(b, { GENERATE_INFOPLIST_FILE: 'YES', SWIFT_VERSION: '5.0',
    IPHONEOS_DEPLOYMENT_TARGET: '16.4', TARGETED_DEVICE_FAMILY: '"1,2"',
    CODE_SIGNING_ALLOWED: 'NO', TEST_TARGET_NAME: 'Cesta',
    FRAMEWORK_SEARCH_PATHS: '"$(inherited) $(PLATFORM_DIR)/Developer/Library/Frameworks"' });
}
fs.mkdirSync('ios/CestaUITests', { recursive: true });
for (const name of ['CestaUITests.swift', 'CestaStoreKitQA.storekit'])
  fs.copyFileSync(`tests/native/${name}`, `ios/CestaUITests/${name}`);
fs.copyFileSync('modules/cesta-commerce/ios/TrackingConsentEligibility.swift', 'ios/CestaUITests/TrackingConsentEligibility.swift');
p.addBuildPhase(['CestaUITests/CestaUITests.swift', 'CestaUITests/TrackingConsentEligibility.swift'], 'PBXSourcesBuildPhase', 'Sources', test.uuid);
p.addBuildPhase(['CestaUITests/CestaStoreKitQA.storekit'], 'PBXResourcesBuildPhase', 'Resources', test.uuid);
fs.writeFileSync(`${root}/project.pbxproj`, p.writeSync());
const scheme = `${root}/xcshareddata/xcschemes/Cesta.xcscheme`;
let xml = fs.readFileSync(scheme, 'utf8');
const reference = `<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${test.uuid}" BuildableName="CestaUITests.xctest" BlueprintName="CestaUITests" ReferencedContainer="container:Cesta.xcodeproj"/>`;
xml = xml.replace('</BuildActionEntries>', `<BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">${reference}</BuildActionEntry></BuildActionEntries>`);
xml = xml.replace(/(<TestAction[\s\S]*?)buildConfiguration = "Debug"/, '$1buildConfiguration = "Release"');
const testables = `<Testables><TestableReference skipped="NO" parallelizable="NO">${reference}</TestableReference></Testables>`;
xml = /<Testables[\s\S]*?<\/Testables>/.test(xml) ? xml.replace(/<Testables[\s\S]*?<\/Testables>/, testables) : xml.replace('</TestAction>', `${testables}</TestAction>`);
xml = xml.replace('</TestAction>', '<StoreKitConfigurationFileReference identifier="../../CestaUITests/CestaStoreKitQA.storekit"/></TestAction>');
fs.writeFileSync(scheme, xml);
console.log('Test-only native target and StoreKit catalogue configured');
