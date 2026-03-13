import { RequiredVedlegg, SøknadType } from 'types/SoknadContext';
import { Soknad } from 'types/Soknad';
import { StepType } from 'components/StepWizard/Step';

export interface SoknadContextState {
  version: number;
  type?: SøknadType;
  søknad?: Soknad;
  lagretStepList?: Array<StepType>;
  requiredVedlegg: RequiredVedlegg[];
  sistLagret?: string;
}

export const SOKNAD_VERSION = 1;

export const soknadContextInitialState: SoknadContextState = {
  version: SOKNAD_VERSION,
  søknad: undefined,
  requiredVedlegg: [],
  type: SøknadType.STANDARD,
};
