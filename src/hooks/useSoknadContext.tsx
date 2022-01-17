import {useContext, useEffect} from 'react';
import {SoknadContext, SøknadType} from "../context/soknadContext";
import {SoknadActionKeys} from "../context/soknadActions";

export const useSoknadContext = (søknadType: SøknadType) => {
  const {state, dispatch} = useContext(SoknadContext);
  useEffect(() => {
    dispatch({type: SoknadActionKeys.SET_SOKNAD_TYPE, payload: søknadType})
    // eslint-disable-next-line
  }, [])
  return {state, dispatch};
}
