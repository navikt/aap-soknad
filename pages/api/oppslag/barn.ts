import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';

interface Barn {
  navn?: string;
  fødselsdato?: string;
}

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getBarn(accessToken));
});

export const getBarn = async (accessToken?: string): Promise<Array<Barn>> => {
  if (isMock()) return [{ navn: 'Kjell T. Ringen', fødselsdato: '2020.12.12' }];
  const barn = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/pdl/barn`,
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
