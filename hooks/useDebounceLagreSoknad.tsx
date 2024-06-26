import { StepType } from 'components/StepWizard/Step';
import { fetchPOST } from 'api/fetch';
import { useCallback } from 'react';
import { formatDateTime } from 'utils/date';
import { setSistLagret, useAppStateContext } from 'context/appStateContext';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';
import { søknadVedleggStateTilFilIdString } from 'utils/vedlegg';

export function useDebounceLagreSoknad<SoknadStateType>() {
  const { appStateDispatch } = useAppStateContext();

  async function lagrePartialSøknad<SoknadStateType>(
    state: SoknadContextState,
    stepList: StepType[],
    partialSøknad: any,
  ) {
    const payload: SoknadContextState = {
      ...state,
      søknad: { ...state.søknad, ...partialSøknad },
      lagretStepList: stepList,
      sistLagret: formatDateTime(new Date()),
    };
    const res = await mellomLagreSøknad(payload);
    if (res?.ok) setSistLagret(formatDateTime(new Date()), appStateDispatch);
  }

  const debouncedLagre = () => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    return (state: SoknadContextState, stepList: StepType[], partialSøknad: any) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => lagrePartialSøknad(state, stepList, partialSøknad), 2000);
    };
  };
  return useCallback(debouncedLagre(), []);
}
export async function mellomLagreSøknad(contextState: SoknadContextState) {
  if (contextState.søknad) {
    const vedleggString = søknadVedleggStateTilFilIdString(contextState.søknad);
    return await fetchPOST(`/aap/soknad/api/mellomlagring/lagre`, contextState, {
      headers: {
        vedlegg: vedleggString,
      },
    });
  }
}
