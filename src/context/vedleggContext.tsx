import React, { createContext, Dispatch, ReactNode, useReducer, useContext, useMemo } from 'react';

export enum VedleggActionKeys {
  ADD_VEDLEGG = 'ADD_VEDLEGG',
  REMOVE_VEDLEGG = 'REMOVE_VEDLEGG',
}
type AddVedlegg = {
  type: VedleggActionKeys.ADD_VEDLEGG;
  payload?: RequiredVedlegg[];
};
type RemoveVedlegg = {
  type: VedleggActionKeys.REMOVE_VEDLEGG;
  payload?: string;
};
export type VedleggAction = AddVedlegg | RemoveVedlegg;

type RequiredVedlegg = {
  type: string;
  description: string;
  filterType?: string;
};
type VedleggState = {
  requiredVedlegg: RequiredVedlegg[];
};
type VedleggContextState = {
  vedleggState: VedleggState;
  vedleggDispatch: Dispatch<VedleggAction>;
};
const VedleggContext = createContext<VedleggContextState | undefined>(undefined);

function stateReducer(state: VedleggState, action: VedleggAction) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case 'ADD_VEDLEGG': {
      const vedleggList =
        action?.payload?.filter(
          (vedlegg) =>
            !state?.requiredVedlegg?.find((e) => {
              return e?.type === vedlegg?.type;
            })
        ) || [];
      return {
        ...state,
        requiredVedlegg: [...state?.requiredVedlegg, ...vedleggList],
      };
    }
    case 'REMOVE_VEDLEGG': {
      const newVedleggList = state?.requiredVedlegg?.filter((e) => {
        return !(e?.type === action?.payload);
      });
      return {
        ...state,
        requiredVedlegg: [...newVedleggList],
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
  dispatch: Dispatch<VedleggAction>
) => {
  if (vedlegg) dispatch({ type: VedleggActionKeys.ADD_VEDLEGG, payload: vedlegg });
};
export const removeRequiredVedlegg = async (
  vedleggType: string,
  dispatch: Dispatch<VedleggAction>
) => {
  if (vedleggType) dispatch({ type: VedleggActionKeys.REMOVE_VEDLEGG, payload: vedleggType });
};

function useVedleggContext() {
  const context = useContext(VedleggContext);
  if (context === undefined) {
    throw new Error('useVedleggContext must be used within a RegisterVedleggProvider');
  }
  return context;
}

export { VedleggContextProvider, useVedleggContext };
