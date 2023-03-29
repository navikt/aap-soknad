import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy } from '@navikt/aap-felles-innbygger-utils';
import { logger } from '@navikt/aap-felles-innbygger-utils';
import metrics from 'utils/metrics';
import { lesCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isLabs, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { SØKNAD_CONTEXT_VERSION } from 'context/soknadContextCommon';
import { defaultStepList } from 'pages';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await lesBucket(type as SøknadsType, accessToken);
  res.status(200).json(result);
});

export const lesBucket = async (type: SøknadsType, accessToken?: string) => {
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
    return mellomlagretSøknad;
  } catch (error) {
    logger.info('Fant ingen mellomlagret søknad');
    return undefined;
  }
};

export default handler;
