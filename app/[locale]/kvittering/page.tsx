import React from 'react';
import { headers } from 'next/headers';
import { logWarning } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { getPerson } from 'app/api/oppslagapi/person/route';
import { getKrr } from 'app/api/oppslag/krr/route';
import { KvitteringPage } from 'components/pageComponents/standard/Kvittering/KvitteringPage';

export default async function Page() {
  const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({ path: '/kvittering' });
  const hdrs = await headers();
  const req = { headers: Object.fromEntries(hdrs.entries()) } as unknown as import('http').IncomingMessage;
  const accessToken = hdrs.get('authorization');

  const person = await getPerson(req);

  let kontaktinformasjon = null;
  try {
    kontaktinformasjon = await getKrr(accessToken);
  } catch (e) {
    logWarning('Noe gikk galt i kallet mot oppslag/krr', e);
  }

  stopTimer();

  return <KvitteringPage person={person} kontaktinformasjon={kontaktinformasjon} />;
}
