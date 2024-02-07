import { randomUUID } from 'crypto';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiStreamProxy, logger } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';

const handler = beskyttetApi(async (req, res) => {
  logger.info('Har mottatt request om filopplasting');
  const accessToken = getAccessTokenFromRequest(req);
  if (isMock()) {
    res.status(201).json(randomUUID());
  } else if (process.env.NEXT_PUBLIC_NY_INNSENDING === 'enabled') {
    logger.error('Bruker lagring av fil med ny innsending', process.env.NEXT_PUBLIC_NY_INNSENDING);
    await tokenXApiStreamProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/fil`,
      prometheusPath: '/mellomlagring/fil',
      req,
      res,
      audience: process.env.INNSENDING_AUDIENCE!,
      bearerToken: accessToken,
      logger: logger,
      metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
      metricsTimer: metrics.backendApiDurationHistogram,
    });
  } else {
    logger.error(
      'Bruker lagring av fil med gammel soknad-api',
      process.env.NEXT_PUBLIC_NY_INNSENDING,
    );
    await tokenXApiStreamProxy({
      url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
      prometheusPath: '/vedlegg/lagre',
      req,
      res,
      audience: process.env.SOKNAD_API_AUDIENCE!,
      bearerToken: accessToken,
      logger: logger,
      metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
      metricsTimer: metrics.backendApiDurationHistogram,
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
