import Foundation

struct TrackingConsentSignals {
    let gdprApplies: Int?
    let purposeConsents: String?
    let purposeLegitimateInterests: String?
    let vendorConsents: String?
    let vendorLegitimateInterests: String?
    var applicableGppSections: String? = nil
    var usPrivacy: String? = nil
}

enum TrackingConsentEligibility {
    private static let googleVendorID = 755
    private static let personalizedConsentPurposes = [1, 3, 4]
    private static let operationalPurposes = [2, 7, 9, 10]

    static func isATTRequestAllowed(
        canRequestAds: Bool,
        userDefaults: UserDefaults = .standard
    ) -> Bool {
        isATTRequestAllowed(
            canRequestAds: canRequestAds,
            TrackingConsentSignals(
                gdprApplies: integerValue(
                    from: userDefaults.object(forKey: "IABTCF_gdprApplies")
                ),
                purposeConsents: userDefaults.string(forKey: "IABTCF_PurposeConsents"),
                purposeLegitimateInterests: userDefaults.string(
                    forKey: "IABTCF_PurposeLegitimateInterests"
                ),
                vendorConsents: userDefaults.string(forKey: "IABTCF_VendorConsents"),
                vendorLegitimateInterests: userDefaults.string(
                    forKey: "IABTCF_VendorLegitimateInterests"
                ),
                applicableGppSections: userDefaults.string(forKey: "IABGPP_GppSID"),
                usPrivacy: userDefaults.string(forKey: "IABUSPrivacy_String")
            )
        )
    }

    static func isATTRequestAllowed(
        canRequestAds: Bool,
        _ signals: TrackingConsentSignals
    ) -> Bool {
        guard canRequestAds else { return false }
        // UMP's permission to request contextual ads is not permission to track.
        // For non-TCF GPP regions, keep ATT off rather than infer permission from
        // a missing GDPR flag. UMP/Google still apply the relevant regional choices.
        if let sections = signals.applicableGppSections, !sections.isEmpty {
            let values = sections.split(separator: "_", omittingEmptySubsequences: false)
            guard !values.isEmpty, values.allSatisfy({ $0 == "2" }) else { return false }
        }
        if let privacy = signals.usPrivacy, !privacy.isEmpty {
            let chars = Array(privacy)
            guard chars.count == 4, chars[0] == "1",
                  chars[2] == "N" || chars[2] == "-" else { return false }
        }

        // Cesta only enables personalization with an explicit, complete TCF grant.
        // Other regions use non-personalized/RDP ads; GDPR not applying is not a
        // user consent. This also avoids depending on a US CMP opt-out to track.
        guard signals.gdprApplies == 1,
              personalizedConsentPurposes.allSatisfy({
                  bit($0, isEnabledIn: signals.purposeConsents)
              }),
              operationalPurposes.allSatisfy({ purpose in
                  bit(purpose, isEnabledIn: signals.purposeConsents)
                      || bit(purpose, isEnabledIn: signals.purposeLegitimateInterests)
              }),
              bit(googleVendorID, isEnabledIn: signals.vendorConsents),
              bit(googleVendorID, isEnabledIn: signals.vendorLegitimateInterests)
        else {
            return false
        }

        return true
    }

    private static func integerValue(from value: Any?) -> Int? {
        if let number = value as? NSNumber {
            return number.intValue
        }
        if let string = value as? String {
            return Int(string)
        }
        return nil
    }

    private static func bit(_ oneBasedPosition: Int, isEnabledIn value: String?) -> Bool {
        guard oneBasedPosition > 0,
              let value,
              value.allSatisfy({ $0 == "0" || $0 == "1" }),
              value.count >= oneBasedPosition
        else {
            return false
        }

        let index = value.index(value.startIndex, offsetBy: oneBasedPosition - 1)
        return value[index] == "1"
    }
}
