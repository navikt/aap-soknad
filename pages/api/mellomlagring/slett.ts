import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, logInfo, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { deleteCache } from 'mock/mellomlagringsCache';
import { isMock } from 'utils/environments';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';
import { ca } from 'date-fns/locale';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  await slettBucket(req);
  res.status(204).json({});
});

export const slettBucket = async (req: IncomingMessage) => {
  if (isMock()) {
    await deleteCache();
    return;
  }

  try {
    const result = await simpleTokenXProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      method: 'DELETE',
      audience: process.env.INNSENDING_AUDIENCE!,
      req,
    });
    logInfo('Søknad slettet via aap-innsending', result);
    return result;
  } catch (error) {
    logError('Noe gikk galt ved sletting av søknad', error);
    throw new Error('Error deleting søknad via aap-innsending');
  }
};

export default handler;
