import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { OppslagBehandler } from 'context/sokerOppslagContext';
import { z } from 'zod';

const Fastlege = z.object({
  navn: z.string(),
  behandlerRef: z.string(),
  kontaktinformasjon: z.object({
    kontor: z.string().optional(),
    adresse: z.string().optional(),
    telefon: z.string().optional(),
  }),
});
export type Fastlege = z.infer<typeof Fastlege>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getFastlege(accessToken));
});
export const getFastlege = async (accessToken?: string) => {
  const fastlege: Fastlege = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/fastlege`,
    prometheusPath: 'oppslag/fastlege',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });

  const validatedResponse = z.array(Fastlege).safeParse(fastlege);
  if (!validatedResponse.success) {
    logger.error({ message: `oppslag/person valideringsfeil: ${validatedResponse.error.message}` });
    return {};
  }
  return validatedResponse.data;
};

export default handler;
