import React from 'react';
import { render, screen, fireEvent, findAllByRole, queryAllByRole } from '@testing-library/react';
import useTexts from '../../../hooks/useTexts';
import * as tekster from '../tekster';
import { JaEllerNei, JaNeiVetIkke } from '../../../types/Generic';
import StartDato from './StartDato';
import { StepWizardContext, StepWizardContextState } from '../../../context/stepWizardContextV2';
import { Step, StepWizard } from '../../../components/StepWizard';

const STARTDATO = 'STARTDATO';
const wizardContext: StepWizardContextState = {
  stepList: [{ name: STARTDATO }],
  currentStep: { name: STARTDATO },
  currentStepIndex: 0,
  stepWizardDispatch: () => ({}),
};

const renderWithContext = (ui: any, { ...renderOptions }: any) => {
  return render(
    <StepWizardContext.Provider value={{ ...wizardContext }}>{ui}</StepWizardContext.Provider>,
    renderOptions
  );
};
describe('StartDato', () => {
  const Component = () => {
    const { getText } = useTexts(tekster);
    return (
      <StepWizard>
        <Step name={STARTDATO} label={''}>
          <StartDato getText={getText} onBackClick={jest.fn()} onCancelClick={jest.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Feil utfylt', async () => {
    renderWithContext(<Component />, {});

    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('region');

    expect(await findAllByRole(errorSummary, 'link')).toHaveLength(2);
  });
  it('Riktig utfylt - enkleste vei', async () => {
    renderWithContext(<Component />, {});

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: '10.02.1990',
      },
    });
    fireEvent.click(screen.getByRole('radio', { name: JaNeiVetIkke.NEI }), {});
    expect(await screen.queryByRole('region')).toBeNull();
  });
});
