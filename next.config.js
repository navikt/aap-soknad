const moduleExports = {
  basePath: '/aap/soknad',
  target: 'server',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true, // Blir default på i Next 12.2

  eslint: {
    build: false,
  },
  typescript: {
    ignoreBuildErrors: true, // Ignorerer feil frem til vi har løst TS-feil i parcel-app
  },

  experimental: {
    outputStandalone: true,
  },
};

module.exports = moduleExports;
