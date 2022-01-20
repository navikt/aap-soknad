import React, {createContext, Dispatch, ReactNode, useReducer, useMemo, useEffect, useCallback} from "react";
import SoknadForm from "../types/SoknadForm";
import soknadReducer from "./soknadReducer";
import {SoknadAction, SoknadActionKeys} from "./soknadActions";
import {fetchPOST} from "../api/useFetch";
export enum SøknadType {
  UTLAND = 'UTLAND',
}

export interface SoknadContextState {
  version: number;
  type?: SøknadType;
  currentStep?: string;
  søknad?: SoknadForm;
  søkerinfo: string;
}
interface SoknadContextData {
  state: SoknadContextState;
  dispatch: Dispatch<SoknadAction>;
  deleteStoredState: (søknadType?: string) => Promise<boolean>;
}
interface Props {
  children: ReactNode;
}

const soknadContextInititalState = {
  version: 1,
  type: undefined,
  currentStep: undefined,
  søknad: undefined,
  søkerinfo: 'test'
}
export const SoknadContext = createContext<SoknadContextData>(null!);


export const SoknadContextProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(soknadReducer, soknadContextInititalState);

  // lagre søknad når søknad endres
  useEffect(() => {
    const storeState = async () => {
      if(state.type) {
        const sendSøknad = await fetchPOST(`/aap/soknad-api/buckets/lagre/${state.type}`, {...state});
        console.log('storesøknad', sendSøknad);
      }
    }
    if(state.søknad) storeState();
    // eslint-disable-next-line
  }, [state?.søknad]);

  // hent lagret søknad når type endres
  useEffect(() => {
    const getStoredState = async () => {
      console.log('getStoredState', state.type);
      if(state.type){
        const cachedContext: SoknadContextState = await fetch(`/aap/soknad-api/buckets/les/${state?.type}`).then(res => res.json());
        console.log('getsøknad', cachedContext);
        cachedContext && dispatch({type: SoknadActionKeys.SET_STATE_FROM_CACHE, payload: cachedContext});
      }
    }
    if (!state?.søknad) getStoredState();
    // eslint-disable-next-line
  },[state.type]);

  // slett lagret søknad
  const deleteStoredState = useCallback(async (søknadType?: string) => {
    if(søknadType) {
      const deleteResponse = await fetch(`/aap/soknad-api/buckets/slett/${søknadType}`,{ method: 'DELETE' });
      console.log('slett søknad', deleteResponse?.ok)
      deleteResponse?.ok && dispatch({type: SoknadActionKeys.SET_STATE_FROM_CACHE, payload: soknadContextInititalState});
      return !!deleteResponse?.ok;
    }
    return false;
  }, [])


  const contextValue = useMemo(() => {
    return {state, dispatch, deleteStoredState}
  }, [state, dispatch, deleteStoredState]);

  return (
    <SoknadContext.Provider value={contextValue} >
      {children}
    </SoknadContext.Provider>
  )
};
