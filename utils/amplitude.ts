import amplitude from 'amplitude-js';

const isBrowser = () => typeof window !== 'undefined';

export const initAmplitude = () => {
  if (isBrowser()) {
    amplitude.getInstance().init('default', '', {
      apiEndpoint: 'amplitude.nav.no/collect-auto',
      saveEvents: false,
      includeUtm: true,
      includeReferrer: true,
      platform: window.location.toString(),
    });
  }
};

export function logAmplitudeEvent(eventName: string, eventData?: Record<string, unknown>): void {
  setTimeout(() => {
    try {
      if (isBrowser()) {
        amplitude.getInstance().logEvent(eventName, eventData);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

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
