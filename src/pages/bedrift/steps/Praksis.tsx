import { Button, Cell, Grid, GuidePanel, TextField } from "@navikt/ds-react";
import ControlDatoVelger from "../../../components/input/ControlDatoVelger";
import { AddCircle, DeleteFilled } from "@navikt/ds-icons";
import { GetText } from "../../../hooks/useTexts";
import {
  Control,
  FieldErrors,
  FieldValues,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";
import React from "react";

interface PraksisType {
  getText: GetText;
  control: Control;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

interface PraksisRadType extends PraksisType {
  index: number;
  fieldKey: string;
  remove: Function;
}

const PraksisRad = ({
  register,
  getText,
  control,
  errors,
  index,
  fieldKey,
  remove,
}: PraksisRadType): JSX.Element => {
  const fieldErrors = errors?.[index];
  return (
    <div className={"rad"}>
      <Grid>
        <Cell xs={7}>
          <TextField
            label={getText("form.praksis.navn")}
            error={fieldErrors?.navn?.message}
            {...register(`${fieldKey}.${index}.navn`)}
          />
        </Cell>
        <Cell xs={2}>
          <ControlDatoVelger
            name={"fraDato"}
            label={getText("form.praksis.fraDato")}
            control={control}
            error={fieldErrors?.fraDato?.message}
          />
        </Cell>
        <Cell xs={2}>
          <ControlDatoVelger
            name={"tilDato"}
            label={getText("form.praksis.tilDato")}
            control={control}
            error={fieldErrors?.tilDato?.message}
          />
        </Cell>
        <Cell xs={1} className={"slett__ikon"}>
          <Button
            variant={"tertiary"}
            onClick={() => remove(index)}
            name={getText("form.praksis.slettRad")}
          >
            <DeleteFilled title={getText("form.praksis.slettRad")} />
          </Button>
        </Cell>
      </Grid>
    </div>
  );
};

const Praksis = ({
  getText,
  register,
  control,
  errors,
}: PraksisType): JSX.Element => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "praksis",
  });

  const leggTilRad = () => {
    append({navn: '', fraDato: null, tilDato: ''});
  };

  return (
    <>
      <GuidePanel poster>{getText("steps.praksis.guideText")}</GuidePanel>
      <section>
        {fields.map((field, index) => (
          <PraksisRad
            getText={getText}
            control={control}
            register={register}
            errors={errors}
            key={field.id}
            index={index}
            fieldKey={"praksis"}
            remove={remove}
          />
        ))}
      </section>
      <section>
        <Button variant={"tertiary"} size={"small"} onClick={leggTilRad} type={"button"}>
          <AddCircle aria-hidden title={getText("form.praksis.leggTil")} />
          {getText("form.praksis.leggTil")}
        </Button>
      </section>
    </>
  );
};

export { Praksis };
