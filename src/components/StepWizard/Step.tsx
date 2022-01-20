import React, {useContext} from "react";
import {StepWizardContext} from "../../context/stepWizardContext";

export type StepType = {
  name: string;
  label?: string;
  completed?: boolean;
};
type StepProps = {
  order?: number;
  name?: StepType["name"];
  label?: StepType["label"];
  completed?: StepType["completed"];
  children?: React.ReactNode;
};

const Step = ({ name, children}: StepProps) => {
  const { currentStep} = useContext(StepWizardContext);
  return currentStep?.name === name
    ? <>
      {children}
    </>
    : null;
};

export default Step;
