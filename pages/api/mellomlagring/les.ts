import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { lesCache } from 'mock/mellomlagringsCache';
import { isFunctionalTest, isMock } from 'utils/environments';
import { defaultStepList } from 'pages';
import { SOKNAD_VERSION, SoknadContextState } from 'context/soknadcontext/soknadContext';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  const result = await hentMellomlagring(accessToken);
  res.status(200).json(result);
});

export const hentMellomlagring = async (
  accessToken?: string,
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
    const mellomlagretSøknad = await tokenXApiProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      prometheusPath: `mellomlagring`,
      method: 'GET',
      audience: process.env.INNSENDING_AUDIENCE!,
      bearerToken: accessToken,
      metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
      metricsTimer: metrics.backendApiDurationHistogram,
    });

    return mellomlagretSøknad;
  } catch (error: any) {
    logError('Noe gikk galt i henting av mellomlagring fra aap-innsending', error);
    return undefined;
  }
};

export default handler;
