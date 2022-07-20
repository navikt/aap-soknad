import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXProxy } from '../../../auth/tokenXProxy';
import { mockSøker } from '../../../mock/søker';
import { isMock } from '../../../utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(getSøker(accessToken));
});

export const getSøker = async (accessToken?: string) => {
  if (isMock()) return mockSøker;
  const søker = await tokenXProxy({
    url: '',
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
};
