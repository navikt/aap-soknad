import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

import { Cell, ContentContainer, Grid, GuidePanel, TextField } from "@navikt/ds-react";

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

export const PersonligInfo = ({ getText, register, errors }: StepType): JSX.Element => (
  <ContentContainer>
    <Grid>
      <Cell xs={6}>
        <TextField
          label={getText("form.personlig.kommune")}
          {...register("kommune")}
          id={"kommune"}
        />
      </Cell>
    </Grid>
    <Grid>
      <Cell xs={4}>
        <TextField
          label={getText("form.personlig.tlfPrivat")}
          type="tel"
          id={"tlfPrivat"}
          autoComplete={"tel"}
          error={errors.tlfPrivat?.message}
          {...register("tlfPrivat")}
        />
      </Cell>
    </Grid>
    <Grid>
      <Cell xs={4}>
        <TextField
          label={getText("form.personlig.tlfArbeid")}
          type="tel"
          id={"tlfArbeid"}
          {...register("tlfArbeid")}
        />
      </Cell>
    </Grid>
  </ContentContainer>
);
