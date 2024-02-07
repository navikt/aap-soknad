import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { KontaktInfoView } from 'context/sokerOppslagContext';
import { mockKrr } from 'mock/krr';
import { z } from 'zod';

const KrrInfo = z.object({
  epost: z.string().optional(),
  mobil: z.string().optional(),
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
        logger: logger,
      });
  const dummyKrrInvalid = { epost: ['hei'], mobil: { navn: 'ole' } };
  const validatedResponse = KrrInfo.safeParse(dummyKrrInvalid);
  if (!validatedResponse.success) {
    logger.error({ message: `oppslag/krr valideringsfeil: ${validatedResponse.error.message}` });
    return {};
  }
  return validatedResponse.data;
};

export default handler;
