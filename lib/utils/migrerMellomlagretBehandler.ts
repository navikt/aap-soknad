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
    const behandler = mellomlagretSøknad?.søknad?.registrerteBehandlere[0];

    const behandlerErKorrektErBesvart = behandler.erRegistrertFastlegeRiktig !== undefined;

    // trenger ikke migrere hvis spørsmålet om behandler ikke er besvart enda. Behandler vil da bli satt
    // i addBehandlerIfMissing som kalles fra [step].tsx
    if (behandlerErKorrektErBesvart) {
      delete mellomlagretSøknad.søknad.registrerteBehandlere;
      return {
        ...mellomlagretSøknad,
        søknad: {
          ...mellomlagretSøknad.søknad,
          fastlege: [
            {
              erRegistrertFastlegeRiktig: behandler?.erRegistrertFastlegeRiktig,
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
