import { getTokenX, logger } from '@navikt/aap-felles-utils';
import { proxyApiRouteRequest } from '@navikt/next-api-proxy';
import { NextApiRequest, NextApiResponse } from 'next';
import { beskyttetApi } from 'auth/beskyttetApi';
import { isMock } from 'utils/environments';
import { getAccessTokenFromRequest } from 'auth/accessToken';

const handler = beskyttetApi(async (req, res) => {
  const uuid = req.query.uuid;
  if (!uuid || Array.isArray(uuid)) {
    res.status(400).json({ error: 'uuid må være en string' });
    return;
  }
  const accessToken = getAccessTokenFromRequest(req);
  await slettVedleggInnsending(uuid, accessToken!, req, res);
  res.status(204).end();
});

export const slettVedleggInnsending = async (
  uuid: string,
  accessToken: string,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (isMock()) return;
  const idportenToken = accessToken.split(' ')[1];
  let tokenXToken;
  try {
    tokenXToken = await getTokenX(idportenToken, process.env.INNSENDING_AUDIENCE!);
  } catch (error) {
    logger.error('Kunne ikke hente tokenXToken i sletting av vedlegg i ny innsending', error);
    throw error;
  }

  return await proxyApiRouteRequest({
    hostname: 'innsending',
    path: `/mellomlagring/fil/${uuid}`,
    req: req,
    res: res,
    bearerToken: tokenXToken,
    https: false,
  });
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default handler;
