const MOCK_ENVIRONMENTS = ['localhost'];

export const isMock = () =>
  MOCK_ENVIRONMENTS.includes(process.env.NEXT_PUBLIC_ENVIRONMENT ?? '') || isFunctionalTest();

export const isFunctionalTest = () => process.env.FUNCTIONAL_TESTS === 'enabled';

export const isDev = () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev';

export const clientSideIsProd = () =>
  typeof window !== 'undefined' && window.location.href.includes('www.nav.no');

export const isProduction = () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod';

export function getEnvironment(): 'prod' | 'dev' {
  if (isProduction()) {
    return 'prod';
  } else {
    return 'dev';
  }
}
