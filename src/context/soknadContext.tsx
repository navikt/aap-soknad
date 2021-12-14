import React, {createContext, Dispatch, ReactNode, useReducer, useMemo} from "react";
import SoknadForm from "../types/SoknadForm";
import soknadReducer from "./soknadReducer";
import {SoknadAction, SoknadActionKeys} from "./soknadActions";

export interface SoknadContextState {
  version: number;
  currentRoute: string;
  søknad?: SoknadForm;
  søkerinfo: string;
}
interface SoknadContextData {
  state: SoknadContextState;
  dispatch: Dispatch<SoknadAction>;
}
interface Props {
  children: ReactNode;
}

const soknadContextInititalState = {
  version: 1,
  currentRoute: 'test',
  søknad: undefined,
  søkerinfo: 'test'
}
export const SoknadContext = createContext<SoknadContextData>(null!);


export const SoknadContextProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(soknadReducer, soknadContextInititalState);
  const contextValue = useMemo(() => {
    return {state, dispatch}
  }, [state, dispatch]);
  const dispatchSoknad = (data: SoknadForm) => dispatch({type: SoknadActionKeys.SET_SOKNAD, payload: data });
  return (
    <SoknadContext.Provider value={contextValue} >
      {children}
    </SoknadContext.Provider>
  )
};
