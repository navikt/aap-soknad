import { StepType } from 'components/StepWizard/Step';
import { SoknadVedlegg } from './Soknad';

export enum SøknadType {
  STANDARD = 'STANDARD',
}

export type AttachmentType = keyof SoknadVedlegg;

export type RequiredVedlegg = {
  type: AttachmentType;
  description: string;
  filterType?: string;
  completed?: boolean;
};
