import { randomUUID } from 'crypto';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiStreamProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';

const handler = beskyttetApi(async (req, res) => {
  if (isMock()) return res.status(201).json({ filId: randomUUID() });
  const accessToken = getAccessTokenFromRequest(req);
  await tokenXApiStreamProxy({
    url: `${process.env.INNSENDING_URL}/mellomlagring/fil`,
    prometheusPath: '/mellomlagring/fil',
    req,
    res,
    audience: process.env.INNSENDING_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
