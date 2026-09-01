import { type EventName, Events, type PropertiesFor } from '@navikt/analytics-types';
import { getAnalyticsInstance } from '@navikt/nav-dekoratoren-moduler';
import { isDev } from 'utils/environments';

const sporing = getAnalyticsInstance('aap-soknad') as (
  hendelse: EventName,
  hendelseData?: PropertiesFor<EventName>
) => Promise<unknown>;

export function sporHendelse<T extends EventName>(hendelse: T, hendelseData?: PropertiesFor<T>) {
  // sporing ikke aktivert i prod
  if(isDev()){
    sporing(hendelse, hendelseData);
  }
}


type SkjemaHendelse = typeof Events.SKJEMA_STARTET | typeof Events.SKJEMA_FULLFORT;

export function sporSkjemaHendelse(hendelse: SkjemaHendelse, skjemanavn: string) {
  sporHendelse(hendelse, { skjemanavn })
}

export function sporFileInputHendelse(kategori: string) {
  sporHendelse(Events.FIL_LASTET_OPP, { kontekst: kategori });
}
