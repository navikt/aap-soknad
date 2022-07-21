import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXProxy } from '../../../auth/tokenXProxy';
import { lesCache } from '../../../mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from '../../../utils/api';
import { isMock } from '../../../utils/environments';
import { getStringFromPossiblyArrayQuery } from '../../../utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await lesBucket(type as SøknadsType, accessToken));
});

export const lesBucket = async (type: SøknadsType, accessToken?: string) => {
  if (isMock()) return lesCache(type) ?? {};
  const mellomlagretSøknad = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/buckets/les/${type}`,
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  console.log('mellomlagretSøknad', mellomlagretSøknad);
  return mellomlagretSøknad;
};

export default handler;
