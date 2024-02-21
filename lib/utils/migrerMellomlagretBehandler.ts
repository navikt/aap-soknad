import { OppslagBehandler } from 'context/sokerOppslagContext';
import { formatFullAdresse, formatNavn } from 'utils/StringFormatters';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';

/**
 * Migrerer behandlere som er mellomlagret på struktur fra soknad-api
 * @param mellomlagretSøknad
 */

export const migrerMellomlagretBehandler = (
  mellomlagretSøknad: SoknadContextState,
): SoknadContextState => {
  if (
    mellomlagretSøknad.søknad?.registrerteBehandlere &&
    mellomlagretSøknad.søknad?.registrerteBehandlere.length > 0
  ) {
    // @ts-ignore Dersom behandler er fra soknad-api er den av type OppslagBehandler
    const behandler: OppslagBehandler = mellomlagretSøknad?.søknad?.registrerteBehandlere[0];

    // @ts-ignore - feltet ligger på RegistrertBehandler, som tidligere utvidet OppslagBehandler
    const behandlerErKorrektErBesvart = behandler.erRegistrertFastlegeRiktig !== undefined;

    // @ts-ignore -- for behandlere fra søknad-api ligger behandlerRef på kontaktinformasjon
    const behandlerErFraSoknadAPI = !!behandler.kontaktinformasjon.behandlerRef;

    // trenger ikke migrere hvis spørsmålet om behandler ikke er besvart enda. Behandler vil da bli satt
    // i addBehandlerIfMissing som kalles fra [step].tsx
    if (behandlerErKorrektErBesvart && behandlerErFraSoknadAPI) {
      // @ts-ignore
      const erFastlegeKorrekt = behandler.erRegistrertFastlegeRiktig ?? undefined;

      return {
        ...mellomlagretSøknad,
        søknad: {
          ...mellomlagretSøknad.søknad,
          registrerteBehandlere: [
            {
              erRegistrertFastlegeRiktig: erFastlegeKorrekt,
              navn: formatNavn(behandler.navn),
              behandlerRef: behandler.kontaktinformasjon.behandlerRef,
              kontaktinformasjon: {
                adresse: formatFullAdresse(behandler.kontaktinformasjon.adresse),
                telefon: behandler.kontaktinformasjon.telefon,
                kontor: behandler.kontaktinformasjon.kontor,
              },
            },
          ],
        },
      };
    }
  }
  return mellomlagretSøknad;
};
