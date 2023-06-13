import { NextApiRequest, NextApiResponse } from 'next';
import { beskyttetApi } from 'auth/beskyttetApi';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { tokenXProxy } from '../../../lib/utils/TokenxProxy';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const uuid = getStringFromPossiblyArrayQuery(req.query.uuid);
  console.log('uuid', uuid);
  if (!uuid) {
    res.status(400).json({ error: 'uuid må være en string' });
  }

  return await tokenXProxy(req, res, `/vedlegg/les/${uuid}`, '/vedlegg/les');
});

export const config = {
  api: {
    responseLimit: '50mb',
  },
};

export default handler;
