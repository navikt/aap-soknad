import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { logError, logInfo, logWarning } from '@navikt/aap-felles-utils';
import { parse } from 'date-fns';
import metrics from 'utils/metrics';
import { getPerson } from 'app/api/oppslagapi/person/route';
import { getKrr } from 'app/api/oppslag/krr/route';
import { getBarn } from 'app/api/oppslag/barn/route';
import { getFastlege } from 'app/api/oppslag/fastlege/route';
import { hentMellomlagring } from 'lib/api/mellomlagring';
import { migrerMellomlagretBehandler } from 'lib/utils/migrerMellomlagretBehandler';
import { StepsPage } from 'components/pageComponents/standard/Steps/StepsPage';

async function getServerRequest() {
  const hdrs = await headers();
  return { headers: Object.fromEntries(hdrs.entries()) } as unknown as import('http').IncomingMessage;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}) {
  const { locale, step } = await params;

  const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({ path: '/[steg]' });
  const req = await getServerRequest();
  const accessToken = req.headers['authorization'] as string | undefined;

  const person = await getPerson(req);

  let kontaktinformasjon = null;
  try {
    kontaktinformasjon = await getKrr(accessToken);
  } catch (e) {
    logWarning('Noe gikk galt i kallet mot oppslag/krr', e);
  }

  let fastlege: import('app/api/oppslag/fastlege/route').Fastlege[] = [];
  try {
    fastlege = await getFastlege(accessToken);
  } catch (e) {
    logError('Noe gikk galt i kallet mot oppslag/fastlege', e);
  }

  let mellomlagretSøknad;
  try {
    mellomlagretSøknad = await hentMellomlagring(req);
  } catch (e) {
    logError('Noe gikk galt i innhenting av mellomlagret søknad', e);
  }

  if (mellomlagretSøknad) {
    mellomlagretSøknad = migrerMellomlagretBehandler(mellomlagretSøknad);
  }

  let barn: import('app/api/oppslag/barn/route').Barn[] = [];
  try {
    barn = await getBarn(accessToken);
    barn.sort((barnA, barnB) => {
      const a = parse(barnA.fødselsdato, 'yyyy-MM-dd', new Date() as any);
      const b = parse(barnB.fødselsdato, 'yyyy-MM-dd', new Date() as any);
      return (a as any) - (b as any);
    });
  } catch (e) {
    logError('Noe gikk galt i kallet mot barn fra aap-oppslag', e);
  }

  stopTimer();

  if (!mellomlagretSøknad?.lagretStepList) {
    logInfo('lagretStepList mangler i mellomlagret søknad, redirecter til startsiden');
    redirect(`/${locale}`);
  }

  return (
    <StepsPage
      step={step}
      person={person}
      mellomlagretSøknad={mellomlagretSøknad!}
      kontaktinformasjon={kontaktinformasjon}
      barn={barn}
      fastlege={fastlege}
    />
  );
}
