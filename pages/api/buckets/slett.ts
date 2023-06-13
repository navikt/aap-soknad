import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { deleteCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
    return;
  }
  const accessToken = getAccessTokenFromRequest(req);
  await slettBucket(type as SøknadsType, accessToken);
  res.status(204).json({});
});

export const slettBucket = async (type: SøknadsType, accessToken?: string) => {
  if (isMock()) {
    await deleteCache(type);
    return;
  }
  await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/buckets/slett/${type}`,
    prometheusPath: `buckets/slett/${type}`,
    method: 'DELETE',
    noResponse: true,
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
};

export default handler;
