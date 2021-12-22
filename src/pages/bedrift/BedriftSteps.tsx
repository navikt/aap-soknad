import {
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

import { GuidePanel, TextField } from "@navikt/ds-react";

import { GetText } from "../../hooks/useTexts";
import { InputRadio, RadioGruppe } from "../../components/input/RadioWrapper";

interface StepType {
  getText: GetText;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

interface IntroductionType {
  getText: GetText;
}

export const Introduction = ({ getText }: IntroductionType) => (
  <GuidePanel poster>{getText("steps.introduction.guideText")}</GuidePanel>
);

export const TypeStoette = ({
  getText,
  errors,
  register,
}: StepType): JSX.Element => {
  const keys = [
    "utviklingsfase",
    "oppstartEtterUtvikling",
    "oppstartUtenUtvikling",
  ];
  const radios = keys.map((key) => (
    <InputRadio
      register={register}
      value={key}
      noekkel={"typeStoette"}
      key={key}
      getText={getText}
    />
  ));
  return (
    <RadioGruppe
      groupKey={"typeStoette"}
      getText={getText}
      error={errors.typeStoette?.message}
    >
      {radios}
    </RadioGruppe>
  );
};

export const PersonligInfo = ({ getText, register }: StepType): JSX.Element => (
  <>
    <TextField
      label={getText("form.personlig.kommune")}
      {...register("kommune")}
      id={"kommune"}
    />
    <TextField
      label={getText("form.personlig.tlfPrivat")}
      type="tel"
      id={"tlfPrivat"}
      {...register("tlfPrivat")}
    />
    <TextField
      label={getText("form.personlig.tlfArbeid")}
      type="tel"
      id={"tlfArbeid"}
      {...register("tlfArbeid")}
    />
  </>
);
