import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { lesCache } from 'mock/mellomlagringsCache';
import { isLabs, isMock } from 'utils/environments';
import { defaultStepList } from 'pages';
import { SOKNAD_VERSION, SoknadContextState } from 'context/soknadcontext/soknadContext';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);
  const result = await hentMellomlagring(accessToken);
  res.status(200).json(result);
});

export const hentMellomlagring = async (
  accessToken?: string,
  retryCount = 3,
): Promise<SoknadContextState | undefined> => {
  if (retryCount === 0) {
    logger.info(`RetryCount for å hente mellomlagret søknad er 0. Gir opp.`);
    return undefined;
  }
  if (isLabs()) {
    return {
      version: SOKNAD_VERSION,
      brukerMellomLagretSøknadFraAApInnsending: true,
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
      logger: logger,
    });

    if (!mellomlagretSøknad) {
      logger.info(
        `Mellomlagret søknad returnert fra tokenXApiProxy er undefined. Prøver på nytt. RetryCount: ${retryCount}`,
      );

      await new Promise((resolve) => setTimeout(resolve, 300));
      return await hentMellomlagring(accessToken, retryCount - 1);
    }

    if (mellomlagretSøknad?.version?.toString() !== SOKNAD_VERSION?.toString()) {
      logger.info(
        `Cache version: ${mellomlagretSøknad?.version}, SØKNAD_CONTEXT_VERSION: ${SOKNAD_VERSION}`,
      );
    }

    return mellomlagretSøknad;
  } catch (error: any) {
    if (error?.status === 503) {
      logger.info(
        `Mellomlagring ga 'Service is unavailable (503). Prøver på nytt. RetryCount: ${retryCount}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await hentMellomlagring(accessToken, retryCount - 1);
    }
    logger.info('Fant ingen mellomlagret søknad');
    return undefined;
  }
};

export default handler;
