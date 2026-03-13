import { NextRequest, NextResponse } from 'next/server';
import { isMock } from '../utils/environments';
import { verifyIdportenAccessToken } from './verifyIdPortenAccessToken';
import { ErrorMedStatus } from './ErrorMedStatus';
import { logError, logInfo, logWarning } from '@navikt/aap-felles-utils';

export type RouteHandler = (req: NextRequest, ctx: { params: Promise<any> }) => Promise<NextResponse | Response>;

export function beskyttetApi(handler: RouteHandler): RouteHandler {
  return async function withBearerTokenHandler(req, ctx) {
    function send401() {
      return NextResponse.json({ message: 'Access denied' }, { status: 401 });
    }
    function send500() {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    try {
      if (isMock()) {
        logWarning('handling request for mocked environment, should not happen in production');
        return handler(req, ctx);
      }

      const bearerToken = req.headers.get('authorization');
      if (!bearerToken) {
        logWarning(`ingen bearer token, path: ${req.nextUrl?.pathname}`);
        return send401();
      }
      try {
        await verifyIdportenAccessToken(bearerToken);
      } catch (e) {
        logError('kunne ikke validere idportentoken i beskyttetApi', e);
        return send401();
      }
      return handler(req, ctx);
    } catch (e) {
      logError('beskyttetApi', e);
      logInfo('handling error in beskyttetApi');
      if (e instanceof ErrorMedStatus) {
        logInfo(`sending error with status ${e.status} and message ${e.message}`);
        return NextResponse.json({ message: e.message, navCallId: e.navCallId }, { status: e.status });
      }
    }
    return send500();
  };
}
