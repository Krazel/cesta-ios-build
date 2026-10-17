Pod::Spec.new do |s|
  s.name = 'CestaCommerce'
  s.version = '1.0.0'
  s.summary = 'Cesta StoreKit and consent-gated AdMob integration'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'Krazel'
  s.homepage = 'https://krazel.github.io/cesta/'
  s.platforms = { :ios => '16.4' }
  s.source = { :git => 'https://github.com/Krazel/cesta-ios-build.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'Google-Mobile-Ads-SDK', '12.14.0'
  s.dependency 'GoogleUserMessagingPlatform', '3.1.0'
  s.source_files = '**/*.{h,m,mm,swift}'
  s.swift_version = '5.9'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_COMPILATION_MODE' => 'wholemodule' }
  s.resource_bundles = { 'CestaCommercePrivacy' => ['PrivacyInfo.xcprivacy'] }
end

