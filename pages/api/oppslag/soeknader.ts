import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXProxy } from 'auth/tokenXProxy';
import { isMock } from 'utils/environments';
import { mockSøknader } from 'mock/søknader';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  res.status(200).json(await getSøknader(accessToken));
});

export const getSøknader = async (accessToken?: string): Promise<SøknadApiType[]> => {
  if (isMock()) return mockSøknader;
  const søker = await tokenXProxy({
    url: `${process.env.SOKNAD_API_URL}/oppslag/soeknader`,
    method: 'GET',
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
  });
  return søker;
};

export interface SøknadApiType {
  opprettet: string;
  søknadId: string;
  innsendte: ['ARBEIDSGIVER' | 'STUDIER' | 'ANDREBARN' | 'OMSORG' | 'UTLAND' | 'ANNET'];
  mangler: ['ARBEIDSGIVER' | 'STUDIER' | 'ANDREBARN' | 'OMSORG' | 'UTLAND' | 'ANNET'];
}

export default handler;
