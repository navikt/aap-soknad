import { init, track } from '@amplitude/analytics-browser';

export const initAmplitude = () => {
  init('default', undefined, {
    useBatch: true,
    serverUrl: 'https://amplitude.nav.no/collect-auto',
    ingestionMetadata: {
      sourceName: window.location.toString(),
    },
  });
};

export const logAmplitudeEvent = (event: string, properties?: Record<string, any>) => {
  console.log('tracking amplitude event');
  track(event, properties);
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
