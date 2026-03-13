'use client';

import { Dispatch, ReactNode, useMemo, useReducer, createContext } from 'react';
import { SoknadAction } from './actions';
import { soknadReducer } from './reducer';
import { SoknadContextState, soknadContextInitialState } from './soknadContextTypes';

// Re-export from types file so existing imports from 'soknadContext' still work
export type { SoknadContextState };
export { SOKNAD_VERSION, soknadContextInitialState as soknadContextInititalState } from './soknadContextTypes';

export interface SoknadContextType {
  søknadState: SoknadContextState;
  søknadDispatch: Dispatch<SoknadAction>;
}

export const SoknadContext = createContext<SoknadContextType | undefined>(undefined);

export const SoknadContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(soknadReducer, soknadContextInitialState);

  const contextValue = useMemo(() => {
    return { søknadState: state, søknadDispatch: dispatch };
  }, [state, dispatch]);

  return <SoknadContext.Provider value={contextValue}>{children}</SoknadContext.Provider>;
};
