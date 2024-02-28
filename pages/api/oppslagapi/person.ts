import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { z } from 'zod';

const Person = z.object({
  navn: z.string(),
  fnr: z.string(),
  erBeskyttet: z.boolean(),
  adresse: z.string().optional(),
  fødseldato: z.string().optional(),
});
export type Person = z.infer<typeof Person>;

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getPerson(accessToken));
});
export const getPerson = async (accessToken?: string) => {
  const person = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/person`,
    prometheusPath: 'oppslag/person',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });
  const validatedResponse = Person.safeParse(person);
  if (!validatedResponse.success) {
    logError(`oppslag/person valideringsfeil: ${validatedResponse.error.message}`);
    return {};
  }
  return validatedResponse.data;
};
export default handler;
