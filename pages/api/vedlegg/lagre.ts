import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXAxiosProxy } from '../../../auth/tokenXProxy';
import { isMock } from '../../../utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(201).json(await sendVedlegg(req, accessToken));
});

export const sendVedlegg = async (req: NextApiRequest, accessToken?: string) => {
  if (isMock()) return randomUUID();
  const vedlegg = await tokenXAxiosProxy({
    url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
    method: 'POST',
    req,
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return vedlegg;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
