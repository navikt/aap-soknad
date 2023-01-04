import { StepType } from 'components/StepWizard/Step';

export enum SøknadType {
  UTLAND = 'UTLAND',
  STANDARD = 'STANDARD',
}

export type RequiredVedlegg = {
  type: string;
  description: string;
  filterType?: string;
  completed?: boolean;
};
export interface GenericSoknadContextState<SoknadStateType> {
  version: number;
  type?: SøknadType;
  søknad?: SoknadStateType;
  lagretStepList?: Array<StepType>;
  requiredVedlegg: RequiredVedlegg[];
  søknadUrl?: string;
  sistLagret?: string;
}
