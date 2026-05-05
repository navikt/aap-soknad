import { NextApiRequest, NextApiResponse } from 'next';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError } from 'lib/utils/logger';
import metrics from 'utils/metrics';
import { z } from 'zod';
import { isDev, isMock } from 'utils/environments';
import { mockFastlege } from 'mock/fastlege';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';

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
  res.status(200).json(await getFastlege(req));
});
export const getFastlege = async (req: IncomingMessage): Promise<Fastlege[]> => {
  if (isMock()) return mockFastlege;

  const fastlege: Fastlege = await simpleTokenXProxy({
    url: `${process.env.OPPSLAG_URL}/fastlege`,
    prometheusPath: 'oppslag/fastlege',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    req,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });

  const validatedResponse = z.array(Fastlege).safeParse(fastlege);
  if (!validatedResponse.success) {
    logError(`oppslag/fastlege valideringsfeil: ${validatedResponse.error.message}`);
    return [];
  }
  if (isDev() && validatedResponse.data.length === 0) {
    return mockFastlege;
  }
  return validatedResponse.data;
};

export default handler;
