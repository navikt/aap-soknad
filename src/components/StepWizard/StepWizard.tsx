import React, {Children, useContext, useEffect} from "react";
import {StepWizardContext} from "../../context/stepWizardContext";

export type StepType = {
  name: string;
}

type StepWizardProps = {
  children?: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

const SoknadWizard = ({ children, onSubmit }: StepWizardProps) => {
  const { setStepList, setCurrentStepIndex } = useContext(StepWizardContext);
  const newStepList = Children.toArray(children).reduce((acc: any, child: any) => {
    const nestedChildren = Array.isArray(child?.props?.children) ? child?.props?.children : [];
    const childList = [ child, ...nestedChildren];
    const steps = childList.reduce((subAcc: any, element: any) =>
      element?.props?.order && element?.props?.name
        ? [
          ...subAcc,
          { order: element?.props?.order, name: element?.props?.name}
        ]
        : subAcc, []);
    return [
      ...acc,
      ...steps
    ];
  }, []);
  useEffect(() => {
    // @ts-ignore
    const stepList = newStepList.sort((a: any, b: any) => a.order - b.order).map((e: any) => ({ name: e?.name }));
    setStepList(stepList);
    setCurrentStepIndex(0);
    // eslint-disable-next-line
  }, [])

  return (
    <main className="soknad-wizard-main">
      <form
        onSubmit={onSubmit}
        className="soknad-utland-form"
      >
        {children}
      </form>
    </main>
  );
};

export default SoknadWizard;
