import React from 'react';
import { useStepWizard } from '../../context/stepWizardContextV2';

export type StepType = {
  stepIndex?: number;
  name: string;
  completed?: boolean;
  active?: boolean;
};
type StepProps = {
  order?: number;
  name?: StepType['name'];
  completed?: StepType['completed'];
  children?: React.ReactNode;
};

const Step = ({ name, children }: StepProps) => {
  const { currentStep } = useStepWizard();
  return currentStep?.name === name ? <>{children}</> : null;
};

export default Step;
