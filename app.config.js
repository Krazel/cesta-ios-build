module.exports = ({ config }) => {
  if (process.env.CESTA_DISTRIBUTION !== 'testflight') return config;
  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: 'com.dmkr.cesta.B2X6D3A9J9',
      buildNumber: '2',
      appleTeamId: 'B2X6D3A9J9',
    },
  };
};
