/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
  silent: true,
};

const nextConfig = {
  basePath: '/aap/soknad',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true, // Blir default på i Next 12.2
  output: 'standalone',
  assetPrefix: process.env.ASSET_PREFIX ?? undefined,

  i18n: {
    locales: ['nb', 'nn'],
    defaultLocale: 'nb',
  },

  async redirects() {
    return [
      {
        source: '/standard',
        destination: '/',
        permanent: true,
      },
    ];
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
console.log('ASSET_PREFIX', process.env.ASSET_PREFIX);
if (process.env.ENABLE_SENTRY === 'enabled') {
  console.log('sentry enabled', process.env.ENABLE_SENTRY);
  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
} else {
  module.exports = nextConfig;
}
