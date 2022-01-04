import React, { useState } from "react";
import SoknadWizard, { StepType } from "../../layouts/SoknadWizard";
import useTexts from "../../hooks/useTexts";
import { bedrift as Texts } from "../../texts/nb.json";
import { Introduction, PersonligInfo, TypeStoette } from "./BedriftSteps";
import { Button, Loader } from "@navikt/ds-react";
import "./Bedrift.less";
import { useForm } from "react-hook-form";
import { Step } from "../../components/Step";
import { yupResolver } from "@hookform/resolvers/yup";
import { getBedriftSchema } from "../../schemas/bedrift";
import { FormErrorSummary } from "../../components/schema/FormErrorSummary";
import { Utdanning } from "./steps/Utdanning";
import { Praksis } from "./steps/Praksis";
import { Etablererstipend } from "./steps/Etablererstipend";

enum StepName {
  INTRODUCTION = "INTRODUCTION",
  TYPE_STOETTE = "TYPE_STOETTE",
  PERSONLIG = "PERSONLIG",
  UTDANNING = "UTDANNING",
  PRAKSIS = "PRAKSIS",
  SOEKT_OM_ETABLERER_STIPEND = 'SOEKT_OM_ETABLERER_STIPEND',
  SUMMARY = "SUMMARY",
  RECEIPT = "RECEIPT",
}

const stepList: StepType[] = [
  { name: StepName.INTRODUCTION },
  { name: StepName.TYPE_STOETTE },
  { name: StepName.PERSONLIG },
  { name: StepName.UTDANNING },
  { name: StepName.PRAKSIS },
  { name: StepName.SOEKT_OM_ETABLERER_STIPEND },
  { name: StepName.SUMMARY },
  { name: StepName.RECEIPT },
];

type FormData = object | undefined;

const getButtonText = (name: string) => {
  switch (name) {
    case StepName.INTRODUCTION:
      return "Fortsett til søknaden";
    case StepName.SUMMARY:
      return "Send søknaden";
    default:
      return "Neste";
  }
};

const Bedrift = (): JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isLoading] = useState<boolean>(false);
  const [, setSoknadData] = useState<FormData>(undefined);
  const { getText } = useTexts("bedrift");
  const bedriftSchema = getBedriftSchema(getText);
  const currentSchema = bedriftSchema[currentStepIndex];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    resolver: yupResolver(currentSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const getStepName = (index: number) => stepList[index]?.name;
  const currentStepNameIs = (name: StepName) =>
    name === getStepName(currentStepIndex);
  const onBackButtonClick = () => setCurrentStepIndex(currentStepIndex - 1);

  const onSubmitClick = async (data: FormData) => {
    if (currentStepNameIs(StepName.SUMMARY)) {
      console.log(data);
    } else {
      setSoknadData({ ...data });
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  return (
    <SoknadWizard
      title={Texts.pageTitle}
      stepList={stepList}
      currentStepIndex={currentStepIndex}
    >
      <>
        <Step renderWhen={currentStepNameIs(StepName.INTRODUCTION)}>
          <Introduction getText={getText} />
        </Step>
        <form
          onSubmit={handleSubmit(async (data) => await onSubmitClick(data))}
          className="soknad-bedrift-form"
        >
          <Step renderWhen={currentStepNameIs(StepName.TYPE_STOETTE)}>
            <TypeStoette
              getText={getText}
              errors={errors}
              register={register}
            />
          </Step>
          <Step renderWhen={currentStepNameIs(StepName.PERSONLIG)}>
            <PersonligInfo
              getText={getText}
              errors={errors}
              register={register}
            />
          </Step>
          <Step renderWhen={currentStepNameIs(StepName.UTDANNING)}>
            <Utdanning
              getText={getText}
              errors={errors.utdanning}
              register={register}
              control={control}
            />
          </Step>
          <Step renderWhen={currentStepNameIs(StepName.PRAKSIS)}>
            <Praksis
              getText={getText}
              register={register}
              errors={errors.praksis}
              control={control}
            />
          </Step>
          <Step renderWhen={currentStepNameIs(StepName.SOEKT_OM_ETABLERER_STIPEND)}>
            <Etablererstipend
              getText={getText}
              register={register}
              errors={errors.etablererstipend}
              getValues={getValues}
            />
          </Step>
          <FormErrorSummary errors={errors} />
          <Button variant="primary" type="submit" disabled={isLoading}>
            {getButtonText(getStepName(currentStepIndex))}
            {isLoading && <Loader />}
          </Button>
        </form>
        {!currentStepNameIs(StepName.INTRODUCTION) &&
          !currentStepNameIs(StepName.RECEIPT) && (
            <Button variant="tertiary" onClick={onBackButtonClick}>
              Tilbake
            </Button>
          )}
      </>
    </SoknadWizard>
  );
};

export { Bedrift };
