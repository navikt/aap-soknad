import React, { useState } from "react";

import { Alert, Button, GuidePanel, Loader } from "@navikt/ds-react";
import { fetchPOST } from "../../api/useFetch";
import { useTexts } from "../../hooks/useTexts";
import SoknadWizard, { StepType } from "../../layouts/SoknadWizard";
import { Step } from "../../components/Step";
import { RenderWhen } from "../../components/RenderWhen";

import * as tekster from "./tekster";

enum StepName {
  INTRODUCTION = "INTRODUCTION",
  RECEIPT = "RECEIPT",
}

const stepList: StepType[] = [
  { name: StepName.INTRODUCTION },
  { name: StepName.RECEIPT },
];

const Hovedsøknad = (): JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [innsendingFeil, setInnsendingFeil] = useState<boolean>(false);
  const [senderMelding, setSenderMelding] = useState<boolean>(false);

  const sendSøknad = async () => {
    setSenderMelding(true);
    const res = await fetchPOST("/aap/soknad-api/innsending/soknad", {});
    if (!res.ok) {
      setSenderMelding(false);
      setInnsendingFeil(true);
    }
    if (res.ok) {
      if (innsendingFeil) {
        setInnsendingFeil(false);
        setSenderMelding(false);
      }
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const { getText } = useTexts(tekster);
  const getStepName = (index: number) => stepList[index]?.name;
  const currentStepNameIs = (name: StepName) =>
    name === getStepName(currentStepIndex);

  return (
    <SoknadWizard
      title={getText("pageTitle")}
      stepList={stepList}
      currentStepIndex={currentStepIndex}
    >
      <Step renderWhen={currentStepNameIs(StepName.INTRODUCTION)}>
        <>
          <GuidePanel poster>
            {getText("steps.introduction.guideText")}
          </GuidePanel>
          <Button
            variant="primary"
            type="submit"
            onClick={sendSøknad}
            disabled={senderMelding}
          >
            Søk AAP
            {senderMelding && <Loader />}
          </Button>
        </>
      </Step>
      <Step renderWhen={currentStepNameIs(StepName.RECEIPT)}>
        <GuidePanel>{getText("steps.kvittering")}</GuidePanel>
      </Step>
      <RenderWhen when={innsendingFeil}>
        <Alert variant={"error"}>{getText("innsending.feil")}</Alert>
      </RenderWhen>
    </SoknadWizard>
  );
};

export { Hovedsøknad };
