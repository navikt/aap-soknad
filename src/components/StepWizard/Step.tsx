import React, { useContext } from 'react';
// import { StepWizardContext } from '../../context/stepWizardContext';
import { useStepWizard } from '../../context/stepWizardContextV2';

export type StepType = {
  name: string;
  label?: string;
  completed?: boolean;
  active?: boolean;
};
type StepProps = {
  order?: number;
  name?: StepType['name'];
  label?: StepType['label'];
  completed?: StepType['completed'];
  children?: React.ReactNode;
};

const Step = ({ name, children }: StepProps) => {
  // const { currentStep } = useContext(StepWizardContext);
  const { currentStep } = useStepWizard();
  return currentStep?.name === name ? <>{children}</> : null;
};

export default Step;
