import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { OppslagBehandler } from 'context/sokerOppslagContext';
import { mockFastlege } from 'mock/fastlege';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getFastlege(accessToken));
});
export const getFastlege = async (accessToken?: string) => {
  if (isMock()) return mockFastlege;
  const fastlege: OppslagBehandler = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/oppslag/fastlege`,
    prometheusPath: 'oppslag/fastlege',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return fastlege;
};

export default handler;
