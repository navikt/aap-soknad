import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy } from '@navikt/aap-felles-innbygger-auth';
import { logger } from '@navikt/aap-felles-innbygger-utils';
import metrics from 'utils/metrics';
import { isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const uuid = getStringFromPossiblyArrayQuery(req.query.uuid);
  console.log('uuid', uuid);
  if (!uuid) {
    res.status(400).json({ error: 'uuid må være en string' });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await lesVedlegg(uuid as string, accessToken);
  res.status(200).send(result.body);
});

export const lesVedlegg = async (uuid: string, accessToken?: string) => {
  if (isMock()) return await fetch('http://localhost:3000/aap/soknad/Rød.png');
  return await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/vedlegg/les/${uuid}`,
    prometheusPath: 'vedlegg/les/{uuid}',
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    rawResonse: true,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
};

export const config = {
  api: {
    responseLimit: '50mb',
  },
};

export default handler;
