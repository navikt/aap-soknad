import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { lesCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isLabs, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { SØKNAD_CONTEXT_VERSION } from 'context/soknadContextCommon';
import { defaultStepList } from 'pages';
import { ErrorMedStatus } from 'auth/ErrorMedStatus';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await lesBucket(type as SøknadsType, accessToken);
  res.status(200).json(result);
});

export const lesBucket = async (type: SøknadsType, accessToken?: string, retryCount = 3) => {
  const nySøknad = {
    type: 'STANDARD',
    version: SØKNAD_CONTEXT_VERSION,
    søknad: {},
    lagretStepList: defaultStepList,
  };
  if (isLabs()) {
    return nySøknad;
  }
  if (isMock()) {
    const result = await lesCache();
    // @ts-ignore-line
    return result ? JSON.parse(result) : {};
  }
  try {
    const mellomlagretSøknad = await tokenXApiProxy({
      url: `${process.env.SOKNAD_API_URL}/buckets/les/${type}`,
      prometheusPath: `buckets/les/${type}`,
      method: 'GET',
      audience: process.env.SOKNAD_API_AUDIENCE!,
      bearerToken: accessToken,
      metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
      metricsTimer: metrics.backendApiDurationHistogram,
      logger: logger,
    });
    if (mellomlagretSøknad?.version?.toString() !== SØKNAD_CONTEXT_VERSION?.toString()) {
      logger.info(
        `Cache version: ${mellomlagretSøknad?.version}, SØKNAD_CONTEXT_VERSION: ${SØKNAD_CONTEXT_VERSION}`
      );
    }

    if (!mellomlagretSøknad) {
      logger.info('Mellomlagret søknad returnert fra tokenXApiProxy er undefined');
    }

    return mellomlagretSøknad;
  } catch (error: any) {
    if (error?.status === 503) {
      logger.info(`Mellomlagring ga 'Service is unavailable (503). Prøver på nytt`);
      if (retryCount > 0) {
        logger.info(`Gjør nytt mellomlagringskall. RetryCount: ${retryCount}`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const mellomlagretSøknad: any = await lesBucket(type, accessToken, retryCount - 1);
        return mellomlagretSøknad;
      }
      if (retryCount === 0) {
        logger.error(`RetryCount for å hente mellomlagret søknad er 0. Gir opp.`);
      }
    }
    logger.info('Fant ingen mellomlagret søknad');
    logger.info(`Error fra tokenXProxy er: ${JSON.stringify(error)}`);
    return undefined;
  }
};

export default handler;
