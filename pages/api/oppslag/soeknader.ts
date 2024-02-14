import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';
import { mockSøknader } from 'mock/søknader';
import { z } from 'zod';
import { Barn } from 'pages/api/oppslag/barn';

const SøknadApiType = z.object({
  innsendtDato: z.string(),
  søknadId: z.string(),
  journalpostId: z.string().optional(),
  manglendeVedlegg: z
    .array(
      z.enum([
        'ARBEIDSGIVER',
        'STUDIER',
        'ANDREBARN',
        'OMSORG',
        'UTLAND',
        'ANNET',
        'LÅNEKASSEN_STIPEND',
        'LÅNEKASSEN_LÅN',
        'UTENLANDSKE',
      ]),
    )
    .optional(),
});
export type SøknadApiType = z.infer<typeof SøknadApiType>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getSøknader(accessToken));
});

export const getSøknader = async (accessToken?: string): Promise<SøknadApiType[]> => {
  if (isMock()) return mockSøknader;
  const søknader = await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/oppslag/soeknader`,
    prometheusPath: 'oppslag/soeknader',
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  const validatedResponse = z.array(SøknadApiType).safeParse(søknader);
  if (!validatedResponse.success) {
    logger.error({
      message: `oppslag/soeknader valideringsfeil: ${validatedResponse.error.message}`,
    });
  }
  return søknader;
};

export default handler;
