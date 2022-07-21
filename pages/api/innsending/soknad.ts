import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXProxy } from '../../../auth/tokenXProxy';
import { isMock } from '../../../utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(201).json(await sendSoknad(req.body, accessToken));
});

export const sendSoknad = async (data: string, accessToken?: string) => {
  if (isMock()) return { uri: 'https://localhost:3000/aap/soknad/api/download/soknad.pdf' };
  const søker = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/innsending/soknad`,
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return søker;
};

export default handler;
