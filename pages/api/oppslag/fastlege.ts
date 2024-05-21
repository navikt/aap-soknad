import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { z } from 'zod';
import { isDev, isMock } from 'utils/environments';
import { mockFastlege } from 'mock/fastlege';

const Fastlege = z.object({
  navn: z.string(),
  behandlerRef: z.string(),
  kontaktinformasjon: z.object({
    kontor: z.string().nullish(),
    adresse: z.string().nullish(),
    telefon: z.string().nullish(),
  }),
});

export type Fastlege = z.infer<typeof Fastlege>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getFastlege(accessToken));
});
export const getFastlege = async (accessToken?: string): Promise<Fastlege[]> => {
  if (isMock() || isDev()) return mockFastlege;

  const fastlege: Fastlege = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/fastlege`,
    prometheusPath: 'oppslag/fastlege',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });

  const validatedResponse = z.array(Fastlege).safeParse(fastlege);
  if (!validatedResponse.success) {
    logError(`oppslag/fastlege valideringsfeil: ${validatedResponse.error.message}`);
    return [];
  }
  return validatedResponse.data;
};

export default handler;
