import { NextApiRequest, NextApiResponse } from 'next';
import { søknadsdataCache, SØKNAD_KEY } from '../../../../src/utils/mockCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const søknad = await søknadsdataCache.get(SØKNAD_KEY);
  res.status(200).json(søknad);
}
