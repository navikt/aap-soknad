import React from "react";

import { Button, Cell, Grid, GuidePanel, TextField } from "@navikt/ds-react";
import { AddCircle, DeleteFilled } from "@navikt/ds-icons";
import { GetText } from "../../../hooks/useTexts";
import {
  Control,
  FieldErrors,
  FieldValues,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";

interface UtdanningTypes {
  getText: GetText;
  control: Control;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

interface RadTypes extends UtdanningTypes {
  index: number;
  fieldKey: string;
  remove: Function;
}

const UtdanningRad = ({
  getText,
  register,
  errors,
  fieldKey,
  index,
  remove,
}: RadTypes): JSX.Element => {
  const fieldErrors = errors?.[index];
  return (
    <Grid>
      <Cell xs={7}>
        <TextField
          label={getText("form.utdanning.institusjonsnavn")}
          {...register(`${fieldKey}.${index}.institusjonsnavn`)}
          error={fieldErrors?.institusjonsnavn?.message}
        />
      </Cell>
      <Cell xs={2}>
        <TextField
          label={getText("form.utdanning.fraAar")}
          {...register(`${fieldKey}.${index}.fraAar`)}
          error={fieldErrors?.fraAar?.message}
        />
      </Cell>
      <Cell xs={2}>
        <TextField
          label={getText("form.utdanning.tilAar")}
          {...register(`${fieldKey}.${index}.tilAar`)}
          error={fieldErrors?.tilAar?.message}
        />
      </Cell>
      <Cell xs={1}>
        <Button
          variant={"tertiary"}
          size={"small"}
          onClick={() => remove(index)}
        >
          <DeleteFilled title={getText("form.utdanning.slettRad")} />
        </Button>
      </Cell>
    </Grid>
  );
};

export const Utdanning = ({
  getText,
  register,
  control,
  errors,
}: UtdanningTypes): JSX.Element => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "utdanning",
  });

  return (
    <>
      <GuidePanel poster>{getText("steps.utdanning.guideText")}</GuidePanel>
      <section>
        {fields.map((field, index) => (
          <UtdanningRad
            getText={getText}
            control={control}
            register={register}
            errors={errors}
            key={field.id}
            index={index}
            fieldKey={"utdanning"}
            remove={remove}
          />
        ))}
      </section>
      <section>
        <Button variant={"tertiary"} size={"small"} onClick={() => append({})}>
          <AddCircle aria-hidden title={getText("form.utdanning.leggTil")} />
          {getText("form.utdanning.leggTil")}
        </Button>
      </section>
    </>
  );
};
