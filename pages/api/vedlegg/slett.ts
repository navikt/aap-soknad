import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXProxy } from '../../../auth/tokenXProxy';
import { isMock } from '../../../utils/environments';
import { getStringFromPossiblyArrayQuery } from '../../../utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const uuid = getStringFromPossiblyArrayQuery(req.query.uuid);
  console.log('uuid', uuid);
  if (!uuid) {
    res.status(400).json({ error: 'uuid må være en string' });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await slettVedlegg(uuid as string, accessToken);
  res.status(204).json({ result });
});

export const slettVedlegg = async (uuid: string, accessToken?: string) => {
  if (isMock()) return true;
  return await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/vedlegg/slett/${uuid}`,
    method: 'DELETE',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
};

export default handler;
