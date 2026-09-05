module.exports = ({ config }) => {
  if (process.env.CESTA_DISTRIBUTION !== 'testflight') return config;
  const infoPlist = {...config.ios.infoPlist};
  delete infoPlist.NSLocalNetworkUsageDescription;
  delete infoPlist.NSAppTransportSecurity;
  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: 'com.dmkr.cesta.B2X6D3A9J9',
      buildNumber: '3',
      appleTeamId: 'B2X6D3A9J9',
      infoPlist,
    },
  };
};
