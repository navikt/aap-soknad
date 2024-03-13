import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, logInfo, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { lesCache } from 'mock/mellomlagringsCache';
import { isFunctionalTest, isMock } from 'utils/environments';
import { defaultStepList } from 'pages';
import { SOKNAD_VERSION, SoknadContextState } from 'context/soknadcontext/soknadContext';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const result = await hentMellomlagring(req);
  res.status(200).json(result);
});

export const hentMellomlagring = async (
  req?: IncomingMessage,
): Promise<SoknadContextState | undefined> => {
  if (isFunctionalTest()) {
    return {
      version: SOKNAD_VERSION,
      søknad: {},
      lagretStepList: defaultStepList,
      requiredVedlegg: [],
    };
  }
  if (isMock()) {
    const result = await lesCache();
    return result ? JSON.parse(result) : {};
  }
  try {
    const mellomlagretSøknad = await simpleTokenXProxy<SoknadContextState>({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      method: 'GET',
      audience: process.env.INNSENDING_AUDIENCE!,
      req,
    });
    logInfo('Mellomlagret søknad hentet fra aap-innsending', mellomlagretSøknad);
    return mellomlagretSøknad;
  } catch (error: any) {
    logError('Noe gikk galt i henting av mellomlagring fra aap-innsending', error);
    return undefined;
  }
};

export default handler;
