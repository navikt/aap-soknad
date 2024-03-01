import { NextApiRequest, NextApiResponse } from 'next';
import { isMock } from '../utils/environments';
import { verifyIdportenAccessToken } from './verifyIdPortenAccessToken';
import { ErrorMedStatus } from './ErrorMedStatus';
import { logError, logInfo, logWarning } from '@navikt/aap-felles-utils';

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
        logWarning('handling request for mocked environment, should not happen in production');
        return handler(req, res);
      }

      const bearerToken: string | null | undefined = req.headers['authorization'];
      if (!bearerToken) {
        logWarning(`ingen bearer token, path: ${req?.url}`);
        return send401();
      }
      try {
        await verifyIdportenAccessToken(bearerToken);
      } catch (e) {
        logError('kunne ikke validere idportentoken i beskyttetApi', e);
        return send401();
      }
      return handler(req, res);
    } catch (e) {
      logError('beskyttetApi', e);
      logInfo('handling error in beskyttetApi');
      if (e instanceof ErrorMedStatus) {
        logInfo(`sending error with status ${e.status} and message ${e.message}`);
        return res.status(e.status).json({ message: e.message, navCallId: e.navCallId });
      }
    }
    return send500();
  };
}
