import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { lesCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isLabs, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { SØKNAD_CONTEXT_VERSION } from 'context/soknadContextCommon';
import logger from 'utils/logger';

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
  const nySøknad = {
    type: 'STANDARD',
    version: SØKNAD_CONTEXT_VERSION,
    søknad: {},
  };
  if (isLabs()) {
    return nySøknad;
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
  if (mellomlagretSøknad?.version?.toString() !== SØKNAD_CONTEXT_VERSION?.toString()) {
    logger.info({
      cacheConflict: `Cache version: ${mellomlagretSøknad?.version}, SØKNAD_CONTEXT_VERSION: ${SØKNAD_CONTEXT_VERSION}`,
    });
  }
  return mellomlagretSøknad;
};

export default handler;
