import { GenericSoknadContextState, SøknadType } from '../types/SoknadContext';
import { Dispatch, ReactNode } from 'react';
import { OppslagBarn } from './sokerOppslagContext';

export interface SoknadContextData<SoknadStateType> {
  søknadState: GenericSoknadContextState<SoknadStateType>;
  søknadDispatch: Dispatch<SoknadAction<SoknadStateType>>;
}
export interface ProviderProps {
  children: ReactNode;
}

export const soknadContextInititalState = {
  version: 1,
  type: undefined,
  currentStep: undefined,
  søknad: undefined,
};

export enum SoknadActionKeys {
  SET_STATE_FROM_CACHE = 'SET_STATE_FROM_CACHE',
  SET_SOKNAD_TYPE = 'SET_SOKNAD_TYPE',
  SET_SOKNAD = 'SET_SOKNAD',
  UPDATE_SOKNAD = 'UPDATE_SOKNAD',
  SET_CURRENT_STEP = 'SET_CURRENT_STEP',
  ADD_BARN_IF_MISSING = 'ADD_BARN_IF_MISSING',
}
type SetStateFromCache<T> = {
  type: SoknadActionKeys.SET_STATE_FROM_CACHE;
  payload?: GenericSoknadContextState<T>;
};
type SetSoknadType = {
  type: SoknadActionKeys.SET_SOKNAD_TYPE;
  payload?: SøknadType;
};
type SetSoknad<T> = {
  type: SoknadActionKeys.SET_SOKNAD;
  payload?: T;
};
type UpdateSoknad<T> = {
  type: SoknadActionKeys.UPDATE_SOKNAD;
  payload?: Partial<T>;
};
type SetCurrentStep = {
  type: SoknadActionKeys.SET_CURRENT_STEP;
  payload?: string;
};
type AddBarnIfMissing = {
  type: SoknadActionKeys.ADD_BARN_IF_MISSING;
  payload: OppslagBarn[];
};
export type SoknadAction<SoknadStateType> =
  | SetStateFromCache<SoknadStateType>
  | SetSoknadType
  | SetSoknad<SoknadStateType>
  | UpdateSoknad<SoknadStateType>
  | SetCurrentStep
  | AddBarnIfMissing;

export async function hentSoknadState<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>,
  søknadType: SøknadType
) {
  const cachedState: GenericSoknadContextState<SoknadStateType> = await fetch(
    `/aap/soknad-api/buckets/les/${søknadType}`
  ).then((res) => (res.ok ? res.json() : undefined));
  console.log('bucket/les ', cachedState);
  cachedState &&
    dispatch({
      type: SoknadActionKeys.SET_STATE_FROM_CACHE,
      payload: cachedState as GenericSoknadContextState<SoknadStateType>,
    });
  return cachedState;
}

export async function slettLagretSoknadState<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>,
  state: GenericSoknadContextState<SoknadStateType>
) {
  const deleteResponse = await fetch(`/aap/soknad-api/buckets/slett/${state.type}`, {
    method: 'DELETE',
  });
  deleteResponse?.ok &&
    dispatch({
      type: SoknadActionKeys.SET_STATE_FROM_CACHE,
      payload: soknadContextInititalState,
    });
  return !!deleteResponse?.ok;
}

export function updateSøknadData<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>,
  data: Partial<SoknadStateType>
) {
  dispatch({ type: SoknadActionKeys.UPDATE_SOKNAD, payload: data });
}
