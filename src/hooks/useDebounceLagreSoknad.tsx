import { GenericSoknadContextState } from '../types/SoknadContext';
import { StepType } from '../components/StepWizard/Step';
import { fetchPOST } from '../api/fetch';
import { useCallback } from 'react';

export function useDebounceLagreSoknad<SoknadStateType>() {
  async function lagrePartialSøknad<SoknadStateType>(
    state: GenericSoknadContextState<SoknadStateType>,
    stepList: StepType[],
    partialSøknad: any
  ) {
    if (state?.type && partialSøknad && Object.keys(partialSøknad)?.length > 0) {
      const payload: GenericSoknadContextState<SoknadStateType> = {
        ...state,
        søknad: { ...state.søknad, ...partialSøknad },
        lagretStepList: stepList,
      };
      fetchPOST(`/aap/soknad-api/buckets/lagre/${payload.type}`, payload);
    }
  }
  const debouncedLagre = () => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    return (
      state: GenericSoknadContextState<SoknadStateType>,
      stepList: StepType[],
      partialSøknad: any
    ) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => lagrePartialSøknad(state, stepList, partialSøknad), 2000);
    };
  };
  return useCallback(debouncedLagre(), []);
}
