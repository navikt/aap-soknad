const MOCK_ENVIRONMENTS = ['localhost', 'labs'];

export const isMock = () => MOCK_ENVIRONMENTS.includes(process.env.NEXT_PUBLIC_ENVIRONMENT ?? '');
