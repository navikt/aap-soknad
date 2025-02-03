import { logAmplitudeEvent as dekoratorenLogEvent } from '@navikt/nav-dekoratoren-moduler';

export const logAmplitudeEvent = (eventName: string, eventData?: Record<string, any>) => {
  dekoratorenLogEvent({ origin: 'aap-soknad', eventName, eventData }).catch((e) => {
    console.log('Amplitude error', e);
  });
};

export function logSkjemaStartetEvent() {
  logAmplitudeEvent('skjema startet', {
    skjemanavn: 'aap-søknad-standard',
    skjemaId: 'aap-søknad-standard',
  });
}

export function logSkjemaFullførtEvent(eventData?: Record<string, unknown>) {
  logAmplitudeEvent('skjema fullført', {
    skjemanavn: 'aap-søknad-standard',
    skjemaId: 'aap-søknad-standard',
    ...eventData,
  });
}

export function logSkjemastegFullførtEvent(steg: number) {
  logAmplitudeEvent('skjemasteg fullført', {
    skjemanavn: 'aap-søknad-standard',
    skjemaId: 'aap-søknad-standard',
    steg,
  });
}

export function logAccordionChangeEvent(accordionName: string, isOpen: boolean) {
  logAmplitudeEvent(isOpen ? 'accordion lukket' : 'accordion åpnet', {
    tekst: accordionName,
  });
}

export function logSkjemaValideringFeiletEvent(stegnavn: string) {
  logAmplitudeEvent('skjema validering feilet', {
    skjemanavn: 'aap-søknad-standard',
    skjemaId: 'aap-søknad-standard',
    stegnavn,
  });
}

export function logVeiledningVistEvent() {
  logAmplitudeEvent('veiledning vist', {
    skjemanavn: 'aap-søknad-standard',
    skjemaId: 'aap-søknad-standard',
  });
}
