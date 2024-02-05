import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { Barn } from 'types/Soknad';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getBarn(accessToken));
});

export const getBarn = async (accessToken?: string): Promise<Array<Barn>> => {
  const barn = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/person/barn`,
    prometheusPath: 'oppslag/barn',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });

  return barn;
};

export default handler;