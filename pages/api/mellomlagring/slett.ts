import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { deleteCache } from 'mock/mellomlagringsCache';
import { isMock } from 'utils/environments';
import { simpleTokenXProxy } from 'lib/api/simpleTokenXProxy';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  await slettInnsending(req);
  res.status(204).json({});
});

export const slettInnsending = async (req: NextApiRequest) => {
  if (isMock()) {
    await deleteCache();
    return;
  }

  try {
    const response = await simpleTokenXProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      audience: process.env.INNSENDING_AUDIENCE!,
      method: 'DELETE',
      req,
    });
    return response;
  } catch (error) {
    logError('Error sending slettInnsending', error);
    throw new Error('Error sending slettInnsending');
  }
};

export default handler;
