import { StepType } from 'components/StepWizard/Step';
import { SoknadVedlegg } from './Soknad';

export enum SøknadType {
  UTLAND = 'UTLAND',
  STANDARD = 'STANDARD',
}

export type AttachmentType = keyof SoknadVedlegg;

export type RequiredVedlegg = {
  type: AttachmentType;
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
