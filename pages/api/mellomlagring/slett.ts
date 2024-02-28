import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { deleteCache } from 'mock/mellomlagringsCache';
import { isMock } from 'utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  await slettBucket(accessToken);
  res.status(204).json({});
});

export const slettBucket = async (accessToken?: string) => {
  if (isMock()) {
    await deleteCache();
    return;
  }

  await tokenXApiProxy({
    url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
    prometheusPath: `mellomlagring`,
    method: 'DELETE',
    noResponse: true,
    audience: process.env.INNSENDING_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });
};

export default handler;
