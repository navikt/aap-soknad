/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
  silent: true,
};

const nextConfig = {
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

if (process.env.ENABLE_SENTRY === 'true') {
  console.log('sentry enabled', process.env.ENABLE_SENTRY);
  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
} else {
  module.exports = nextConfig;
}
