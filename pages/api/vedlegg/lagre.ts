import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXAxiosProxy } from 'auth/tokenXProxy';
import { isMock } from 'utils/environments';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  if (isMock()) {
    res.status(201).json(randomUUID());
  } else {
    await tokenXAxiosProxy({
      url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
      req,
      res,
      audience: process.env.SOKNAD_API_AUDIENCE!,
      bearerToken: accessToken,
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
