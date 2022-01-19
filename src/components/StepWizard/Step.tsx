import React, {useContext} from "react";
import {StepWizardContext} from "../../context/stepWizardContext";
import {Button} from "@navikt/ds-react";


type StepProps = {
  order?: number;
  name?: string;
  children?: React.ReactNode;
};

const Step = ({ name, children}: StepProps) => {
  const { currentStep, goToPreviousStep} = useContext(StepWizardContext);
  return currentStep?.name === name
    ? <>
      {children}
      <Button variant="primary" type="submit" >Neste</Button>
      <Button variant="tertiary" onClick={goToPreviousStep}>
        Tilbake
      </Button>
    </>
    : null;
};

export default Step;
