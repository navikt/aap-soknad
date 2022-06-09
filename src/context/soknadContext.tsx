import React, { createContext, Dispatch, ReactNode, useReducer, useMemo, useContext } from 'react';
import soknadReducer from './soknadReducer';
import { SoknadAction, SoknadActionKeys } from './soknadActions';
import { fetchPOST } from '../api/fetch';
import { StepType } from '../components/StepWizard/Step';
import Soknad from '../types/Soknad';
import { OppslagBarn } from './sokerOppslagContext';
export enum SøknadType {
  UTLAND = 'UTLAND',
  HOVED = 'HOVED',
}
export interface SoknadContextState {
  version: number;
  type?: SøknadType;
  lagretCurrentStep?: string;
  søknad?: Soknad;
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
export const lagreSoknadState = async (state: SoknadContextState, stepList: StepType[]) => {
  const payLoad: SoknadContextState = {
    ...state,
    lagretStepList: stepList,
  };
  fetchPOST(`/aap/soknad-api/buckets/lagre/${state.type}`, payLoad);
};

export const hentSoknadState = async (dispatch: Dispatch<SoknadAction>, søknadType: SøknadType) => {
  const cachedState: SoknadContextState = await fetch(
    `/aap/soknad-api/buckets/les/${søknadType}`
  ).then((res) => (res.ok ? res.json() : undefined));
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

export const setSøknadData = (dispatch: Dispatch<SoknadAction>, data: Soknad) => {
  dispatch({ type: SoknadActionKeys.SET_SOKNAD, payload: data });
};
export const updateSøknadData = (dispatch: Dispatch<SoknadAction>, data: Soknad) => {
  const updatedData = dispatch({ type: SoknadActionKeys.UPDATE_SOKNAD, payload: data });
  console.log('updatedData', updatedData);
};
export const addBarnIfMissing = (dispatch: Dispatch<SoknadAction>, data: OppslagBarn[]) => {
  dispatch({ type: SoknadActionKeys.ADD_BARN_IF_MISSING, payload: data });
};

export const SoknadContext = createContext<SoknadContextData | undefined>(undefined);

export const SoknadContextProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(soknadReducer, soknadContextInititalState);

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
