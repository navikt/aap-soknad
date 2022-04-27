const moduleExports = {
  basePath: '/aap/soknad',
  target: 'server',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true, // Blir default på i Next 12.2

  eslint: {
    build: true,
  },
};

module.exports = moduleExports;
