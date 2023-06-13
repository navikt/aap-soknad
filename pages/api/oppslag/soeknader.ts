import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';
import { mockSøknader } from 'mock/søknader';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getSøknader(accessToken));
});

export const getSøknader = async (accessToken?: string): Promise<SøknadApiType[]> => {
  if (isMock()) return mockSøknader;
  const søker = await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/oppslag/soeknader`,
    prometheusPath: 'oppslag/soeknader',
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return søker;
};

export interface SøknadApiType {
  innsendtDato: string;
  søknadId: string;
  journalpostId?: string;
  manglendeVedlegg: ['ARBEIDSGIVER' | 'STUDIER' | 'ANDREBARN' | 'OMSORG' | 'UTLAND' | 'ANNET'];
}

export default handler;
