import { GuidePanel, RadioGroup, TextField } from "@navikt/ds-react";
import { GetText } from "../../hooks/useTexts";
import { Control, FieldErrors } from "react-hook-form";
import { ControlRadio } from "../../components/input/ControlRadio";

interface StepProps {
  getText: GetText;
  control: Control;
  register?: any;
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
  control,
  errors,
}: StepProps): JSX.Element => {
  console.log(errors);
  return (
    <RadioGroup
      legend={getText("form.typeStoette.label")}
      error={errors.typeStoette?.message}
    >
      <ControlRadio
        name={"typeStoette"}
        label={getText("form.typeStoette.utviklingsfase")}
        control={control}
      />
      <ControlRadio
        name={"typeStoette"}
        label={getText("form.typeStoette.oppstartEtterUtvikling")}
        control={control}
      />
      <ControlRadio
        name={"typeStoette"}
        label={getText("form.typeStoette.oppstartUtenUtvikling")}
        control={control}
      />
    </RadioGroup>
  );
};

export const PersonligInfo = ({ getText }: StepProps): JSX.Element => (
  <>
    <TextField label={getText("form.personlig.kommune")} />
    <TextField label={getText("form.personlig.tlfPrivat")} type="tel" />
    <TextField label={getText("form.personlig.tlfArbeid")} type="tel" />
  </>
);
