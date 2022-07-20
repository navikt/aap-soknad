import { NextApiRequest, NextApiResponse } from 'next';
import { isMock } from '../utils/environments';
import { verifyIdportenAccessToken } from './verifyIdPortenAccessToken';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>;

export function beskyttetApi(handler: ApiHandler): ApiHandler {
  return async function withBearerTokenHandler(req, res) {
    function send401() {
      return res.status(401).json({ message: 'Access denied' });
    }

    if (isMock()) {
      console.log('handling request for mocked environment, should not happen in production');
      return handler(req, res);
    }

    const bearerToken: string | null | undefined = req.headers['authorization'];
    if (!bearerToken) {
      console.log('ingen bearer token');
      return send401();
    }
    try {
      await verifyIdportenAccessToken(bearerToken);
    } catch (e) {
      console.log('kunne ikke validere idportentoken i beskyttetApi', e);
      return send401();
    }
    return handler(req, res);
  };
}
