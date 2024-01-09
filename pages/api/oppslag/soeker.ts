import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { Søker } from 'context/sokerOppslagContext';
import { mockSøker } from 'mock/søkerUtenBarn';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getSøker(accessToken));
});
export const getSøker = async (accessToken?: string): Promise<Søker> => {
  if (isMock()) return mockSøker;
  const søker = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/person`,
    prometheusPath: 'oppslag/soeker',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return søker;
};

export default handler;
