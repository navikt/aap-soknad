import React, {createContext, Dispatch, ReactNode, useReducer, useMemo, useEffect} from "react";
import SoknadForm from "../types/SoknadForm";
import soknadReducer from "./soknadReducer";
import {SoknadAction, SoknadActionKeys} from "./soknadActions";
import {fetchPOST} from "../api/useFetch";
// import {fetchPOST} from "../api/useFetch";

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
  useEffect(() => {
    console.log('store soknad')
    const storeState = async () => {
      const sendSøknad = await fetchPOST("/aap/api/lagre/UTLAND", {...state});
      console.log('storesøknad', sendSøknad);
    }
    if(state.søknad) storeState();
  }, [state]);
  useEffect(() => {
    console.log('get soknad')
    const getStoredState = async () => {
      const søknad = await fetch("/aap/api/les/UTLAND").then(res => res.json());
      console.log('getsøknad', søknad);
      dispatch({type: SoknadActionKeys.SET_SOKNAD, payload: søknad});
    }
    if (!state?.søknad) getStoredState();
    // eslint-disable-next-line
  },[]);
  return (
    <SoknadContext.Provider value={contextValue} >
      {children}
    </SoknadContext.Provider>
  )
};
