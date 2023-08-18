import { GenericSoknadContextState } from '../../types/SoknadContext';
import { Soknad } from '../../types/Soknad';
import { v4 as uuid4 } from 'uuid';

export function migrerMellomlagretSøknad(
  mellomlagretSøknad: GenericSoknadContextState<Soknad>
): GenericSoknadContextState<Soknad> {
  /**
   * TODO Etter innføring av ID i utenlandsopphold og AndreBehandlere så må vi legge til
   * en id i eksisterende opphold frem til september 2023.
   *
   * Utenlandsopphold: 14.08.2023
   * AndreBehandlere: 17.08.2023
   */

  const andreBehandlereMedId = mellomlagretSøknad.søknad?.andreBehandlere?.map((behandlere) => {
    if (behandlere.id === undefined) {
      return { ...behandlere, id: uuid4() };
    } else {
      return behandlere;
    }
  });

  const utenlandsOpphold = mellomlagretSøknad?.søknad?.medlemskap?.utenlandsOpphold?.map(
    (utenlandsOpphold) => {
      if (utenlandsOpphold.id === undefined) {
        return { ...utenlandsOpphold, id: uuid4() };
      } else {
        return utenlandsOpphold;
      }
    }
  );

  return {
    ...mellomlagretSøknad,
    søknad: {
      ...mellomlagretSøknad.søknad,
      medlemskap: {
        ...mellomlagretSøknad.søknad?.medlemskap,
        utenlandsOpphold: utenlandsOpphold || [],
      },
      andreBehandlere: andreBehandlereMedId || [],
    },
  };
}
