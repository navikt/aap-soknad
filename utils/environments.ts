const MOCK_ENVIRONMENTS = ['localhost', 'labs'];

export const isLabs = () =>
  ['labs'].includes(process.env.RUNTIME_ENVIRONMENT ?? '') ||
  process.env.FUNCTIONAL_TESTS === 'enabled';

export const isMock = () =>
  MOCK_ENVIRONMENTS.includes(process.env.RUNTIME_ENVIRONMENT ?? '') ||
  process.env.FUNCTIONAL_TESTS === 'enabled';

export const isDev = () => process.env.RUNTIME_ENVIRONMENT === 'dev';

export const clientSideIsProd = () =>
  typeof window !== 'undefined' && window.location.href.includes('www.nav.no');

export const clientSideIsLabs = () =>
  typeof window !== 'undefined' && window.location.href.includes('ekstern.dev.nav.no');
