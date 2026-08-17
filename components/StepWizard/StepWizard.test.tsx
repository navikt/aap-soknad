import { render, screen } from '@testing-library/react';
import { Step, StepWizard } from './index';
import { StepWizardContext, StepWizardContextState } from 'context/stepWizardContext';
import { BodyShort } from '@navikt/ds-react';
import { describe, expect, it } from 'vitest';

import { axe } from 'vitest-axe';

// SET UP DUMMY DATA FOR CONTEXT
enum stepNames {
  STEP_ONE = 'STEP_ONE',
  STEP_TWO = 'STEP_TWO',
  STEP_THREE = 'STEP_THREE',
}
const wizardContext: StepWizardContextState = {
  stepList: [
    { name: stepNames.STEP_ONE, active: true },
    { name: stepNames.STEP_TWO },
    { name: stepNames.STEP_THREE },
  ],
  currentStep: { name: stepNames.STEP_ONE },
  currentStepIndex: 0,
  stepWizardDispatch: () => ({}),
};

const renderWithContext = (ui: any, { ...renderOptions }: any) => {
  return render(
    <StepWizardContext.Provider value={{ ...wizardContext }}>{ui}</StepWizardContext.Provider>,
    renderOptions,
  );
};
const MyWizard = () => (
  <StepWizard>
    <Step name={stepNames.STEP_ONE}>
      <BodyShort>{stepNames.STEP_ONE}</BodyShort>
    </Step>
    <Step name={stepNames.STEP_TWO}>
      <BodyShort>{stepNames.STEP_TWO}</BodyShort>
    </Step>
    <Step name={stepNames.STEP_THREE}>
      <BodyShort>{stepNames.STEP_THREE}</BodyShort>
    </Step>
  </StepWizard>
);

describe('StepWizard', () => {
  it('render StepWizard med steg', () => {
    renderWithContext(<MyWizard />, {});
    expect(screen.getByText(stepNames.STEP_ONE)).toBeDefined();
  });

  it('uu-sjekk', async () => {
    const { container } = renderWithContext(<MyWizard />, {});
    const res = await axe(container);
    // @ts-expect-error Det er noe med extend som ikke fungerer helt. TS er misfornøyd men koden kjører
    expect(res).toHaveNoViolations();
  });
});
