import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { isMock } from 'utils/environments';
import { getCommaSeparatedStringFromStringOrArray } from 'utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const uuids = req.query.uuids ?? [];
  if (!uuids) {
    res.status(400).json({ error: 'uuid må være en string' });
  }
  const accessToken = getAccessTokenFromRequest(req);
  await slettVedlegg(uuids, accessToken);
  res.status(204).json({});
});

export const slettVedlegg = async (uuids: string | string[], accessToken?: string) => {
  if (isMock()) return;
  const commaSeparatedUuids = getCommaSeparatedStringFromStringOrArray(uuids);
  await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/vedlegg/slett?uuids=${commaSeparatedUuids}`,
    prometheusPath: 'vedlegg/slett',
    method: 'DELETE',
    noResponse: true,
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
};

export default handler;
