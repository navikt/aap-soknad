import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

import { Button, Cell, Grid, GuidePanel, TextField } from "@navikt/ds-react";
import { AddCircle } from "@navikt/ds-icons";

import { GetText } from "../../hooks/useTexts";
import { InputRadio, RadioGruppe } from "../../components/input/RadioWrapper";
import ControlDatoVelger from "../../components/input/ControlDatoVelger";

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

export const Utdanning = ({ getText, register }: StepType): JSX.Element => (
  <>
    <GuidePanel poster>{getText("steps.utdanning.guideText")}</GuidePanel>
    <section>
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
    </section>
    <section>
      <Button variant={"tertiary"} size={"small"}>
        <AddCircle />
        Legg til utdanning
      </Button>
    </section>
  </>
);

interface PraksisType extends StepType {
  control: Control;
}

export const Praksis = ({
  getText,
  register,
  control,
  errors,
}: PraksisType): JSX.Element => (
  <>
    <GuidePanel poster>{getText("steps.praksis.guideText")}</GuidePanel>
    <section>
      <Grid>
        <Cell xs={8}>
          <TextField
            label={getText("form.praksis.navn")}
            error={errors.navn?.message}
            {...register("navn")}
          />
        </Cell>
        <Cell xs={2}>
          <ControlDatoVelger
            name={"fraDato"}
            label={getText("form.praksis.fraDato")}
            control={control}
            error={errors.fraDato?.message}
          />
        </Cell>
        <Cell xs={2}>
          <ControlDatoVelger
            name={"tilDato"}
            label={getText("form.praksis.tilDato")}
            control={control}
            error={errors.tilDato?.message}
          />
        </Cell>
      </Grid>
    </section>
    <section>
      <Button variant={"tertiary"} size={"small"}>
        <AddCircle />
        Legg til yrkeserfaring
      </Button>
    </section>
  </>
);
