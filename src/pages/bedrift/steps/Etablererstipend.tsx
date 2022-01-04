import { GetText } from "../../../hooks/useTexts";
import {
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
} from "react-hook-form";
import {
  InputRadio,
  RadioGruppe,
} from "../../../components/input/RadioWrapper";
import { RenderWhen } from "../../../components/RenderWhen";
import { useState } from "react";

interface EtablererstipendTypes {
  getText: GetText;
  errors: FieldErrors;
  register: UseFormRegister<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
}

const Etablererstipend = ({
  getText,
  errors,
  register,
  getValues,
}: EtablererstipendTypes): JSX.Element => {
  const initiellVerdi = getValues("etablererstipend.soektOm");
  const [val, setVal] = useState<boolean>(initiellVerdi === "true");

  return (
    <section>
      <RadioGruppe
        groupKey={"etablererstipend.soektOm"}
        getText={getText}
        error={errors?.soektOm?.message}
      >
        <InputRadio
          register={register}
          value={true}
          noekkel={"etablererstipend.soektOm"}
          getText={getText}
          onChange={() => setVal(true)}
        />
        <InputRadio
          register={register}
          value={false}
          noekkel={"etablererstipend.soektOm"}
          getText={getText}
          onChange={() => setVal(false)}
        />
      </RadioGruppe>
      <RenderWhen when={val}>
        <RadioGruppe
          groupKey={"etablererstipend.resultat"}
          getText={getText}
          error={errors?.resultat?.message}
        >
          <InputRadio
            register={register}
            value={"avslaatt"}
            noekkel={"etablererstipend.resultat"}
            getText={getText}
          />
          <InputRadio
            register={register}
            value={"innvilget"}
            noekkel={"etablererstipend.resultat"}
            getText={getText}
          />
          <InputRadio
            register={register}
            value={"ikkeFerdigBehandlet"}
            noekkel={"etablererstipend.resultat"}
            getText={getText}
          />
        </RadioGruppe>
      </RenderWhen>
    </section>
  );
};

export { Etablererstipend };
