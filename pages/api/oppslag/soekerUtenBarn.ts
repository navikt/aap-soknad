import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { isMock } from 'utils/environments';
import { mockSøkerUtenBarn } from 'mock/søkerUtenBarn';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getSøkerUtenBarn(accessToken));
});

export const getSøkerUtenBarn = async (accessToken?: string) => {
  if (isMock()) return mockSøkerUtenBarn;
  const søker = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/oppslag/soekerutenbarn`,
    prometheusPath: 'oppslag/soekerutenbarn',
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return søker;
};

export default handler;
