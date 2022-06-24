import { useEffect, useState } from 'react';
import { StepType } from '../components/StepWizard/Step';
import { fetchPOST } from '../api/fetch';
import { GenericSoknadContextState } from '../types/SoknadContext';

export function useLagrePartialSoknad<SoknadStateType>() {
  const [lastPayload, setLastPayload] = useState<GenericSoknadContextState<SoknadStateType>>();
  useEffect(() => console.log('lastPayload Updated', lastPayload), [lastPayload]);
  const lagreSøknad = async (payload: GenericSoknadContextState<SoknadStateType>) => {
    console.log('payload', payload);
    console.log('prevpayload', lastPayload);
    if (equalPayLoads(payload, lastPayload)) {
      console.log('duplicate payloads');
      return Promise.resolve();
    } else {
      setLastPayload(payload);
      return fetchPOST(`/aap/soknad-api/buckets/lagre/${payload.type}`, payload);
    }
  };
  const lagrePartialSøknad = async (
    state: GenericSoknadContextState<SoknadStateType>,
    stepList: StepType[],
    partialSøknad: any
  ) => {
    if (state?.type && partialSøknad && Object.keys(partialSøknad)?.length > 0) {
      const payload: GenericSoknadContextState<SoknadStateType> = {
        ...state,
        søknad: { ...state.søknad, ...partialSøknad },
        lagretStepList: stepList,
      };
      lagreSøknad(payload);
    }
  };
  return lagrePartialSøknad;
}

const equalPayLoads = (a: any, b: any) => {
  if (a === b) return true;
  if (typeof a != 'object' || typeof b != 'object' || typeof a == null || typeof b == null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length != keysB.length) {
    return false;
  }
  for (let key of keysA) {
    if (!keysB.includes(key) || !equalPayLoads(a[key], b[key])) return false;
  }
  return true;
};
