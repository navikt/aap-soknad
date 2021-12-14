import { Button, Cell, Grid, GuidePanel, TextField } from "@navikt/ds-react";
import { AddCircle } from "@navikt/ds-icons";
import useTexts, { GetText } from "../../../hooks/useTexts";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface UtdanningTypes {
  getText: GetText;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

export const Utdanning = ({ getText, register }: UtdanningTypes): JSX.Element => {
  return (
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
          {getText("form.utdanning.leggTil")}
        </Button>
      </section>
    </>
  );
};
