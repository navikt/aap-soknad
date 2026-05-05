import { SoknadContextState } from 'context/soknadcontext/soknadContext';

/**
 * Migrerer behandlere som er mellomlagret på struktur fra soknad-api
 * @param mellomlagretSøknad
 */

export const migrerMellomlagretBehandler = (
  mellomlagretSøknad: SoknadContextState,
): SoknadContextState => {
  if (Array.isArray(mellomlagretSøknad.søknad?.fastlege)) {
    return {
      ...mellomlagretSøknad,
      søknad: {
        ...mellomlagretSøknad.søknad,
        fastlege: mellomlagretSøknad.søknad.fastlege[0] || null,
      },
    };
  }

  return mellomlagretSøknad;
};
