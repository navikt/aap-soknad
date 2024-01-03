import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';

interface Adresse {
  adressenavn?: string;
  husbokstav?: string;
  husnummer?: string;
  postnummer?: string;
  poststed?: string;
}

interface KontaktInformasjon {
  kontor?: string;
  adresse?: Adresse;
  telefon?: string;
}

interface RegistrertBehandler {
  navn: string;
  kontaktinformasjon: KontaktInformasjon;
}

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getBehandler(accessToken));
});

export const getBehandler = async (accessToken?: string): Promise<RegistrertBehandler> => {
  if (isMock())
    return {
      navn: 'Fast Legen',
      kontaktinformasjon: {
        adresse: { adressenavn: 'Legevegen', husnummer: '1', poststed: 'Oslo', postnummer: '1234' },
      },
    };

  const registrertBehandler = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/behandler`,
    prometheusPath: 'oppslag/behandler',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });

  return registrertBehandler;
};

export default handler;
