import React, {
  createContext,
  Dispatch,
  ReactNode,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import SoknadForm from '../types/SoknadForm';
import soknadReducer from './soknadReducer';
import { SoknadAction, SoknadActionKeys } from './soknadActions';
import { fetchPOST } from '../api/fetch';
import { StepType } from '../components/StepWizard/Step';
export enum SøknadType {
  UTLAND = 'UTLAND',
  HOVED = 'HOVED',
}
interface AppCache {
  state: SoknadContextState;
  stepList: Array<StepType>;
}
export interface SoknadContextState {
  version: number;
  type?: SøknadType;
  lagretCurrentStep?: string;
  søknad?: SoknadForm;
  lagretStepList?: Array<StepType>;
}
export interface SoknadContextData {
  søknadState: SoknadContextState;
  søknadDispatch: Dispatch<SoknadAction>;
}
interface Props {
  children: ReactNode;
}

const soknadContextInititalState = {
  version: 1,
  type: undefined,
  currentStep: undefined,
  søknad: undefined,
};
export const lagreSoknadState = async (
  state: SoknadContextState,
  stepList: StepType[],
  currentStep: string
) => {
  const payLoad: SoknadContextState = {
    ...state,
    lagretStepList: stepList,
    lagretCurrentStep: currentStep,
  };
  fetchPOST(`/aap/soknad-api/buckets/lagre/${state.type}`, payLoad);
};

export const hentSoknadState = async (dispatch: Dispatch<SoknadAction>, søknadType: SøknadType) => {
  const cachedState: SoknadContextState = await fetch(
    `/aap/soknad-api/buckets/les/${søknadType}`
  ).then((res) => res.json());
  console.log('bucket/les ', cachedState);
  cachedState && dispatch({ type: SoknadActionKeys.SET_STATE_FROM_CACHE, payload: cachedState });
  return cachedState;
};

export const slettLagretSoknadState = async (
  dispatch: Dispatch<SoknadAction>,
  søknadType: SøknadType
) => {
  const deleteResponse = await fetch(`/aap/soknad-api/buckets/slett/${søknadType}`, {
    method: 'DELETE',
  });
  deleteResponse?.ok &&
    dispatch({ type: SoknadActionKeys.SET_STATE_FROM_CACHE, payload: soknadContextInititalState });
  return !!deleteResponse?.ok;
};

export const SoknadContext = createContext<SoknadContextData | undefined>(undefined);

export const SoknadContextProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(soknadReducer, soknadContextInititalState);

  // lagre søknad når søknad endres
  // useEffect(() => {
  // const storeState = async () => {
  //   if(state.type) {
  //     const sendSøknad = await fetchPOST(`/aap/soknad-api/buckets/lagre/${state.type}`, {...state});
  //     console.log('storesøknad', sendSøknad);
  //   }
  // }
  // if(state.søknad) storeState();
  // eslint-disable-next-line
  // }, [state?.søknad]);

  // hent lagret søknad når type endres
  // useEffect(() => {
  //   const getStoredState = async () => {
  //     console.log('getStoredState', state.type);
  //     if(state.type){
  //       const cachedContext: SoknadContextState = await fetch(`/aap/soknad-api/buckets/les/${state?.type}`).then(res => res.json());
  //       console.log('getsøknad', cachedContext);
  //       cachedContext && dispatch({type: SoknadActionKeys.SET_STATE_FROM_CACHE, payload: cachedContext});
  //     }
  //   }
  //   if (!state?.søknad) getStoredState();
  //   // eslint-disable-next-line
  // },[state.type]);

  // slett lagret søknad
  // const deleteStoredState = useCallback(async (søknadType?: string) => {
  //   if(søknadType) {
  //     const deleteResponse = await fetch(`/aap/soknad-api/buckets/slett/${søknadType}`,{ method: 'DELETE' });
  //     console.log('slett søknad', deleteResponse?.ok)
  //     deleteResponse?.ok && dispatch({type: SoknadActionKeys.SET_STATE_FROM_CACHE, payload: soknadContextInititalState});
  //     return !!deleteResponse?.ok;
  //   }
  //   return false;
  // }, [])

  const contextValue = useMemo(() => {
    return { søknadState: state, søknadDispatch: dispatch };
  }, [state, dispatch]);

  return <SoknadContext.Provider value={contextValue}>{children}</SoknadContext.Provider>;
};

export const useSoknadContext = () => {
  const context = useContext(SoknadContext);
  if (context === undefined) {
    throw new Error('useSoknadContext must be used within a SoknadContextProvider');
  }
  return context;
};
