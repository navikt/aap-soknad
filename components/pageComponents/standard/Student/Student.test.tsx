import { StepWizardContext, StepWizardContextState } from 'context/stepWizardContextV2';
import { findAllByRole, fireEvent, render, screen } from 'setupTests';
import { Step, StepWizard } from 'components/StepWizard';
import { JaNeiVetIkke } from 'types/Generic';
import React from 'react';
import Student from './Student';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SoknadContextData } from 'context/soknadContextCommon';
import { Soknad } from 'types/Soknad';
import { SøknadType } from 'types/SoknadContext';
import { SoknadContextStandard } from 'context/soknadContextStandard';
import { AppStateContext, AppStateContextState } from 'context/appStateContext';
expect.extend(toHaveNoViolations);

const STUDENT = 'student';

const soknadContext: SoknadContextData<Soknad> = {
  søknadState: {
    version: 1,
    type: SøknadType.STANDARD,
    requiredVedlegg: [],
  },
  søknadDispatch: () => console.log('dispatch'),
};
const wizardContext: StepWizardContextState = {
  stepList: [{ name: STUDENT }],
  currentStep: { name: STUDENT },
  currentStepIndex: 0,
  stepWizardDispatch: () => ({}),
};
const appContext: AppStateContextState = {
  appState: {
    sistLagret: 'i dag',
  },
  appStateDispatch: () => console.log('dispatch'),
};

const renderWithContext = (ui: any, { ...renderOptions }: any) => {
  return render(
    <AppStateContext.Provider value={{ ...appContext }}>
      <SoknadContextStandard.Provider value={{ ...soknadContext }}>
        <StepWizardContext.Provider value={{ ...wizardContext }}>{ui}</StepWizardContext.Provider>,
      </SoknadContextStandard.Provider>
    </AppStateContext.Provider>,
    renderOptions
  );
};
describe('Student', () => {
  window.HTMLElement.prototype.scrollIntoView = function () {};
  const Component = () => {
    return (
      <StepWizard>
        <Step name={STUDENT}>
          <Student onBackClick={jest.fn()} onNext={jest.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Feil utfylt', async () => {
    renderWithContext(<Component />, {});

    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');

    expect(await findAllByRole(errorSummary, 'link')).toHaveLength(1);
  });
  it('Riktig utfylt - enkleste vei', async () => {
    renderWithContext(<Component />, {});
    fireEvent.click(screen.getByRole('radio', { name: JaNeiVetIkke.NEI }), {});
    expect(await screen.queryByRole('region')).toBeNull();
  });
  it('UU', async () => {
    const { container } = renderWithContext(<Component />, {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
