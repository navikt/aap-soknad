import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const journalpostId = getStringFromPossiblyArrayQuery(req.query.journalpostId);
  if (!journalpostId) {
    res.status(400).json({ error: 'journalpostId må være en string' });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await lesJournalpost(journalpostId as string, accessToken);
  res.status(200).send(result.body);
});

export const lesJournalpost = async (journalpostId: string, accessToken?: string) => {
  if (isMock()) return await fetch('http://localhost:3000/aap/soknad/Rød.png');
  return await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/oppslag/soeknad/journalpost/${journalpostId}`,
    prometheusPath: 'oppslag/soeknad/journalpost/{journalpostId}',
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    rawResonse: true,
  });
};

export const config = {
  api: {
    responseLimit: '50mb',
  },
};

export default handler;
