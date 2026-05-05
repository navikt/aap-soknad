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

const normalizeFastlegeResponse = (data: Fastlege[] | Fastlege | null): Fastlege | null => {
  if (data === null) {
    return null;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return null;
    }
    return data[0];
  }

  return data;
};

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(await getFastlege(req));
});
export const getFastlege = async (req: IncomingMessage): Promise<Fastlege | null> => {
  if (isMock() || isDev()) return normalizeFastlegeResponse(mockFastlege);

  const fastlege = await simpleTokenXProxy({
    url: `${process.env.OPPSLAG_URL}/fastlege`,
    prometheusPath: 'oppslag/fastlege',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    req,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });

  const validatedResponse = z.union([z.array(Fastlege), Fastlege, z.null()]).safeParse(fastlege);
  if (!validatedResponse.success) {
    logError(`oppslag/fastlege valideringsfeil: ${validatedResponse.error.message}`);
    return null;
  }

  return normalizeFastlegeResponse(validatedResponse.data);
};

export default handler;
