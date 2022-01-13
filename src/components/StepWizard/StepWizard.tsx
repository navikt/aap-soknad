import React, {Children, useContext, useEffect} from "react";
import {StepWizardContext} from "../../context/stepWizardContext";

export type StepType = {
  name: string;
}

type StepWizardProps = {
  children?: React.ReactNode;
};

const SoknadWizard = ({ children}: StepWizardProps) => {
  const { setStepList, setCurrentStepIndex } = useContext(StepWizardContext);
  const newStepList = Children.toArray(children).reduce((acc: any, child: any) => {
    return child?.props?.order && child?.props?.name
     ? [
        ...acc,
        { order: child?.props?.order, name: child?.props?.name}
        ]
      : acc;
  }, []);
  useEffect(() => {
    const stepList = newStepList.sort((a: any, b: any) => a.order - b.order).map((e: any) => ({ name: e?.name }));
    setStepList(stepList);
    setCurrentStepIndex(0);
    // eslint-disable-next-line
  }, [])

  return (
    <main className="soknad-wizard-main">{children}</main>
  );
};

export default SoknadWizard;
