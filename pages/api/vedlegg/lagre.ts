import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXProxy } from '../../../auth/tokenXProxy';
import { isMock } from '../../../utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(201).json(await sendVedlegg(req.body, accessToken));
});

export const sendVedlegg = async (data: string, accessToken?: string) => {
  if (isMock()) return randomUUID();
  const søker = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return søker;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default handler;
