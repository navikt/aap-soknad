const moduleExports = {
  basePath: '/aap/soknad',
  target: 'server',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true, // Blir default på i Next 12.2
  output: 'standalone',

  eslint: {
    build: false,
  },
  typescript: {
    ignoreBuildErrors: true, // Ignorerer feil frem til vi har løst TS-feil i parcel-app
  },

  async headers() {
    return [
      {
        // Append the "Service-Worker-Allowed" header
        // to each response, overriding the default worker's scope.
        source: '/(.*)',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

module.exports = moduleExports;
