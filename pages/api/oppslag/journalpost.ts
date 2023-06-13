import { NextApiRequest, NextApiResponse } from 'next';
import { beskyttetApi } from 'auth/beskyttetApi';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { tokenXProxy } from '../../../lib/utils/TokenxProxy';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const journalpostId = getStringFromPossiblyArrayQuery(req.query.journalpostId);
  if (!journalpostId) {
    res.status(400).json({ error: 'journalpostId må være en string' });
  }

  return await tokenXProxy(
    req,
    res,
    `/oppslag/soeknad/journalpost/${journalpostId}`,
    'oppslag/soeknad/journalpost/{journalpostId}'
  );
});

export const config = {
  api: {
    responseLimit: '50mb',
  },
};

export default handler;
