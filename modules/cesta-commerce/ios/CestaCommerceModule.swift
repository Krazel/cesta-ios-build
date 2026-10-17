import ExpoModulesCore
import StoreKit
import GoogleMobileAds
import UIKit

@MainActor
final class CestaCommerceController {
  static let shared = CestaCommerceController()
  let consent = AdConsentManager()
  let ids = ["199", "499", "999", "1499", "1999", "2499"].map { "com.dmkr.cesta.noads.monthly.\($0)" }
  var changed: (([String: Any]) -> Void)?
  private var updates: Task<Void, Never>?
  private var expiry: Task<Void, Never>?
  private var products: [Product] = []
  private(set) var initialized = false
  private(set) var adsRemoved = false
  private var expiresAt: Date?
  var adsAllowed: Bool { initialized && !adsRemoved && consent.canRequestAds && consent.isMobileAdsStarted }

  func state() -> [String: Any] {
    ["supported": true, "reviewSupported": Bundle.main.appStoreReceiptURL?.lastPathComponent != "sandboxReceipt", "initialized": initialized, "adsRemoved": adsRemoved,
     "adsAllowed": adsAllowed, "privacyRequired": consent.isPrivacyOptionsRequired,
     "expiresAt": expiresAt.map { ISO8601DateFormatter().string(from: $0) } as Any? ?? NSNull(),
     "products": products.map { ["id": $0.id, "name": $0.displayName, "price": $0.displayPrice, "amount": NSDecimalNumber(decimal: $0.price).doubleValue] }]
  }
  func refresh() async -> [String: Any] {
    if updates == nil {
      updates = Task { [weak self] in
        for await result in Transaction.updates {
          guard let self, case .verified(let transaction) = result,
                self.ids.contains(transaction.productID) else { continue }
          await transaction.finish()
          _ = await self.refresh()
        }
      }
    }
    var active = false
    var latest: Date?
    for await result in Transaction.currentEntitlements {
      guard case .verified(let transaction) = result,
            ids.contains(transaction.productID), transaction.revocationDate == nil,
            !transaction.isUpgraded, let expiration = transaction.expirationDate, expiration > Date() else { continue }
      active = true
      latest = max(latest ?? expiration, expiration)
    }
    adsRemoved = active
    expiresAt = latest
    initialized = true
    expiry?.cancel()
    if let expiration = latest {
      let seconds = max(1, min(86400, expiration.timeIntervalSinceNow + 1))
      expiry = Task { [weak self] in
        do { try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000)) } catch { return }
        _ = await self?.refresh()
      }
    }
    changed?(state())
    return state()
  }
  func loadProducts() async throws -> [String: Any] {
    let fetched = try await Product.products(for: ids)
    products = fetched.filter { $0.type == .autoRenewable }.sorted { $0.price < $1.price }
    return await refresh()
  }
  func purchase(_ id: String) async throws -> [String: Any] {
    guard ids.contains(id) else { throw NSError(domain: "CestaStore", code: 1) }
    if !products.contains(where: { $0.id == id }) { _ = try await loadProducts() }
    guard let product = products.first(where: { $0.id == id }) else { throw NSError(domain: "CestaStore", code: 2) }
    let outcome: String
    switch try await product.purchase() {
    case .success(let result):
      guard case .verified(let transaction) = result, ids.contains(transaction.productID) else { throw NSError(domain: "CestaStore", code: 3) }
      await transaction.finish()
      outcome = "success"
    case .pending: outcome = "pending"
    case .userCancelled: outcome = "cancelled"
    @unknown default: outcome = "cancelled"
    }
    var data = await refresh(); data["outcome"] = outcome; return data
  }
  func restore() async throws -> [String: Any] { try await AppStore.sync(); return await refresh() }
  func prepareAds() async -> [String: Any] {
    guard initialized && !adsRemoved else { return state() }
    await consent.prepareForAds()
    changed?(state()); return state()
  }
  func privacy() async throws -> [String: Any] {
    guard consent.isPrivacyOptionsRequired else { return state() }
    await consent.presentPrivacyOptions()
    if let error = consent.privacyOptionsErrorMessage {
      consent.clearPrivacyOptionsError()
      throw NSError(domain: "CestaConsent", code: 1, userInfo: [NSLocalizedDescriptionKey: error])
    }
    changed?(state()); return state()
  }
  func review() -> Bool {
    #if DEBUG
    return false
    #else
    guard Bundle.main.appStoreReceiptURL?.lastPathComponent != "sandboxReceipt",
          let scene = UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first(where: { $0.activationState == .foregroundActive }) else { return false }
    SKStoreReviewController.requestReview(in: scene)
    return true // Apple decides whether to actually display a dialog.
    #endif
  }
}

public final class CestaCommerceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CestaCommerce")
    Events("onChange")
    OnCreate { [weak self] in
      Task { @MainActor [weak self] in CestaCommerceController.shared.changed = { [weak self] value in self?.sendEvent("onChange", value) } }
    }
    AsyncFunction("refresh") { () async -> [String: Any] in await CestaCommerceController.shared.refresh() }
    AsyncFunction("loadProducts") { () async throws -> [String: Any] in try await CestaCommerceController.shared.loadProducts() }
    AsyncFunction("purchase") { (id: String) async throws -> [String: Any] in try await CestaCommerceController.shared.purchase(id) }
    AsyncFunction("restore") { () async throws -> [String: Any] in try await CestaCommerceController.shared.restore() }
    AsyncFunction("prepareAds") { () async -> [String: Any] in await CestaCommerceController.shared.prepareAds() }
    AsyncFunction("privacy") { () async throws -> [String: Any] in try await CestaCommerceController.shared.privacy() }
    AsyncFunction("requestReview") { () async -> Bool in await CestaCommerceController.shared.review() }
    View(CestaAdBannerView.self) {
      Events("onAdState")
      Prop("enabled") { (view: CestaAdBannerView, enabled: Bool) in view.setEnabled(enabled) }
    }
  }
}

final class CestaAdBannerView: ExpoView, BannerViewDelegate {
  let onAdState = EventDispatcher()
  private var banner: BannerView?
  private var enabled = false
  private var loaded = false
  private var requestedWidth: CGFloat = 0
  required init(appContext: AppContext? = nil) { super.init(appContext: appContext); clipsToBounds = true }
  func setEnabled(_ enabled: Bool) {
    self.enabled = enabled
    if !enabled { banner?.delegate = nil; banner?.removeFromSuperview(); banner = nil; loaded = false; requestedWidth = 0; onAdState(["loaded": false, "height": 0]) }
    setNeedsLayout()
  }
  override func layoutSubviews() {
    super.layoutSubviews()
    guard enabled && CestaCommerceController.shared.adsAllowed, bounds.width >= 300 else { return }
    let width = floor(bounds.width)
    if banner == nil || abs(width - requestedWidth) > 1 {
      banner?.delegate = nil; banner?.removeFromSuperview(); loaded = false; requestedWidth = width
      let size = currentOrientationAnchoredAdaptiveBanner(width: width)
      let view = BannerView(adSize: size)
      view.adUnitID = Bundle.main.object(forInfoDictionaryKey: "CestaAdMobBannerID") as? String
      view.rootViewController = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap { $0.windows }.first(where: { $0.isKeyWindow })?.rootViewController
      view.delegate = self
      addSubview(view); banner = view
      view.load(Request())
    }
    if let banner { banner.frame = CGRect(x: max(0, (bounds.width - banner.adSize.size.width)/2), y: 0, width: banner.adSize.size.width, height: banner.adSize.size.height) }
  }
  func bannerViewDidReceiveAd(_ bannerView: BannerView) { loaded = true; onAdState(["loaded": true, "height": bannerView.adSize.size.height]) }
  func bannerView(_ bannerView: BannerView, didFailToReceiveAdWithError error: Error) { loaded = false; onAdState(["loaded": false, "height": 0]) }
}
