import React, {createContext, Dispatch, ReactNode} from "react";
import useSteps from "../hooks/useSteps";
import {StepType} from "../components/StepWizard/Step";
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
  setNamedStepCompleted: (name: string) => void;
  resetStepWizard: () => void;
}

export const StepWizardContext = createContext<StepWizardContextData>(null!);


export const StepWizardContextProvider = ({ children }: Props) => {
  const {stepList, setStepList, currentStepIndex, setCurrentStepIndex, goToNamedStep, goToNextStep, goToPreviousStep, nextStep, currentStep, setNamedStepCompleted} = useSteps([]);
  const resetStepWizard = () => {
    setStepList(stepList.map(step => ({...step, completed: false})));
    setCurrentStepIndex(0);
  }
  return (
    <StepWizardContext.Provider value={{stepList, setStepList, currentStepIndex, setCurrentStepIndex, goToNamedStep, goToNextStep, goToPreviousStep, nextStep, currentStep, setNamedStepCompleted, resetStepWizard}} >
      {children}
    </StepWizardContext.Provider>
  )
};
