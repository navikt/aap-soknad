import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { KontaktInfoView } from 'context/sokerOppslagContext';
import { mockKrr } from 'mock/krr';
import { z } from 'zod';

const KrrInfo = z.object({
  epost: z.string().nullable(),
  mobil: z.string().nullable(),
});

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getKrr(accessToken));
});
export const getKrr = async (accessToken?: string) => {
  const krr: KontaktInfoView = isMock()
    ? mockKrr()
    : await tokenXApiProxy({
        url: `${process.env.OPPSLAG_URL}/krr`,
        prometheusPath: 'oppslag/krr',
        method: 'GET',
        audience: process.env.OPPSLAG_AUDIENCE!,
        bearerToken: accessToken,
        metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
        metricsTimer: metrics.backendApiDurationHistogram,
      });
  const validatedResponse = KrrInfo.safeParse(krr);
  if (!validatedResponse.success) {
    logError(`oppslag/krr valideringsfeil: ${validatedResponse.error.message}`);
    return {};
  }
  return validatedResponse.data;
};

export default handler;
