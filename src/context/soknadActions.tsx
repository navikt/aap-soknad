import {SøknadType, SoknadContextState} from "./soknadContext";
export enum SoknadActionKeys {
  SET_STATE_FROM_CACHE = 'SET_STATE_FROM_CACHE',
  SET_SOKNAD_TYPE = 'SET_SOKNAD_TYPE',
  SET_SOKNAD = 'SET_SOKNAD',
  SET_CURRENT_STEP = 'SET_CURRENT_STEP'
}
type SetStateFromCache = {
  type: SoknadActionKeys.SET_STATE_FROM_CACHE;
  payload?: SoknadContextState
}
type SetSoknadType = {
  type: SoknadActionKeys.SET_SOKNAD_TYPE;
  payload?: SøknadType
}
type SetSoknad = {
  type: SoknadActionKeys.SET_SOKNAD;
  payload?: any
}
type SetCurrentStep = {
  type: SoknadActionKeys.SET_CURRENT_STEP;
  payload?: string
}
export type SoknadAction =
  | SetStateFromCache
  | SetSoknadType
  | SetSoknad
  | SetCurrentStep;