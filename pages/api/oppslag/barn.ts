import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { z } from 'zod';

const Barn = z.object({
  navn: z.string(),
  fødselsdato: z.string(),
});
export type Barn = z.infer<typeof Barn>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getBarn(accessToken));
});

export const getBarn = async (accessToken?: string): Promise<Array<Barn>> => {
  const barn = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/person/barn`,
    prometheusPath: 'oppslag/barn',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
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
