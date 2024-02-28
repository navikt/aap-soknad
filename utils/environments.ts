const MOCK_ENVIRONMENTS = ['localhost'];

export const isMock = () =>
  MOCK_ENVIRONMENTS.includes(process.env.RUNTIME_ENVIRONMENT ?? '') || isFunctionalTest();

export const isFunctionalTest = () => process.env.FUNCTIONAL_TESTS === 'enabled';

export const clientSideIsProd = () =>
  typeof window !== 'undefined' && window.location.href.includes('www.nav.no');
