import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy } from '@navikt/aap-felles-innbygger-utils';
import { logger } from '@navikt/aap-felles-innbygger-utils';
import { isMock, isLabs } from 'utils/environments';
import { slettBucket } from '../buckets/slett';
import { ErrorMedStatus } from 'auth/ErrorMedStatus';
import metrics from 'utils/metrics';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  try {
    const soknadRes = await sendSoknad(req.body, accessToken);
    metrics.sendSoknadCounter.inc({ type: 'STANDARD' });
    res.status(201).json(soknadRes);
  } catch (err) {
    if (err instanceof ErrorMedStatus) {
      res.status(err.status).json({ navCallId: err.navCallId });
    } else {
      throw err;
    }
  }
});

export const sendSoknad = async (data: string, accessToken?: string) => {
  if (isLabs()) {
    return { uri: `https://localhost:3000/aap/soknad/api/vedlegg/les?uuid=${randomUUID()}` };
  }
  if (isMock()) {
    await slettBucket('STANDARD', accessToken);
    return { uri: `https://localhost:3000/aap/soknad/api/vedlegg/les?uuid=${randomUUID()}` };
  }
  const søknad = await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/innsending/soknad`,
    prometheusPath: 'innsending/soknad',
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return søknad;
};

export default handler;
