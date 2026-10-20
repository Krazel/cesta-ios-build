import XCTest
import StoreKitTest

final class CestaUITests: XCTestCase {
    private let app = XCUIApplication(bundleIdentifier: "com.dmkr.cesta.B2X6D3A9J9")
    private var session: SKTestSession!
    private var en = false
    private func label(_ es: String, _ english: String) -> String { en ? english : es }
    private func element(_ value: String) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: value).firstMatch
    }
    private func tap(_ es: String, _ english: String) {
        let e = element(label(es, english))
        XCTAssertTrue(e.waitForExistence(timeout: 15), "Missing \(e)\n\(app.debugDescription)")
        e.tap()
    }
    private func capture(_ name: String) {
        let a = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        a.name = "store-\(en ? "en" : "es")-\(name)"
        a.lifetime = .keepAlways
        add(a)
    }
    override func setUpWithError() throws {
        continueAfterFailure = false
        session = try SKTestSession(configurationFileNamed: "CestaStoreKitQA")
        session.resetToDefaultState()
        session.clearTransactions()
        session.disableDialogs = true
        session.timeRate = .realTime
        addUIInterruptionMonitor(withDescription: "System permissions") { alert in
            for name in ["Ask App Not to Track", "Pedir a la app que no rastree", "Don't Allow", "No permitir"] where alert.buttons[name].exists {
                alert.buttons[name].tap(); return true
            }
            return false
        }
    }
    func testSpanish() throws { try run(language: "es", locale: "es_ES") }
    func testEnglish() throws { try run(language: "en", locale: "en_US") }
    private func run(language: String, locale: String) throws {
        en = language == "en"
        app.launchArguments = ["-AppleLanguages", "(\(language))", "-AppleLocale", locale]
        app.launch()
        capture("00-first-launch")
        tap("Omitir tutorial", "Skip tutorial")
        let name = element(label("Tu nombre", "Your name"))
        XCTAssertTrue(name.waitForExistence(timeout: 15))
        name.tap()
        for character in "Alex" { name.typeText(String(character)) }
        XCTAssertEqual(name.value as? String, "Alex", "Text must remain intact before the first continue tap")
        tap("Empezar mi cesta", "Start my basket")
        // UMP remains the real SDK flow. Dismiss only explicit reject options if present.
        for text in ["Rechazar todo", "Rechazar", "Reject all", "Do not consent"] {
            let reject = app.buttons[text].firstMatch
            if reject.waitForExistence(timeout: 2) { reject.tap(); break }
        }
        XCTAssertTrue(element(label("Listas", "Lists")).waitForExistence(timeout: 20))
        capture("02-lists")
        tap("Productos", "Products")
        capture("03-products")
        tap("Inicio", "Home")
        tap("Pegar lista", "Paste list")
        let title = element(label("Nombre de la lista", "List name"))
        if title.exists {
            title.tap()
            title.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: 80) + label("Compra del finde", "Weekend shop"))
        }
        let text = app.textViews.matching(identifier: label("Texto de la compra", "Shopping text")).firstMatch
        XCTAssertTrue(text.waitForExistence(timeout: 10)); text.tap()
        text.typeText(label("2 litros de leche, espaguetis y 6 huevos\n500 g de tomates\nPan, yogur y fruta", "2 litres of milk, spaghetti and 6 eggs\n500 g tomatoes\nBread, yogurt and fruit"))
        tap("Preparar lista", "Prepare list")
        capture("04-paste")
        let add = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@ AND label ENDSWITH %@", label("Añadir ", "Add "), label(" productos", " products"))).firstMatch
        if !add.isHittable { app.swipeUp() }
        XCTAssertTrue(add.waitForExistence(timeout: 10)); add.tap()
        let buy = element(label("Comprar Leche", "Buy Milk"))
        // Catalogue can resolve a specific variety; match any purchase checkbox.
        let anyBuy = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", label("Comprar ", "Buy "))).firstMatch
        XCTAssertTrue(anyBuy.waitForExistence(timeout: 15), app.debugDescription)
        (buy.exists ? buy : anyBuy).tap()
        capture("01-shop")
        tap("Inicio", "Home")
        capture("05-home")
        tap("Ajustes", "Settings")
        capture("06-settings")
        tap("Quitar anuncios", "Remove ads")
        let offers = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", label("Suscribirme por ", "Subscribe for ")))
        XCTAssertTrue(offers.firstMatch.waitForExistence(timeout: 20), app.debugDescription)
        XCTAssertEqual(offers.count, 6, "Every offered product must be available through StoreKit")
        capture("07-subscriptions-top")
        app.swipeUp()
        capture("08-subscriptions-bottom")
        // Execute the app's real Product.purchase path, with Apple's test session.
        app.swipeDown()
        offers.firstMatch.tap()
        let active = element(label("Suscripción activa. Anuncios quitados.", "Subscription active. Ads removed."))
        XCTAssertTrue(active.waitForExistence(timeout: 20), app.debugDescription)
        capture("09-purchase-success")
        app.terminate(); app.launch()
        tap("Ajustes", "Settings")
        XCTAssertTrue(element(label("Suscripción activa", "Active subscription")).waitForExistence(timeout: 15))
        // A verified entitlement survives restart, then expiration must remove it.
        try session.expireSubscription(productIdentifier: "com.dmkr.cesta.noads.monthly.199")
        app.terminate(); app.launch()
        tap("Ajustes", "Settings")
        XCTAssertTrue(element(label("Quitar anuncios", "Remove ads")).waitForExistence(timeout: 15))
        capture("10-expired")
        try session.buyProduct(productIdentifier: "com.dmkr.cesta.noads.monthly.199")
        app.terminate(); app.launch()
        tap("Ajustes", "Settings")
        tap("Suscripción activa", "Active subscription")
        for _ in 0..<3 where !element(label("Restaurar compras", "Restore purchases")).isHittable { app.swipeUp() }
        tap("Restaurar compras", "Restore purchases")
        XCTAssertTrue(element(label("Compras restauradas. Anuncios quitados.", "Purchases restored. Ads removed.")).waitForExistence(timeout: 15), app.debugDescription)
        capture("11-restored")
    }
    func testConsentFailsClosed() {
        let empty = TrackingConsentSignals(gdprApplies: nil, purposeConsents: nil, purposeLegitimateInterests: nil, vendorConsents: nil, vendorLegitimateInterests: nil)
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, empty))
        let outside = TrackingConsentSignals(gdprApplies: 0, purposeConsents: nil, purposeLegitimateInterests: nil, vendorConsents: nil, vendorLegitimateInterests: nil)
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: false, outside))
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, outside))
        var us = outside
        us.applicableGppSections = "7_8"
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, us))
        us.applicableGppSections = "2_"
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, us))
        us.applicableGppSections = nil
        us.usPrivacy = "1YYN"
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, us))
        let declined = TrackingConsentSignals(gdprApplies: 1, purposeConsents: String(repeating: "0", count: 10), purposeLegitimateInterests: String(repeating: "1", count: 10), vendorConsents: String(repeating: "1", count: 755), vendorLegitimateInterests: String(repeating: "1", count: 755))
        XCTAssertFalse(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, declined))
        let accepted = TrackingConsentSignals(gdprApplies: 1, purposeConsents: String(repeating: "1", count: 10), purposeLegitimateInterests: String(repeating: "1", count: 10), vendorConsents: String(repeating: "1", count: 755), vendorLegitimateInterests: String(repeating: "1", count: 755))
        XCTAssertTrue(TrackingConsentEligibility.isATTRequestAllowed(canRequestAds: true, accepted))
    }
}
