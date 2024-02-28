import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { lagreCache } from 'mock/mellomlagringsCache';
import { erGyldigSøknadsType, GYLDIGE_SØKNADS_TYPER, SøknadsType } from 'utils/api';
import { isFunctionalTest, isMock } from 'utils/environments';
import { getStringFromPossiblyArrayQuery } from 'utils/string';
import metrics from 'utils/metrics';
import { lesBucket } from './les';
import { StepType } from 'components/StepWizard/Step';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = getStringFromPossiblyArrayQuery(req.query.type);
  if (erGyldigSøknadsType(type)) {
    res.status(400).json({ error: 'type må være en av ' + GYLDIGE_SØKNADS_TYPER.join(', ') });
  }
  const accessToken = getAccessTokenFromRequest(req);

  const eksisterendeSøknad = await lesBucket(type as SøknadsType, accessToken);
  if (
    eksisterendeSøknad &&
    eksisterendeSøknad.søknad &&
    Object.keys(eksisterendeSøknad.søknad).length > 0 &&
    Object.keys(req.body.søknad).length === 0
  ) {
    const activeStepIndex = eksisterendeSøknad?.lagretStepList?.find(
      (e: StepType) => e.active,
    )?.stepIndex;

    logError(
      `Overskriver eksisterende søknad med en tom søknad på side ${activeStepIndex ?? 'ukjent'}`,
    );
  }
  await lagreBucket(type as SøknadsType, req.body, accessToken);
  res.status(201).json({});
});

export const lagreBucket = async (type: SøknadsType, data: string, accessToken?: string) => {
  if (isFunctionalTest()) return;
  if (isMock()) return await lagreCache(JSON.stringify(data));
  await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/buckets/lagre/${type}`,
    prometheusPath: `buckets/lagre/${type}`,
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.SOKNAD_API_AUDIENCE!,
    noResponse: true,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });
  return;
};

export default handler;
