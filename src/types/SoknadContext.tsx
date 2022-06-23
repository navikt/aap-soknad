import { StepType } from '../components/StepWizard/Step';

export enum SøknadType {
  UTLAND = 'UTLAND',
  HOVED = 'HOVED',
}
export interface GenericSoknadContextState<SoknadStateType> {
  version: number;
  type?: SøknadType;
  søknad?: SoknadStateType;
  lagretStepList?: Array<StepType>;
}
