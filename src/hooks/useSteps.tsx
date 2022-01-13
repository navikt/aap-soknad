import {useCallback, useMemo, useState} from 'react';
import {StepType} from "../layouts/SoknadWizard";

const useModal = (initalStepList: StepType[]) => {
  const [stepList, setStepList] = useState<StepType[]>(initalStepList);
  const indexIsLegal = useCallback((index: number) => index > -1 && index < stepList.length, [stepList]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = useMemo(() => stepList[currentStepIndex], [currentStepIndex, stepList])
  const nextStep = useMemo(() => {
    const nextIndex = currentStepIndex + 1;
    if(indexIsLegal(nextIndex)) return stepList[nextIndex]
  }, [currentStepIndex, stepList, indexIsLegal])

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if(indexIsLegal(nextIndex)) setCurrentStepIndex(nextIndex);
  }, [currentStepIndex, setCurrentStepIndex, indexIsLegal]);
  const goToPreviousStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if(indexIsLegal(prevIndex)) setCurrentStepIndex(prevIndex);
  }, [currentStepIndex, setCurrentStepIndex, indexIsLegal]);
  const goToNamedStep = useCallback((name: string) => {
    const stepIndex = stepList.findIndex(step =>
      step?.name === name
    );
    if(indexIsLegal(stepIndex)) setCurrentStepIndex(stepIndex);
  }, [stepList, setCurrentStepIndex, indexIsLegal]);
  const goToStep = useCallback((index: number) => {
    if(indexIsLegal(index)) setCurrentStepIndex(index);
  }, [setCurrentStepIndex, indexIsLegal]);

  return { stepList, setStepList, currentStepIndex, setCurrentStepIndex, currentStep, nextStep, goToNextStep, goToPreviousStep, goToNamedStep, goToStep}
}

export default useModal;