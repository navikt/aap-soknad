import { beskyttetApi } from '@navikt/aap-felles-utils';
import { lagreCache } from 'mock/mellomlagringsCache';
import { isFunctionalTest, isMock } from 'utils/environments';

import { getOnBefalfOfToken } from 'lib/api/simpleTokenXProxy';
import { proxyApiRouteRequest } from '@navikt/next-api-proxy';

const handler = beskyttetApi(async (req, res) => {
  if (isFunctionalTest()) return;
  if (isMock()) return await lagreCache(JSON.stringify(req.body));

  const url = `/mellomlagring/søknad`;
  const onBehalfOfToken = await getOnBefalfOfToken(process.env.INNSENDING_AUDIENCE!, url, req);

  return await proxyApiRouteRequest({
    hostname: 'innsending',
    path: url,
    req: req,
    res: res,
    bearerToken: onBehalfOfToken,
    https: false,
  });
});

export const config = {
  api: {
    responseLimit: '50mb',
    bodyParser: false,
    externalResolver: true,
  },
};

export default handler;
