import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { lagreCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isLabs, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);
  await lagreBucket(type as SøknadsType, req.body, accessToken);
  res.status(201).json({});
});

export const lagreBucket = async (type: SøknadsType, data: string, accessToken?: string) => {
  if (isLabs()) return;
  if (isMock()) return await lagreCache(JSON.stringify(data));
  await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/buckets/lagre/${type}`,
    prometheusPath: `buckets/lagre/${type}`,
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.SOKNAD_API_AUDIENCE!,
    noResponse: true,
    bearerToken: accessToken,
  });
  return;
};

export default handler;
