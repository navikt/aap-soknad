import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { lesCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isLabs, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { defaultStepList } from 'pages/standard';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await lesBucket(type as SøknadsType, accessToken);
  res.status(200).json(result);
});

export const lesBucket = async (type: SøknadsType, accessToken?: string) => {
  if (isLabs()) {
    return {
      type: 'STANDARD',
      version: 1,
      søknad: {},
      lagretStepList: defaultStepList,
    };
  }
  if (isMock()) {
    const result = await lesCache();
    // @ts-ignore-line
    return result ? JSON.parse(result) : {};
  }
  const mellomlagretSøknad = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/buckets/les/${type}`,
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return mellomlagretSøknad;
};

export default handler;
