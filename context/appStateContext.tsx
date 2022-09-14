import React, { createContext, Dispatch, ReactNode, useReducer, useContext, useMemo } from 'react';

export interface DispatchAppStateAction {
  payload?: any;
  error?: any;
  type: 'SET_APP_STATE';
}
export type AppState = {
  sistLagret?: string;
};
const appStateInitialValue = {};
type AppStateContextState = {
  appStateDispatch: Dispatch<DispatchAppStateAction>;
  appState: AppState;
};
const AppStateContext = createContext<AppStateContextState | undefined>(undefined);

function stateReducer(state: AppState, action: DispatchAppStateAction) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case 'SET_APP_STATE': {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
interface Props {
  children: ReactNode;
}
function AppStateContextProvider({ children }: Props) {
  const [state, dispatch] = useReducer(stateReducer, appStateInitialValue);
  const contextValue = useMemo(() => {
    return {
      appStateDispatch: dispatch,
      appState: state,
    };
  }, [state, dispatch]);
  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
}

export const setAppState = (state: AppState, dispatch: Dispatch<DispatchAppStateAction>) => {
  dispatch({ type: 'SET_APP_STATE', payload: state });
};
export const setSistLagret = (sistLagret: string, dispatch: Dispatch<DispatchAppStateAction>) => {
  dispatch({ type: 'SET_APP_STATE', payload: { sistLagret } });
};

function useAppStateContext() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppStateContext must be used within a AppStateContextProvider');
  }
  return context;
}

export { AppStateContextProvider, useAppStateContext };
