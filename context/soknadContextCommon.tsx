import { GenericSoknadContextState, RequiredVedlegg, SøknadType } from 'types/SoknadContext';
import { Dispatch, ReactNode } from 'react';
import { OppslagBarn } from 'context/sokerOppslagContext';

export interface SoknadContextData<SoknadStateType> {
  søknadState: GenericSoknadContextState<SoknadStateType>;
  søknadDispatch: Dispatch<SoknadAction<SoknadStateType>>;
}
export interface ProviderProps {
  children: ReactNode;
}
export const SØKNAD_CONTEXT_VERSION = 1;

export const soknadContextInititalState = {
  version: SØKNAD_CONTEXT_VERSION,
  type: undefined,
  currentStep: undefined,
  søknad: undefined,
  requiredVedlegg: [],
  søknadUrl: undefined,
};

export enum SoknadActionKeys {
  SET_STATE_FROM_CACHE = 'SET_STATE_FROM_CACHE',
  SET_SOKNAD_TYPE = 'SET_SOKNAD_TYPE',
  SET_SOKNAD = 'SET_SOKNAD',
  UPDATE_SOKNAD = 'UPDATE_SOKNAD',
  SET_CURRENT_STEP = 'SET_CURRENT_STEP',
  ADD_BARN_IF_MISSING = 'ADD_BARN_IF_MISSING',
  ADD_VEDLEGG = 'ADD_VEDLEGG',
  REMOVE_VEDLEGG = 'REMOVE_VEDLEGG',
  ADD_SØKNAD_URL = 'ADD_SØKNAD_URL',
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
type AddVedlegg = {
  type: SoknadActionKeys.ADD_VEDLEGG;
  payload: RequiredVedlegg[];
};
type RemoveVedlegg = {
  type: SoknadActionKeys.REMOVE_VEDLEGG;
  payload?: string;
};
type AddSøknadUrl = {
  type: SoknadActionKeys.ADD_SØKNAD_URL;
  payload: string;
};
export type SoknadAction<SoknadStateType> =
  | SetStateFromCache<SoknadStateType>
  | SetSoknadType
  | SetSoknad<SoknadStateType>
  | UpdateSoknad<SoknadStateType>
  | SetCurrentStep
  | AddBarnIfMissing
  | AddVedlegg
  | RemoveVedlegg
  | AddSøknadUrl;

export async function hentSoknadState<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>,
  søknadType: SøknadType
) {
  return hentSoknadStateMedUrl(dispatch, `/aap/soknad-api/buckets/les/${søknadType}`);
}

export async function hentSoknadStateMedUrl<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>,
  url: string
) {
  const cachedState: GenericSoknadContextState<SoknadStateType> = await fetch(url)
    .then((res) => (res.ok ? res.json() : undefined))
    .catch((err) => console.log('err', err));
  console.log('bucket/les ', cachedState);
  cachedState &&
    dispatch({
      type: SoknadActionKeys.SET_STATE_FROM_CACHE,
      payload: cachedState as GenericSoknadContextState<SoknadStateType>,
    });
  return cachedState;
}

export function setSoknadStateFraProps<SoknadStateType>(
  props: GenericSoknadContextState<SoknadStateType>,
  dispatch: Dispatch<SoknadAction<SoknadStateType>>
) {
  dispatch({
    type: SoknadActionKeys.SET_STATE_FROM_CACHE,
    payload: props,
  });
  return props;
}

export async function slettLagretSoknadState<SoknadStateType>(
  dispatch: Dispatch<SoknadAction<SoknadStateType>>,
  state: GenericSoknadContextState<SoknadStateType>
) {
  const deleteResponse = await fetch(
    `${process.env.NEXT_PUBLIC_TEMP_SLETT_URL ?? '/aap/soknad-api/buckets/slett/'}${state.type}`,
    {
      method: 'DELETE',
    }
  );
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

export async function addRequiredVedlegg<SoknadStateType>(
  vedlegg: RequiredVedlegg[],
  dispatch: Dispatch<SoknadAction<SoknadStateType>>
) {
  if (vedlegg) dispatch({ type: SoknadActionKeys.ADD_VEDLEGG, payload: vedlegg });
}

export async function removeRequiredVedlegg<SoknadStateType>(
  vedleggType: string,
  dispatch: Dispatch<SoknadAction<SoknadStateType>>
) {
  if (vedleggType) dispatch({ type: SoknadActionKeys.REMOVE_VEDLEGG, payload: vedleggType });
}
