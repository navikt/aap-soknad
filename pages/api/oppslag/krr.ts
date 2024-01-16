import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { KontaktInfoView } from 'context/sokerOppslagContext';
import { mockKrr } from 'mock/krr';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getKrr(accessToken));
});
export const getKrr = async (accessToken?: string) => {
  if (isMock()) return mockKrr();
  const krr: KontaktInfoView = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_API_URL}/oppslag/krr`,
    prometheusPath: 'oppslag/krr',
    method: 'GET',
    audience: process.env.OPPSLAG_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return krr;
};

export default handler;
