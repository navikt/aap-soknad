import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';

export interface Fastlege {
  navn: string;
  type: 'FASTLEGE' | 'SYKMELDER';
  behandlerRef: string;
  kontaktinformasjon?: KontaktInformasjon;
}

interface KontaktInformasjon {
  kontor?: string;
  adresse?: string;
  telefon?: string;
}

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getFastlege(accessToken));
});
export const getFastlege = async (accessToken?: string): Promise<Fastlege[]> => {
  if (isMock())
    return [
      {
        behandlerRef: 'tada',
        navn: 'Fast Lege',
        type: 'FASTLEGE',
        kontaktinformasjon: {
          adresse: 'Vondtveien 1, 911 Oslo',
          kontor: 'Oslo',
          telefon: '99999999',
        },
      },
    ];
  const fastlege: Fastlege[] = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/fastlege`,
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
