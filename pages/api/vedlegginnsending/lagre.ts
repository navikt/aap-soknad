import { randomUUID } from 'crypto';
import { beskyttetApi } from 'auth/beskyttetApi';
import { requestOboToken } from '@navikt/oasis';
import { proxyApiRouteRequest } from '@navikt/next-api-proxy';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { isMock } from 'utils/environments';
import { logError } from 'lib/utils/logger';

const handler = beskyttetApi(async (req, res) => {
  if (isMock()) return res.status(201).json({ filId: randomUUID() });
  const accessToken = getAccessTokenFromRequest(req)?.substring('Bearer '.length)!;
  let tokenXToken;
  try {
    const result = await requestOboToken(accessToken, process.env.INNSENDING_AUDIENCE!);
    if (!result.ok) throw result.error;
    tokenXToken = result.token;
  } catch (err) {
    logError('Kunne ikke hente tokenXToken i lagring av vedlegg', err);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
  await proxyApiRouteRequest({
    hostname: 'innsending',
    path: '/mellomlagring/fil',
    req,
    res,
    bearerToken: tokenXToken,
    https: false,
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
