import { StepWizardContext, StepWizardContextState } from '../../../context/stepWizardContextV2';
import { findAllByRole, fireEvent, render, screen } from '@testing-library/react';
import useTexts from '../../../hooks/useTexts';
import * as tekster from '../tekster';
import { Step, StepWizard } from '../../../components/StepWizard';
import { JaNeiVetIkke } from '../../../types/Generic';
import React from 'react';
import { SoknadContext, SoknadContextData, SøknadType } from '../../../context/soknadContext';
import Student from './Student';

const STUDENT = 'student';

const soknadContext: SoknadContextData = {
  søknadState: {
    version: 1,
    type: SøknadType.HOVED,
  },
  søknadDispatch: () => console.log('dispatch'),
};
const wizardContext: StepWizardContextState = {
  stepList: [{ name: STUDENT }],
  currentStep: { name: STUDENT },
  currentStepIndex: 0,
  stepWizardDispatch: () => ({}),
};

const renderWithContext = (ui: any, { ...renderOptions }: any) => {
  return render(
    <SoknadContext.Provider value={{ ...soknadContext }}>
      <StepWizardContext.Provider value={{ ...wizardContext }}>{ui}</StepWizardContext.Provider>,
    </SoknadContext.Provider>,
    renderOptions
  );
};
describe('Yrkesskade', () => {
  const Component = () => {
    const { getText } = useTexts(tekster);
    return (
      <StepWizard>
        <Step name={STUDENT} label={''}>
          <Student getText={getText} onBackClick={jest.fn()} onCancelClick={jest.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Feil utfylt', async () => {
    renderWithContext(<Component />, {});

    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('region');

    expect(await findAllByRole(errorSummary, 'link')).toHaveLength(1);
  });
  it('Riktig utfylt - enkleste vei', async () => {
    renderWithContext(<Component />, {});
    fireEvent.click(screen.getByRole('radio', { name: JaNeiVetIkke.NEI }), {});
    expect(await screen.queryByRole('region')).toBeNull();
  });
});
