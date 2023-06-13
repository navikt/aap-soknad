import { NextApiRequest, NextApiResponse } from 'next';
import { isMock } from '../utils/environments';
import { verifyIdportenAccessToken } from './verifyIdPortenAccessToken';
import { logger } from '@navikt/aap-felles-utils';
import { ErrorMedStatus } from './ErrorMedStatus';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>;

export function beskyttetApi(handler: ApiHandler): ApiHandler {
  return async function withBearerTokenHandler(req, res) {
    function send401() {
      return res.status(401).json({ message: 'Access denied' });
    }
    function send500() {
      return res.status(500).json({ message: 'NextJS internal server error' });
    }

    try {
      if (isMock()) {
        logger.warn('handling request for mocked environment, should not happen in production');
        return handler(req, res);
      }

      const bearerToken: string | null | undefined = req.headers['authorization'];
      if (!bearerToken) {
        logger.warn({ message: 'ingen bearer token', path: req?.url });
        return send401();
      }
      try {
        await verifyIdportenAccessToken(bearerToken);
      } catch (e) {
        logger.error(e, 'kunne ikke validere idportentoken i beskyttetApi');
        return send401();
      }
      return handler(req, res);
    } catch (e) {
      logger.error(e);
      logger.info('handling error in beskyttetApi');
      if (e instanceof ErrorMedStatus) {
        logger.info(`sending error with status ${e.status} and message ${e.message}`);
        return res.status(e.status).json({ message: e.message, navCallId: e.navCallId });
      }
    }
    return send500();
  };
}
