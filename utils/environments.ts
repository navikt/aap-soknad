const MOCK_ENVIRONMENTS = ['localhost', 'labs'];

export const isLabs = () => ['labs'].includes(process.env.NEXT_PUBLIC_ENVIRONMENT ?? '');

export const isMock = () => MOCK_ENVIRONMENTS.includes(process.env.NEXT_PUBLIC_ENVIRONMENT ?? '');
