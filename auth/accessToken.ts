import { NextPageContext } from 'next';

export const getAccessToken = (context: NextPageContext) => {
  return getAccessTokenFromRequest(context.req);
};

export const getAccessTokenFromRequest = (request: NextPageContext['req']) => {
  if (request == null) {
    throw new Error('Context is missing request. This should not happen');
  }

  return request.headers['authorization'];
};
