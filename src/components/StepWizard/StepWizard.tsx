import React, { Children, useEffect } from 'react';
import { BodyShort, StepIndicator } from '@navikt/ds-react';
import { StepType } from './Step';
import { setStepList, setCurrentStepIndex, useStepWizard } from '../../context/stepWizardContextV2';
import * as classes from './StepWizard.module.css';

type OrderedStepType = {
  order: number;
  name: StepType['name'];
  label: StepType['label'];
  completed: StepType['completed'];
};
type StepListType = OrderedStepType[];

type StepWizardProps = {
  children?: React.ReactNode;
  hideLabels?: boolean;
};

const StepWizard = ({ children, hideLabels = false }: StepWizardProps) => {
  const { stepList, currentStepIndex, stepWizardDispatch } = useStepWizard();
  const isNamedStepCompleted = (name: StepType['name']) => {
    const step = stepList.find((e) => e.name === name);
    return !!step?.completed;
  };
  useEffect(() => {
    const newStepList: StepListType = Children.toArray(children).reduce(
      (acc: StepListType, child: any) => {
        const nestedChildren = Array.isArray(child?.props?.children) ? child?.props?.children : [];
        const childAndNestedChildren = [child, ...nestedChildren];
        const steps: StepListType = childAndNestedChildren.reduce(
          (subAcc: StepListType, element: any) =>
            element?.props?.order && element?.props?.name
              ? [
                  ...subAcc,
                  {
                    order: element?.props?.order,
                    name: element?.props?.name,
                    label: element?.props?.label,
                    completed: isNamedStepCompleted(element?.props?.name),
                  },
                ]
              : subAcc,
          []
        );
        return [...acc, ...steps];
      },
      []
    );
    let sortedNewStepList: StepType[] = [...newStepList]
      .sort((a, b) => a.order - b.order)
      .map((e) => ({ name: e?.name, label: e?.label, completed: e?.completed }));
    const activeStep = sortedNewStepList.find((e) => e.active);
    if (!activeStep) {
      sortedNewStepList = [
        {
          ...sortedNewStepList[0],
          active: true,
        },
        ...sortedNewStepList.slice(1),
      ];
    }
    setStepList(sortedNewStepList, stepWizardDispatch);
    // eslint-disable-next-line
  }, []);
  const onStepChange = (stepIndex: number) => {
    if (stepIndex === 0) setCurrentStepIndex(stepIndex, stepWizardDispatch);
    const stepBeforeDestinationStep = stepList[stepIndex - 1];
    if (stepBeforeDestinationStep?.completed) setCurrentStepIndex(stepIndex, stepWizardDispatch);
  };
  return (
    <main className={classes?.stepWizardMain}>
      <StepIndicator
        activeStep={currentStepIndex}
        hideLabels={hideLabels}
        responsive={true}
        onStepChange={onStepChange}
      >
        {stepList.map((step: any) => (
          <StepIndicator.Step
            key={step.name}
            tabIndex={-1}
            children={<BodyShort>{step?.label}</BodyShort>}
          />
        ))}
      </StepIndicator>
      {children}
    </main>
  );
};

export default StepWizard;
