import React, { useState } from 'react';

import { Alert, Button, GuidePanel, Loader, PageHeader } from '@navikt/ds-react';
import { fetchPOST } from '../../api/fetch';
import { useTexts } from '../../hooks/useTexts';
import { StepWizard, Step } from '../../components/StepWizard';

import * as tekster from './tekster';
import { completeAndGoToNextStep, useStepWizard } from '../../context/stepWizardContextV2';

enum StepName {
  INTRODUCTION = 'INTRODUCTION',
  RECEIPT = 'RECEIPT',
}

const Hovedsoknad = (): JSX.Element => {
  const { stepWizardDispatch } = useStepWizard();
  const [innsendingFeil, setInnsendingFeil] = useState<boolean>(false);
  const [senderMelding, setSenderMelding] = useState<boolean>(false);

  const sendSøknad = async () => {
    setSenderMelding(true);
    const res = await fetchPOST('/aap/soknad-api/innsending/soknad', {});
    if (!res.ok) {
      setSenderMelding(false);
      setInnsendingFeil(true);
    }
    if (res.ok) {
      if (innsendingFeil) {
        setInnsendingFeil(false);
        setSenderMelding(false);
      }
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };

  const { getText } = useTexts(tekster);

  return (
    <>
      <PageHeader>{getText('pageTitle')}</PageHeader>
      <StepWizard>
        <Step order={1} name={StepName.INTRODUCTION}>
          <>
            <GuidePanel poster>{getText('steps.introduction.guideText')}</GuidePanel>
            <Button variant="primary" type="submit" onClick={sendSøknad} disabled={senderMelding}>
              Søk AAP
              {senderMelding && <Loader />}
            </Button>
          </>
        </Step>
        <Step order={2} name={StepName.RECEIPT}>
          <GuidePanel>{getText('steps.kvittering')}</GuidePanel>
        </Step>
        {innsendingFeil && <Alert variant={'error'}>{getText('innsending.feil')}</Alert>}
      </StepWizard>
    </>
  );
};

export { Hovedsoknad };
