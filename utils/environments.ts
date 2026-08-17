const MOCK_ENVIRONMENTS = ['localhost'];

export const isMock = () =>
  MOCK_ENVIRONMENTS.includes(process.env.NEXT_PUBLIC_ENVIRONMENT ?? '') || isFunctionalTest();

export const isFunctionalTest = () => process.env.FUNCTIONAL_TESTS === 'enabled';

export const isDev = () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev';

export const isProduction = () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod';
