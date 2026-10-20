import Foundation

func signals(_ gdpr: Int?, _ purposes: String?, _ interests: String?, _ vendor: String?, _ vendorInterests: String?) -> TrackingConsentSignals {
    TrackingConsentSignals(gdprApplies: gdpr, purposeConsents: purposes, purposeLegitimateInterests: interests, vendorConsents: vendor, vendorLegitimateInterests: vendorInterests)
}
let yes10 = String(repeating: "1", count: 10), yes755 = String(repeating: "1", count: 755)
let accepted = signals(1, yes10, yes10, yes755, yes755)
let allowed: (TrackingConsentSignals) -> Bool = { TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, $0) }
assert(allowed(accepted))
assert(!TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: false, accepted))
assert(!allowed(signals(nil,nil,nil,nil,nil)))
assert(!allowed(signals(0,nil,nil,nil,nil)))
assert(!allowed(signals(1,"0000000000",yes10,yes755,yes755)))
assert(!allowed(signals(1,yes10,yes10,String(repeating:"1",count:754),yes755)))
assert(!allowed(signals(1,yes10,yes10,yes755,nil)))
assert(!allowed(signals(1,"111x111111",yes10,yes755,yes755)))
assert(!allowed(signals(1,"1",yes10,yes755,yes755)))
var regional = accepted
regional.applicableGppSections="2"
assert(allowed(regional))
for invalid in ["7", "7_8", "2_7", "2_", "2,7", "unknown", "-1"] {
    regional.applicableGppSections=invalid
    assert(!allowed(regional), invalid)
}
regional.applicableGppSections=nil
regional.usPrivacy="1YYN"
assert(!allowed(regional))
regional.usPrivacy="1?"
assert(!allowed(regional))
print("19 consent assertions passed against the shipping Swift policy")
