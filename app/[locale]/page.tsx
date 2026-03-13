import React from 'react';
import { getAccessTokenFromServerHeaders } from 'auth/accessToken';
import { isMock } from 'utils/environments';
import { redirect } from 'next/navigation';
import { hentMellomlagring } from 'lib/api/mellomlagring';
import { getPerson } from 'app/api/oppslagapi/person/route';
import { isFunctionalTest } from 'utils/environments';
import { logError, logInfo } from '@navikt/aap-felles-utils';
import { StepType } from 'components/StepWizard/Step';
import metrics from 'utils/metrics';
import { IntroPage } from 'components/pageComponents/standard/Veiledning/IntroPage';
import { headers } from 'next/headers';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({ path: '/standard' });

  // Auth is handled by middleware, but we still need the token for API calls
  const hdrs = await headers();
  const req = { headers: Object.fromEntries(hdrs.entries()) } as unknown as import('http').IncomingMessage;

  const person = await getPerson(req);

  let mellomlagretSøknad;
  try {
    mellomlagretSøknad = await hentMellomlagring(req);
  } catch (e) {
    logError('Noe gikk galt i innhenting av mellomlagret søknad', e);
  }

  const activeStep = mellomlagretSøknad?.lagretStepList?.find((e: StepType) => e.active);
  const activeIndex = activeStep?.stepIndex;

  stopTimer();

  if (activeIndex && !isFunctionalTest()) {
    logInfo('Starter påbegynt søknad');
    redirect(`/${locale}/${activeIndex}`);
  }

  return <IntroPage person={person} />;
}
