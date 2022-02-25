import React, { createContext, Dispatch, ReactNode, useReducer, useContext, useMemo } from 'react';

interface DispatchSokerOppslagAction {
  payload?: any;
  error?: any;
  type: 'SET_SOKER_OPPSLAG';
}
type Navn = {
  fornavn: string;
  mellomnavn: string;
  etternavn: string;
};
type Barn = {
  navn: Navn;
  fødselsdato: string;
};
type SokerOppslagState = {
  navn: Navn;
  fødseldato: string;
  barn: Array<Barn>;
};
const søkerOppslagInitialValue = {
  barn: [],
};
const SokerOppslagContext = createContext<
  | { oppslagState: SokerOppslagState; oppslagDispatch: Dispatch<DispatchSokerOppslagAction> }
  | undefined
>(undefined);

function stateReducer(state: SokerOppslagState, action: DispatchSokerOppslagAction) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case 'SET_SOKER_OPPSLAG': {
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
function SokerOppslagProvider({ children }: Props) {
  const [state, dispatch] = useReducer(stateReducer, søkerOppslagInitialValue);
  const contextValue = useMemo(() => {
    return { oppslagState: state, oppslagDispatch: dispatch };
  }, [state, dispatch]);
  return (
    <SokerOppslagContext.Provider value={contextValue}>{children}</SokerOppslagContext.Provider>
  );
}

export const hentSokerOppslag = async (dispatch: Dispatch<DispatchSokerOppslagAction>) => {
  const oppslag: SokerOppslagState = await fetch('/aap/soknad-api/oppslag/soeker').then((res) =>
    res.json()
  );
  oppslag && dispatch({ type: 'SET_SOKER_OPPSLAG', payload: oppslag });
};

function useSokerOppslag() {
  const context = useContext(SokerOppslagContext);
  if (context === undefined) {
    throw new Error('useRegisterOppslag must be used within a RegisterOppslagProvider');
  }
  return context;
}

export { SokerOppslagProvider, useSokerOppslag };
