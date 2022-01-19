import { useState } from "react";

import {
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
} from "react-hook-form";

import { GetText } from "../../../hooks/useTexts";
import {
  InputRadio,
  RadioGruppe,
} from "../../../components/input/RadioWrapper";
import { RenderWhen } from "../../../components/RenderWhen";

const etablererstipendSoeknadstatus = Object.freeze({
  INNVILGET: "innvilget",
  AVSLÅTT: "avslått",
  IKKE_FERDIG_BEHANDLET: "ikkeFerdigBehandlet",
});

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

  const [harSoektOmEtablererStipend, setHarSoektOmEtablererStipend] =
    useState<boolean>(getValues("etablererstipend.soektOm") === "true");
  const [maaLasteOppVedlegg, setMaaLasteOppVedlegg] = useState<boolean>(
    getValues("etablererstipend.resultat") ===
      etablererstipendSoeknadstatus.AVSLÅTT ||
      getValues("etablererstipend.resultat") ===
        etablererstipendSoeknadstatus.INNVILGET
  );

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
          onChange={() => setHarSoektOmEtablererStipend(true)}
        />
        <InputRadio
          register={register}
          value={false}
          noekkel={"etablererstipend.soektOm"}
          getText={getText}
          onChange={() => setHarSoektOmEtablererStipend(false)}
        />
      </RadioGruppe>
      <RenderWhen when={harSoektOmEtablererStipend}>
        <RadioGruppe
          groupKey={"etablererstipend.resultat"}
          getText={getText}
          error={errors?.resultat?.message}
        >
          <InputRadio
            register={register}
            value={etablererstipendSoeknadstatus.AVSLÅTT}
            noekkel={"etablererstipend.resultat"}
            getText={getText}
            onChange={() => setMaaLasteOppVedlegg(true)}
          />
          <InputRadio
            register={register}
            value={etablererstipendSoeknadstatus.INNVILGET}
            noekkel={"etablererstipend.resultat"}
            getText={getText}
            onChange={() => setMaaLasteOppVedlegg(true)}
          />
          <InputRadio
            register={register}
            value={etablererstipendSoeknadstatus.IKKE_FERDIG_BEHANDLET}
            noekkel={"etablererstipend.resultat"}
            getText={getText}
            onChange={() => setMaaLasteOppVedlegg(false)}
          />
        </RadioGruppe>
      </RenderWhen>
      <RenderWhen when={maaLasteOppVedlegg}>
        <label>
          {getText("form.etablererstipend.vedlegg.label")}
          <input type="file" name="kopiAvVedtak" />
        </label>
      </RenderWhen>
    </section>
  );
};

export { Etablererstipend };
