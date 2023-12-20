import { RequiredVedlegg, SøknadType } from 'types/SoknadContext';
import { Soknad } from 'types/Soknad';
import React, { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react';
import { StepType } from 'components/StepWizard/Step';
import { SoknadAction } from './actions';
import { soknadReducer } from './reducer';

export interface SoknadContextState {
  version: number;
  type?: SøknadType;
  søknad?: Soknad;
  lagretStepList?: Array<StepType>;
  requiredVedlegg: RequiredVedlegg[];
  søknadUrl?: string;
  sistLagret?: string;
}
export const SØKNAD_CONTEXT_VERSION = 1;
export const soknadContextInititalState: SoknadContextState = {
  version: SØKNAD_CONTEXT_VERSION,
  søknad: undefined,
  requiredVedlegg: [],
  søknadUrl: undefined,
  type: SøknadType.STANDARD,
};

export interface SoknadContextType {
  søknadState: SoknadContextState;
  søknadDispatch: Dispatch<SoknadAction>;
}
export const SoknadContext = createContext<SoknadContextType | undefined>(undefined);

export const SoknadContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(soknadReducer, soknadContextInititalState);

  const contextValue = useMemo(() => {
    return { søknadState: state, søknadDispatch: dispatch };
  }, [state, dispatch]);

  return <SoknadContext.Provider value={contextValue}>{children}</SoknadContext.Provider>;
};
