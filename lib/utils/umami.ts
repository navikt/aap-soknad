import { type EventName, Events } from '@navikt/analytics-types';

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

export function sporFileInputHendelse(kategori: string) {
  sporHendelse(Events.FIL_LASTET_OPP, { kategori });
}
