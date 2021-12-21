import {useContext, useEffect} from 'react';
import {SoknadContext} from "../context/soknadContext";

export const useSoknadContext = () => useContext(SoknadContext);
