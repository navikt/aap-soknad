import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';

interface KontaktInformasjon {
  epost?: string;
  mobil?: string;
}

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getKrr(accessToken));
});

export const getKrr = async (accessToken?: string): Promise<KontaktInformasjon> => {
  if (isMock()) return { epost: 'hello@pello.no', mobil: '12345678' };
  const kontaktinformasjon = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/krr`,
    prometheusPath: 'oppslag/krr',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });

  return kontaktinformasjon;
};

export default handler;
