import { type EventName, Events, type PropertiesFor } from '@navikt/analytics-types';
import { getAnalyticsInstance } from '@navikt/nav-dekoratoren-moduler';
import { isDev } from 'utils/environments';

const sporing = getAnalyticsInstance('aap-soknad') as (
  hendelse: EventName,
  hendelseData?: PropertiesFor<EventName>,
) => Promise<unknown>;

export function sporHendelse<T extends EventName>(hendelse: T, hendelseData?: PropertiesFor<T>) {
  // sporing ikke aktivert i prod
  if (isDev()) {
    sporing(hendelse, hendelseData);
  }
}

type SkjemaHendelse = typeof Events.SKJEMA_STARTET | typeof Events.SKJEMA_FULLFORT;

export const SKJEMANAVN = 'SOKNAD';

export function sporSkjemaHendelse(hendelse: SkjemaHendelse, skjemanavn: string) {
  sporHendelse(hendelse, { skjemanavn });
}

export function sporStegStartet(steg: string) {
  sporHendelse(Events.SKJEMA_STARTET, { skjemanavn: SKJEMANAVN, kontekst: steg });
}

export function sporStegFullfort(steg: string) {
  sporHendelse(Events.SKJEMA_STEG_FULLFORT, { skjemanavn: SKJEMANAVN, steg, kontekst: steg });
}

export function sporFileInputHendelse(kategori: string) {
  sporHendelse(Events.FIL_LASTET_OPP, { kontekst: kategori });
}

export function sporLesMerApnet(tittel: string) {
  sporHendelse(Events.LES_MER_APNET, { tittel });
}

export function sporAccordionApnet(tittel: string) {
  sporHendelse(Events.ACCORDION_APNET, { tittel });
}

export function sporLenkeKlikket(lenketekst: string, destinasjon: string, kontekst?: string) {
  sporHendelse(Events.NAVIGERE, { lenketekst, destinasjon, kontekst });
}

export function sporKnappKlikket(tekst: string, kontekst?: string) {
  sporHendelse(Events.KNAPP_KLIKKET, { tekst, kontekst });
}
