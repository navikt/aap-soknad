import { GenericSoknadContextState } from 'types/SoknadContext';
import { StepType } from 'components/StepWizard/Step';
import { fetchPOST } from 'api/fetch';
import { Dispatch, useCallback } from 'react';
import { formatDateTime } from 'utils/date';
import { setSistLagret, SoknadAction } from 'context/soknadContextCommon';

export function useDebounceLagreSoknad<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>
) {
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
        sistLagret: formatDateTime(new Date()),
      };
      const res = await fetchPOST(`/aap/soknad/api/buckets/lagre/?type=${payload.type}`, payload);
      if (res.ok) setSistLagret(dispatch, formatDateTime(new Date()));
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
