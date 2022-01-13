import React, {createContext, Dispatch, ReactNode} from "react";
import useSteps from "../hooks/useSteps";
import {StepType} from "../layouts/SoknadWizard";
export enum SøknadType {
  UTLAND = 'UTLAND',
}

interface Props {
  children: ReactNode;
}
interface StepWizardContextData {
  stepList: StepType[];
  setStepList: Dispatch<Array<StepType>>;
  currentStepIndex: number;
  setCurrentStepIndex: Dispatch<number>;
  goToNamedStep: (name: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  nextStep?: StepType;
  currentStep: StepType;
}

export const StepWizardContext = createContext<StepWizardContextData>(null!);


export const StepWizardContextProvider = ({ children }: Props) => {
  const {stepList, setStepList, currentStepIndex, setCurrentStepIndex, goToNamedStep, goToNextStep, goToPreviousStep, nextStep, currentStep} = useSteps([]);
  return (
    <StepWizardContext.Provider value={{stepList, setStepList, currentStepIndex, setCurrentStepIndex, goToNamedStep, goToNextStep, goToPreviousStep, nextStep, currentStep}} >
      {children}
    </StepWizardContext.Provider>
  )
};
