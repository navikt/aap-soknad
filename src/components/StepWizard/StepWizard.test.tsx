import {findAllByRole, render, screen} from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Step, StepWizard } from './index';
import {StepWizardContext, StepWizardContextData, StepWizardContextProvider} from "../../context/stepWizardContext";
import {SoknadContext, SoknadContextProvider} from "../../context/soknadContext";
import {BodyShort} from "@navikt/ds-react";
import {Dispatch, useContext} from "react";
import {StepType} from "./Step";

enum stepNames {
  STEP_ONE = 'STEP_ONE',
  STEP_TWO = 'STEP_TWO',
  STEP_THREE = 'STEP_THREE',
};
const renderWithWizardContext = (ui: any, {providerProps, ...renderOptions}: any) => {
  return render(
    <StepWizardContext.Provider {...providerProps}>{ui}</StepWizardContext.Provider>,
    renderOptions,
  )
}
const wizardContext: StepWizardContextData = {
  currentStepIndex: 0,
  stepList: [{name: stepNames.STEP_ONE}],
  setStepList: () => console.log('setStepList'),
  setCurrentStepIndex: () => console.log('setStepList'),
  goToNamedStep: (name: string) => console.log('gotonamedstep', name),
  goToNextStep: () => console.log('gotonextstep'),
  goToPreviousStep: () => console.log('gotoprevioousstep'),
  currentStep: { name: stepNames.STEP_ONE},
  setNamedStepCompleted: (name: string) => console.log('setNamedstepcompleted', name),
  resetStepWizard: () => console.log('resetstepwizard')

}

const renderWithSoknadContext = (ui: any, {providerProps, ...renderOptions}: any) => {
  return render(
    <SoknadContext.Provider{...providerProps}>{ui}</SoknadContext.Provider>,
  renderOptions,
)
}
const renderWithContext = (ui: any, {providerProps, ...renderOptions}: any) => {
  // return renderWithSoknadContext(renderWithWizardContext(ui, {providerProps: wizardContext}), {providerProps: {} })
  return render(
    <SoknadContext.Provider{...providerProps}>
      <StepWizardContext.Provider value={{...wizardContext}}>{ui}</StepWizardContext.Provider>,
    </SoknadContext.Provider>,
    renderOptions,
  )
}
const MyWizard = () => <StepWizard>
  <Step name={stepNames.STEP_ONE} label={stepNames.STEP_ONE}><BodyShort>{stepNames.STEP_ONE}</BodyShort></Step>
  <Step name={stepNames.STEP_TWO} label={stepNames.STEP_TWO}><BodyShort>{stepNames.STEP_TWO}</BodyShort></Step>
  <Step name={stepNames.STEP_THREE} label={stepNames.STEP_THREE}><BodyShort>{stepNames.STEP_THREE}</BodyShort></Step>
</StepWizard>;

expect.extend(toHaveNoViolations);

describe("StepWizard", () => {

  it("placeholder", () => {
    expect(true).toBe(true);
  });

  it("render StepWizard med steg", () => {
    // render(<SoknadContextProvider>
    //   <StepWizardContextProvider>
    //     <MyWizard />
    //   </StepWizardContextProvider>
    // </SoknadContextProvider>);
    renderWithContext(<MyWizard />, {})
    expect(screen.getAllByText(stepNames.STEP_ONE)).toBe(stepNames.STEP_ONE);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  // it("uu-sjekk", async () => {
  //   const { container } = renderWithContext(<MyWizard />, {});
  //   const res = await axe(container);
  //
  //   expect(res).toHaveNoViolations();
  // });
});
