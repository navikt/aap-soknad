import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { lagreCache } from 'mock/mellomlagringsCache';
import { isFunctionalTest, isMock } from 'utils/environments';
import metrics from 'utils/metrics';

import { StepType } from 'components/StepWizard/Step';
import { hentMellomlagring } from 'pages/api/mellomlagring/les';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);

  const eksisterendeSøknad = await hentMellomlagring(accessToken);
  if (
    eksisterendeSøknad &&
    eksisterendeSøknad.søknad &&
    Object.keys(eksisterendeSøknad.søknad).length > 0 &&
    Object.keys(req.body.søknad).length === 0
  ) {
    const activeStepIndex = eksisterendeSøknad?.lagretStepList?.find(
      (e: StepType) => e.active,
    )?.stepIndex;

    logger.error(
      `Overskriver eksisterende søknad med en tom søknad på side ${activeStepIndex ?? 'ukjent'}`,
    );
  }
  await lagreBucket(req.body, accessToken);
  res.status(201).json({});
});

export const lagreBucket = async (data: string, accessToken?: string) => {
  if (isFunctionalTest()) return;
  if (isMock()) return await lagreCache(JSON.stringify(data));
  await tokenXApiProxy({
    url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
    prometheusPath: `mellomlagring`,
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.INNSENDING_AUDIENCE!,
    noResponse: true,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return;
};

export default handler;
