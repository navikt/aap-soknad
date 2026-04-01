import { NextApiRequest, NextApiResponse } from 'next';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError } from 'lib/utils/logger';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { mockKrr } from 'mock/krr';
import { z } from 'zod';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';

const KrrInfo = z.object({
  epost: z.string().nullable(),
  mobil: z.string().nullable(),
});
export type KrrKontaktInfo = z.infer<typeof KrrInfo>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(await getKrr(req));
});
export const getKrr = async (req: IncomingMessage) => {
  const krr: KrrKontaktInfo = isMock()
    ? mockKrr()
    : await simpleTokenXProxy({
        url: `${process.env.OPPSLAG_URL}/krr`,
        prometheusPath: 'oppslag/krr',
        method: 'GET',
        audience: process.env.OPPSLAG_AUDIENCE!,
        req,
        metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
        metricsTimer: metrics.backendApiDurationHistogram,
      });
  const validatedResponse = KrrInfo.safeParse(krr);
  if (!validatedResponse.success) {
    logError(`oppslag/krr valideringsfeil: ${validatedResponse.error.message}`);
    return null;
  }
  return validatedResponse.data;
};

export default handler;
