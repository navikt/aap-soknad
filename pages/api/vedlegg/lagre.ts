import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { getAccessTokenFromRequest } from '../../../auth/accessToken';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { tokenXProxy } from '../../../auth/tokenXProxy';
import { isMock } from '../../../utils/environments';

const buffer = async (readable: Readable) => {
  const chunks: any = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  const body = await buffer(req);
  const rawBody = body.toString('utf-8');
  console.log('rawBody', rawBody);
  res.status(201).json(await sendVedlegg(rawBody, accessToken));
});

export const sendVedlegg = async (data: string, accessToken?: string) => {
  console.log('vedlegg', data);
  if (isMock()) return randomUUID();
  const søker = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/vedlegg/lagre`,
    method: 'POST',
    data: data,
    contentType: 'multipart/form-data',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return søker;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
