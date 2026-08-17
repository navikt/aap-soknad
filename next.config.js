/** @type {import('next').NextConfig} */

const ssr = require('@navikt/nav-dekoratoren-moduler/ssr');

const appDirectives = {
  'connect-src': ["'self'"],
  'font-src': ['https://fonts.gstatic.com'],
  'object-src': ['blob:'],
  'script-src-elem': ["'self'"],
  'style-src-elem': ["'self'"],
  'frame-src': ['self', 'blob:'],
  'img-src': ["'self'", 'data:', 'blob:'],
};

const nextConfig = {
  basePath: '/aap/soknad',
  trailingSlash: true,
  reactStrictMode: true,
  output: 'standalone',
  assetPrefix: process.env.ASSET_PREFIX ?? undefined,
  serverExternalPackages: ['pino'],

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
    const csp = await ssr.buildCspHeader(appDirectives, {
      env: process.env.DECORATOR_ENV ?? 'prod',
    });
    return [
      {
        // Append the "Service-Worker-Allowed" header
        // to each response, overriding the default worker's scope.
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
};
console.log('ASSET_PREFIX', process.env.ASSET_PREFIX);

module.exports = nextConfig;
