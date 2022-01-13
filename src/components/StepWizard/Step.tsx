import React, {useContext} from "react";
import {StepWizardContext} from "../../context/stepWizardContext";
import {Button} from "@navikt/ds-react";


type StepProps = {
  order?: number;
  name?: string;
  isForm?: boolean;
  children?: React.ReactNode;
};

type StepWrapperProps = {
  isForm?: boolean;
  children?: React.ReactNode;
};
const StepWrapper = ({ isForm, children }: StepWrapperProps) => {
  return isForm
    ? <form>
      {children}
    </form>
    : <> {children} </>
}
const Step = ({ name, isForm = false, children}: StepProps) => {
  const { currentStep, goToNextStep} = useContext(StepWizardContext);
  return currentStep?.name === name
    ? <StepWrapper isForm={isForm}>
      {children}
      <Button variant="tertiary" onClick={goToNextStep}>Neste</Button>
    </StepWrapper>
    : null;
};

export default Step;
