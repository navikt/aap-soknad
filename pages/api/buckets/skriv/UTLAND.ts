import { NextApiRequest, NextApiResponse } from 'next';
import { søknadsdataCache, SØKNAD_KEY } from '../../../../src/utils/mockCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await søknadsdataCache.set(SØKNAD_KEY, req.body);
  res.status(200).json(req.body);
}
