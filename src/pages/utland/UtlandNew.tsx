import {Button, BodyShort} from "@navikt/ds-react";
import { StepWizard, Step } from '../../components/StepWizard';
import React from "react";


const UtlandNew = (): JSX.Element => {
  return (
    <StepWizard>
      <Step order={1} name='INTRODUCTION'>
        <BodyShort>{'intro'}</BodyShort>
      </Step>
      <Step order={2} name='FIRST'>
        <BodyShort>{'First Step'}</BodyShort>
      </Step>
      <Step order={3} name='LAST'>
        <BodyShort>{'Last Step'}</BodyShort>
      </Step>
      <Button variant="tertiary" onClick={() => console.log('go back')}>
        Tilbake
      </Button>
    </StepWizard>
  );
};

export default UtlandNew;
