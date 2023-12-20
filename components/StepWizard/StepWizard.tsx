import React from 'react';
import { Label } from '@navikt/ds-react';
import { useStepWizard } from 'hooks/StepWizardHook';
import * as classes from './StepWizard.module.css';

type StepWizardProps = {
  children?: React.ReactNode;
  hideLabels?: boolean;
};

const StepWizard = ({ children }: StepWizardProps) => {
  const { stepList, currentStepIndex } = useStepWizard();
  return (
    <>
      <div className={classes?.stepIndicatorWrapper}>
        <Label as={'p'}>{`Steg ${
          Number.isInteger(currentStepIndex) ? currentStepIndex + 1 : 0
        } av ${stepList?.length}`}</Label>
      </div>
      {children}
    </>
  );
};

export default StepWizard;
