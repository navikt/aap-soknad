import React from 'react';
import { Label } from '@navikt/ds-react';
import { useStepWizard } from 'context/stepWizardContextV2';
import * as classes from './StepWizard.module.css';

type StepWizardProps = {
  children?: React.ReactNode;
  hideLabels?: boolean;
};

const StepWizard = ({ children }: StepWizardProps) => {
  const { stepList, currentStepIndex } = useStepWizard();
  return (
    <main className={classes?.stepWizardMain}>
      <div className={classes?.stepIndicatorWrapper}>
        {currentStepIndex != 0 && (
          <Label as={'p'}>{`Steg ${Number.isInteger(currentStepIndex) ? currentStepIndex : 0} av ${
            stepList?.length - 1
          }`}</Label>
        )}
      </div>
      {children}
    </main>
  );
};

export default StepWizard;
