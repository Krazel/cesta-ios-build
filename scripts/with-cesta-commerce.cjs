const { withInfoPlist } = require('expo/config-plugins');
const cfg = require('../store/monetization.json');
module.exports = function withCestaCommerce(config) {
  return withInfoPlist(config, (current) => {
    const production = process.env.CESTA_ADS_MODE === 'production';
    if (
      production &&
      (!cfg.admob.productionReady ||
        !cfg.admob.privacyPublished ||
        !cfg.admob.umpReady ||
        !/^ca-app-pub-\d+~\d+$/.test(cfg.admob.appId) ||
        !/^ca-app-pub-\d+\/\d+$/.test(cfg.admob.bannerId))
    )
      throw Error(
        'Cesta production AdMob is not verified. Use test ads until its app, privacy and consent setup are ready.',
      );
    current.modResults.GADApplicationIdentifier =
      cfg.admob.appId || 'ca-app-pub-3940256099942544~1458002511';
    current.modResults.CestaAdMobBannerID = production
      ? cfg.admob.bannerId
      : 'ca-app-pub-3940256099942544/2435281174';
    current.modResults.GADDelayAppMeasurementInit = true;
    current.modResults.NSUserTrackingUsageDescription =
      'Tu permiso permite que Google muestre anuncios personalizados. Puedes rechazarlo y seguir usando Cesta.';
    current.modResults.SKAdNetworkItems = require('../store/skadnetwork-ids.json').map(
      (SKAdNetworkIdentifier) => ({ SKAdNetworkIdentifier }),
    );
    return current;
  });
};
