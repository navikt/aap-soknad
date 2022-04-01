import React, { createContext, Dispatch, ReactNode, useReducer, useContext, useMemo } from 'react';

interface DispatchVedleggAction {
  payload?: RequiredVedlegg[];
  error?: any;
  type: 'ADD_VEDLEGG';
}
type RequiredVedlegg = {
  type: string;
  description: string;
};
type VedleggState = {
  requiredVedlegg: RequiredVedlegg[];
};
type VedleggContextState = {
  vedleggState: VedleggState;
  vedleggDispatch: Dispatch<DispatchVedleggAction>;
};
const VedleggContext = createContext<VedleggContextState | undefined>(undefined);

function stateReducer(state: VedleggState, action: DispatchVedleggAction) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case 'ADD_VEDLEGG': {
      const vedleggList =
        action?.payload?.filter(
          (vedlegg) => !state?.requiredVedlegg?.find((e) => e?.type === vedlegg?.type)
        ) || [];
      return {
        ...state,
        requiredVedlegg: [...state?.requiredVedlegg, ...vedleggList],
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
interface Props {
  children: ReactNode;
}
function VedleggContextProvider({ children }: Props) {
  const [state, dispatch] = useReducer(stateReducer, { requiredVedlegg: [] });
  const contextValue = useMemo(() => {
    return {
      vedleggState: state,
      vedleggDispatch: dispatch,
    };
  }, [state, dispatch]);
  return <VedleggContext.Provider value={contextValue}>{children}</VedleggContext.Provider>;
}

export const addRequiredVedlegg = async (
  vedlegg: RequiredVedlegg[],
  dispatch: Dispatch<DispatchVedleggAction>
) => {
  if (vedlegg) dispatch({ type: 'ADD_VEDLEGG', payload: vedlegg });
};

function useVedleggContext() {
  const context = useContext(VedleggContext);
  if (context === undefined) {
    throw new Error('useVedleggContext must be used within a RegisterVedleggProvider');
  }
  return context;
}

export { VedleggContextProvider, useVedleggContext };
