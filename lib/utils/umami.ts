import { type EventName } from '@navikt/analytics-types';
import { StepNames } from '../../pages';

declare global {
  interface Window {
    sporing?: {
      track: (eventName: EventName, eventData?: Record<string, unknown>) => void;
    };
  }
}


export function sporHendelse(hendelse: EventName, hendelseData?: Record<string, string | number>) {
  if (typeof window.sporing?.track === 'function') {
    window.sporing.track(hendelse, hendelseData || {});
  }
}


export function sporSkjemaHendelse(hendelse: EventName, skjemanavn: string) {
  sporHendelse(hendelse, { skjemanavn })
}
