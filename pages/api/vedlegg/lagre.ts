import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiStreamProxy } from '@navikt/aap-felles-innbygger-auth';
import { logger } from '@navikt/aap-felles-innbygger-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  logger.info('Har mottatt request om filopplasting');
  const accessToken = getAccessTokenFromRequest(req);
  if (isMock()) {
    res.status(201).json(randomUUID());
  } else {
    await tokenXApiStreamProxy({
      url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
      prometheusPath: 'vedlegg/lagre',
      req,
      res,
      audience: process.env.SOKNAD_API_AUDIENCE!,
      bearerToken: accessToken,
      metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
      metricsTimer: metrics.backendApiDurationHistogram,
      logger: logger,
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
