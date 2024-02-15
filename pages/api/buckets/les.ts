import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isLabs, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);
  const result = await lesBucket(type as SøknadsType, accessToken);
  res.status(200).json(result);
});

export const lesBucket = async (
  type: SøknadsType,
  accessToken?: string,
  retryCount = 3,
): Promise<SoknadContextState | undefined> => {
  if (retryCount === 0) {
    return undefined;
  }

  // Returnerer undefined ettersom vi heller bruker mellomlagring fra innsending lokalt
  if (isLabs() || isMock()) {
    return;
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

    if (!mellomlagretSøknad) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await lesBucket(type, accessToken, retryCount - 1);
    }

    return mellomlagretSøknad;
  } catch (error: any) {
    if (error?.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await lesBucket(type, accessToken, retryCount - 1);
    }
    logger.info('Fant ingen mellomlagret søknad hos soknad-api');
    return undefined;
  }
};

export default handler;
