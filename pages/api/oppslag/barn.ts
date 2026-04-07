import { NextApiRequest, NextApiResponse } from 'next';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError } from 'lib/utils/logger';
import metrics from 'utils/metrics';
import { z } from 'zod';
import { mockBarn } from 'mock/barn';
import { isMock } from 'utils/environments';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';

const Barn = z.object({
  navn: z.string(),
  fødselsdato: z.string(),
});
export type Barn = z.infer<typeof Barn>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(await getBarn(req));
});

export const getBarn = async (req: IncomingMessage): Promise<Array<Barn>> => {
  const barn = isMock()
    ? mockBarn()
    : await simpleTokenXProxy({
        url: `${process.env.OPPSLAG_URL}/person/barn`,
        prometheusPath: 'oppslag/barn',
        method: 'GET',
        audience: process.env.OPPSLAG_AUDIENCE!,
        req,
        metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
        metricsTimer: metrics.backendApiDurationHistogram,
      });

  const validatedResponse = z.array(Barn).safeParse(barn);
  if (!validatedResponse.success) {
    logError(`oppslag/barn valideringsfeil: ${validatedResponse.error.message}`);
    return [];
  }
  return validatedResponse.data;
};

export default handler;
