import { createRequest, createResponse } from 'node-mocks-http';
import { Request, Response } from 'express';

import { enforceIDPortenAuthenticationMiddleware } from '../src/auth/middleware';

jest.mock('../src/auth/idporten');

describe('auth/middleware', () => {
  test('redirect til idporten login hvis authentication mangler', async () => {
    const req = createRequest<Request>();
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/oauth2/login?redirect=/');
  });

  test('redirect til idporten login hvis authentication ikke validerer', async () => {
    const req = createRequest<Request>({
      headers: {
        authorization: 'Bearer foo',
      },
      cookies: {
        'selvbetjening-idtoken': 'foo',
      },
    });
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/oauth2/login?redirect=/');
  });
});
