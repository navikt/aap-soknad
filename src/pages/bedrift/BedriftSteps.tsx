import { Cell, Grid, GuidePanel, TextField } from "@navikt/ds-react";
import { GetText } from "../../hooks/useTexts";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { InputRadio, RadioGruppe } from "../../components/input/RadioWrapper";

interface StepProps {
  getText: GetText;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

interface IntroductionProps {
  getText: GetText;
}

export const Introduction = ({ getText }: IntroductionProps) => (
  <GuidePanel poster>{getText("steps.introduction.guideText")}</GuidePanel>
);

export const TypeStoette = ({
  getText,
  errors,
  register,
}: StepProps): JSX.Element => {
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

export const PersonligInfo = ({
  getText,
  register,
}: StepProps): JSX.Element => (
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

export const Utdanning = ({ getText, register }: StepProps): JSX.Element => (
  <>
    <GuidePanel poster>{getText("steps.introduction.guideText")}</GuidePanel>
    <Grid>
      <Cell xs={8}>
        <TextField
          label={getText("form.utdanning.institusjonsnavn")}
          {...register("institusjonsnavn")}
        />
      </Cell>
      <Cell xs={2}>
        <TextField
          label={getText("form.utdanning.fraAar")}
          {...register("fraAar")}
        />
      </Cell>
      <Cell xs={2}>
        <TextField
          label={getText("form.utdanning.tilAar")}
          {...register("tilAar")}
        />
      </Cell>
    </Grid>
  </>
);
