import React, {Children, useContext, useEffect} from "react";
import {BodyShort, StepIndicator} from '@navikt/ds-react';
import {StepType} from "./Step";
import {StepWizardContext} from "../../context/stepWizardContext";

type OrderedStepType = {
  order: number;
  name: StepType["name"];
  label: StepType["label"];
}
type StepListType = OrderedStepType[];

type StepWizardProps = {
  children?: React.ReactNode;
  hideLabels?: boolean;
};

const StepWizard = ({ children, hideLabels = false}: StepWizardProps) => {
  const { stepList, setStepList, currentStepIndex, setCurrentStepIndex } = useContext(StepWizardContext);
  useEffect(() => {
    const newStepList: StepListType = Children.toArray(children).reduce((acc: StepListType, child: any) => {
      const nestedChildren = Array.isArray(child?.props?.children) ? child?.props?.children : [];
      const childAndNestedChildren = [ child, ...nestedChildren];
      const steps: StepListType = childAndNestedChildren.reduce((subAcc: StepListType, element: any) =>
        element?.props?.order && element?.props?.name
          ? [
            ...subAcc,
            { order: element?.props?.order,
              name: element?.props?.name,
              label: element?.props?.label}
          ]
          : subAcc, []);
      return [
        ...acc,
        ...steps
      ];
    }, []);
    const sortedNewStepList: StepType[] = [...newStepList]
      .sort((a, b) => a.order - b.order)
      .map((e) => ({ name: e?.name, label: e?.label }));
    setStepList(sortedNewStepList);
    setCurrentStepIndex(0);
    // eslint-disable-next-line
  }, [])
  const onStepChange = (stepIndex: number) => {
    if(stepIndex === 0) setCurrentStepIndex(stepIndex);
   const stepBeforeDestinationStep = stepList[stepIndex - 1];
   if(stepBeforeDestinationStep?.completed)
     setCurrentStepIndex(stepIndex);
  }
  return (
    <main className="soknad-wizard-main">
      <StepIndicator activeStep={currentStepIndex} hideLabels={hideLabels} responsive={true} onStepChange={onStepChange}>
        {stepList.map((step: any) => <StepIndicator.Step key={step.name} children={<BodyShort>{step?.label}</BodyShort>} />)}
      </StepIndicator>
      {children}
    </main>
  );
};

export default StepWizard;
