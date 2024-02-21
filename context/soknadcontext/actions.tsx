import { AttachmentType, RequiredVedlegg } from 'types/SoknadContext';
import { Vedlegg } from '@navikt/aap-felles-react';
import { Soknad, SoknadVedlegg } from 'types/Soknad';
import { Dispatch } from 'react';
import { SoknadContextState } from './soknadContext';
import { Barn } from 'pages/api/oppslag/barn';
import { Fastlege } from 'pages/api/oppslag/fastlege';

export enum SoknadActionKeys {
  SET_STATE_FROM_CACHE = 'SET_STATE_FROM_CACHE',
  SET_SOKNAD = 'SET_SOKNAD',
  UPDATE_SOKNAD = 'UPDATE_SOKNAD',
  ADD_BARN_IF_MISSING = 'ADD_BARN_IF_MISSING',
  ADD_FASTLEGE_IF_MISSING = 'ADD_FASTLEGE_IF_MISSING',
  ADD_REQUIRED_VEDLEGG = 'ADD_REQUIRED_VEDLEGG',
  REMOVE_REQUIRED_VEDLEGG = 'REMOVE_REQUIRED_VEDLEGG',
  ADD_SØKNAD_URL = 'ADD_SØKNAD_URL',
  ADD_VEDLEGG = 'ADD_VEDLEGG',
  DELETE_VEDLEGG = 'DELETE_VEDLEGG',
}
type SetStateFromCache = {
  type: SoknadActionKeys.SET_STATE_FROM_CACHE;
  payload?: SoknadContextState;
};
type SetSoknad = {
  type: SoknadActionKeys.SET_SOKNAD;
  payload?: Soknad;
};
type UpdateSoknad = {
  type: SoknadActionKeys.UPDATE_SOKNAD;
  payload?: Partial<Soknad>;
};

type AddBarnIfMissing = {
  type: SoknadActionKeys.ADD_BARN_IF_MISSING;
  payload: Barn[];
};
type AddFastlegeIfMissing = {
  type: SoknadActionKeys.ADD_FASTLEGE_IF_MISSING;
  payload: Fastlege[];
};
type AddRequiredVedlegg = {
  type: SoknadActionKeys.ADD_REQUIRED_VEDLEGG;
  payload: RequiredVedlegg[];
};
type RemoveRequiredVedlegg = {
  type: SoknadActionKeys.REMOVE_REQUIRED_VEDLEGG;
  payload?: AttachmentType;
};
type AddSøknadUrl = {
  type: SoknadActionKeys.ADD_SØKNAD_URL;
  payload: string;
};

type AddVedlegg = {
  type: SoknadActionKeys.ADD_VEDLEGG;
  payload: Vedlegg[];
  key: keyof SoknadVedlegg;
};

type DeleteVedlegg = {
  type: SoknadActionKeys.DELETE_VEDLEGG;
  payload: Vedlegg;
  key: keyof SoknadVedlegg;
};

export type SoknadAction =
  | SetStateFromCache
  | SetSoknad
  | UpdateSoknad
  | AddBarnIfMissing
  | AddFastlegeIfMissing
  | AddRequiredVedlegg
  | RemoveRequiredVedlegg
  | AddSøknadUrl
  | AddVedlegg
  | DeleteVedlegg;

export function setSoknadStateFraProps(
  props: SoknadContextState,
  dispatch: Dispatch<SoknadAction>,
) {
  dispatch({
    type: SoknadActionKeys.SET_STATE_FROM_CACHE,
    payload: props,
  });
  return props;
}

export async function slettLagretSoknadState() {
  const deleteResponse = await fetch(`/aap/soknad/api/mellomlagring/slett`);
  return !!deleteResponse?.ok;
}

export function updateSøknadData(dispatch: Dispatch<SoknadAction>, data: Partial<Soknad>) {
  dispatch({ type: SoknadActionKeys.UPDATE_SOKNAD, payload: data });
}

export function addVedlegg(
  dispatch: Dispatch<SoknadAction>,
  data: Vedlegg[],
  key: keyof SoknadVedlegg,
) {
  dispatch({ type: SoknadActionKeys.ADD_VEDLEGG, payload: data, key });
}

export function deleteVedlegg(
  dispatch: Dispatch<SoknadAction>,
  data: Vedlegg,
  key: keyof SoknadVedlegg,
) {
  dispatch({ type: SoknadActionKeys.DELETE_VEDLEGG, payload: data, key });
}

export async function addRequiredVedlegg(
  vedlegg: RequiredVedlegg[],
  dispatch: Dispatch<SoknadAction>,
) {
  if (vedlegg) dispatch({ type: SoknadActionKeys.ADD_REQUIRED_VEDLEGG, payload: vedlegg });
}

export async function removeRequiredVedlegg(
  vedleggType: AttachmentType,
  dispatch: Dispatch<SoknadAction>,
) {
  if (vedleggType)
    dispatch({ type: SoknadActionKeys.REMOVE_REQUIRED_VEDLEGG, payload: vedleggType });
}
export const addFastlegeIfMissing = (dispatch: Dispatch<SoknadAction>, data: Fastlege[]) => {
  dispatch({ type: SoknadActionKeys.ADD_FASTLEGE_IF_MISSING, payload: data });
};
export const addBarnIfMissing = (dispatch: Dispatch<SoknadAction>, data: Barn[]) => {
  dispatch({ type: SoknadActionKeys.ADD_BARN_IF_MISSING, payload: data });
};

export const getVedleggUuidsFromSoknad = (søknad?: Soknad) => {
  const vedlegg = søknad?.vedlegg;
  return Object.values(vedlegg || {})
    .flat()
    .map((vedlegg) => vedlegg?.vedleggId);
};

export const deleteOpplastedeVedlegg = async (søknad?: Soknad) => {
  const vedleggUuids = getVedleggUuidsFromSoknad(søknad);
  if (vedleggUuids.length > 0) {
    for (const vedlegg of vedleggUuids) {
      await fetch(`/aap/soknad/api/vedlegginnsending/slett/?uuid=${vedlegg}`);
    }
  }
};
