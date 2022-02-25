import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Step, StepWizard } from './index';
import { StepWizardContext, StepWizardContextData } from '../../context/stepWizardContext';
import { SoknadContext, SoknadContextData, SøknadType } from '../../context/soknadContext';
import { BodyShort } from '@navikt/ds-react';

// SET UP DUMMY DATA FOR CONTEXT
enum stepNames {
  STEP_ONE = 'STEP_ONE',
  STEP_TWO = 'STEP_TWO',
  STEP_THREE = 'STEP_THREE',
}
const soknadContext: SoknadContextData = {
  søknadState: {
    version: 1,
    type: SøknadType.UTLAND,
  },
  søknadDispatch: () => console.log('dispatch'),
};
const wizardContext: StepWizardContextData = {
  currentStepIndex: 0,
  stepList: [
    { name: stepNames.STEP_ONE },
    { name: stepNames.STEP_TWO },
    { name: stepNames.STEP_THREE },
  ],
  setStepList: () => console.log('setStepList'),
  setCurrentStepIndex: () => console.log('setStepList'),
  goToNamedStep: (name: string) => console.log('gotonamedstep', name),
  goToNextStep: () => console.log('gotonextstep'),
  goToPreviousStep: () => console.log('gotoprevioousstep'),
  currentStep: { name: stepNames.STEP_ONE },
  setNamedStepCompleted: (name: string) => console.log('setNamedstepcompleted', name),
  resetStepWizard: () => console.log('resetstepwizard'),
  completeAndGoToNextStep: () => console.log('completeandgotonextstep'),
};

const renderWithContext = (ui: any, { ...renderOptions }: any) => {
  return render(
    <SoknadContext.Provider value={{ ...soknadContext }}>
      <StepWizardContext.Provider value={{ ...wizardContext }}>{ui}</StepWizardContext.Provider>,
    </SoknadContext.Provider>,
    renderOptions
  );
};
const MyWizard = () => (
  <StepWizard>
    <Step name={stepNames.STEP_ONE} label={stepNames.STEP_ONE}>
      <BodyShort>{stepNames.STEP_ONE}</BodyShort>
    </Step>
    <Step name={stepNames.STEP_TWO} label={stepNames.STEP_TWO}>
      <BodyShort>{stepNames.STEP_TWO}</BodyShort>
    </Step>
    <Step name={stepNames.STEP_THREE} label={stepNames.STEP_THREE}>
      <BodyShort>{stepNames.STEP_THREE}</BodyShort>
    </Step>
  </StepWizard>
);

const server = setupServer(
  rest.get('/aap/soknad-api/buckets/lagre/UTLAND', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post('/aap/soknad-api/buckets/les/UTLAND', (req, res, ctx) => {
    return res(ctx.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

expect.extend(toHaveNoViolations);

describe('StepWizard', () => {
  it('render StepWizard med steg', () => {
    renderWithContext(<MyWizard />, {});
    expect(screen.getByText(stepNames.STEP_ONE)).toBeDefined();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('uu-sjekk', async () => {
    const { container } = renderWithContext(<MyWizard />, {});
    const res = await axe(container);

    expect(res).toHaveNoViolations();
  });
});
