import { randomUUID } from 'crypto';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiStreamProxy, logInfo } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';

const handler = beskyttetApi(async (req, res) => {
  logInfo('Har mottatt request om filopplasting');
  const accessToken = getAccessTokenFromRequest(req);
  if (isMock()) {
    res.status(201).json(randomUUID());
  } else {
    await tokenXApiStreamProxy({
      url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
      prometheusPath: '/vedlegg/lagre',
      req,
      res,
      audience: process.env.SOKNAD_API_AUDIENCE!,
      bearerToken: accessToken,
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
