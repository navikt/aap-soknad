import { type EventName } from '@navikt/analytics-types';

declare global {
  interface Window {
    sporing?: {
      track: (eventName: EventName, eventData?: Record<string, unknown>) => void;
    };
  }
}

export function sporHendelse(hendelse: EventName) {
  if (typeof window.sporing?.track === 'function') {
    window.sporing.track(hendelse);
  }
}
