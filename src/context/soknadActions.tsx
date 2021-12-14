export enum SoknadActionKeys {
  SET_SOKNAD = 'SET_SOKNAD'
}
type SetFormData = {
  type: SoknadActionKeys.SET_SOKNAD;
  payload?: any
}
export type SoknadAction =
  | SetFormData;
