import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { lagreCache } from 'mock/mellomlagringsCache';
import { isFunctionalTest, isMock } from 'utils/environments';
import metrics from 'utils/metrics';

import { StepType } from 'components/StepWizard/Step';
import { hentMellomlagring } from 'pages/api/mellomlagring/les';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const eksisterendeSøknad = await hentMellomlagring(req);
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
  await mellomlagreSøknad(req.body, req);
  res.status(201).json({});
});

export const mellomlagreSøknad = async (data: object, req: IncomingMessage) => {
  if (isFunctionalTest()) return;
  if (isMock()) return await lagreCache(JSON.stringify(data));
  try {
    await simpleTokenXProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      method: 'POST',
      audience: process.env.INNSENDING_AUDIENCE!,
      body: data,
      req,
    });
    return;
  } catch (error) {
    logError('Noe gikk galt ved mellomlagring av søknad', error);
    throw new Error('Error saving søknad via aap-innsending');
  }
};

export default handler;
