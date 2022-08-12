import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { GenericSoknadContextState, SøknadType } from 'types/SoknadContext';
import SoknadUtland from 'types/SoknadUtland';
import {
  soknadContextInititalState,
  SoknadAction,
  SoknadContextData,
  ProviderProps,
  SoknadActionKeys,
} from './soknadContextCommon';

const soknadContextInititalStateUtland = {
  ...soknadContextInititalState,
  type: SøknadType.UTLAND,
};

function soknadReducerUtland(
  state: GenericSoknadContextState<SoknadUtland>,
  action: SoknadAction<SoknadUtland>
): GenericSoknadContextState<SoknadUtland> {
  console.log('soknadReducer', action.type, action.payload);
  switch (action.type) {
    case SoknadActionKeys.SET_STATE_FROM_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    case SoknadActionKeys.SET_SOKNAD_TYPE:
      return {
        ...state,
        type: action.payload,
      };
    case SoknadActionKeys.SET_SOKNAD:
      return {
        ...state,
        søknad: action.payload,
      };
    case SoknadActionKeys.UPDATE_SOKNAD:
      return {
        ...state,
        søknad: {
          ...state?.søknad,
          ...action.payload,
        },
      };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const SoknadContextUtland = createContext<SoknadContextData<SoknadUtland> | undefined>(
  undefined
);

export const SoknadContextProviderUtland = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(soknadReducerUtland, soknadContextInititalStateUtland);

  const contextValue: SoknadContextData<SoknadUtland> = useMemo(() => {
    return { søknadState: state, søknadDispatch: dispatch };
  }, [state, dispatch]);

  return (
    <SoknadContextUtland.Provider value={contextValue}>{children}</SoknadContextUtland.Provider>
  );
};

export const useSoknadContextUtland = () => {
  const context = useContext(SoknadContextUtland);
  if (context === undefined) {
    throw new Error('useSoknadContextUtland must be used within a SoknadContextProviderUtland');
  }
  return context;
};
