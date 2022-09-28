import { NextApiRequest, NextApiResponse } from 'next';
import { register } from 'prom-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-type', register.contentType);
  res.send(await register.metrics());
}
