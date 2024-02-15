import { beskyttetApi } from 'auth/beskyttetApi';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { getTokenX } from '@navikt/aap-felles-utils';
import { proxyApiRouteRequest } from '@navikt/next-api-proxy';
import { getAccessTokenFromRequest } from 'auth/accessToken';

const handler = beskyttetApi(async (req, res) => {
  const uuid = getStringFromPossiblyArrayQuery(req.query.uuid);
  if (!uuid) {
    res.status(400).json({ error: 'uuid må være en string' });
  } else {
    const accessToken = getAccessTokenFromRequest(req)?.substring('Bearer '.length)!;
    let tokenxToken;
    try {
      tokenxToken = await getTokenX(accessToken, process.env.INNSENDING_AUDIENCE!);
    } catch (err: any) {
      console.log('getTokenXError', err);
    }
    return await proxyApiRouteRequest({
      hostname: 'innsending',
      path: `/mellomlagring/fil/${uuid}`,
      req: req,
      res: res,
      bearerToken: tokenxToken,
      https: false,
    });
  }
});

export const config = {
  api: {
    responseLimit: '50mb',
    bodyParser: false,
    externalResolver: true,
  },
};

export default handler;
