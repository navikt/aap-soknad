import * as yup from "yup";
import { format } from "date-fns";
import { lazy, number, object, string } from "yup";

const paakrevdMelding = (key: String, getText: Function): string =>
  getText(key) + " " + getText("form.errors.required");
const detteAaret = parseInt(format(new Date(), "yyyy"), 10);
const femtiAarSiden = detteAaret - 50;

export const getBedriftSchema = (getText: Function) => [
  yup.object(),
  yup.object().shape({
    // Hvordan støtte
    typeStoette: yup
      .string()
      .ensure()
      .required(getText("form.typeStoette.required")),
  }),
  yup.object().shape({
    // Personlig info
    kommune: string().required(
      paakrevdMelding("form.personlig.kommune", getText)
    ),
    tlfPrivat: string()
      .required(paakrevdMelding("form.personlig.tlfPrivat", getText))
      .matches(/^\+?\d{5,20}$/, "Ugyldig telefonnummer"),
    tlfArbeid: string(),
  }),
  object().shape({
    utdanning: yup.array().of(
      object().shape({
        institusjonsnavn: string().required(
          paakrevdMelding("form.utdanning.institusjonsnavn", getText)
        ),
        fraAar: number()
          .typeError(getText("form.utdanning.errors.feilformatAarstall"))
          .required(paakrevdMelding("form.utdanning.fraAar", getText))
          .min(femtiAarSiden, getText("form.utdanning.errors.forGammel"))
          .max(detteAaret, getText("form.utdanning.errors.fremtid")),
        tilAar: lazy((value) => {
          const parsed = Number.parseInt(value, 10);
          if (!isNaN(parsed)) {
            return number()
              .max(detteAaret, getText("form.utdanning.errors.fremtid"))
              .when("fraAar", (fraAar, schema) => {
                if (fraAar) {
                  return schema.min(
                    fraAar,
                    (tilAar: { value: number }) =>
                      `${fraAar} er etter ${tilAar.value}`
                  );
                } else {
                  return undefined;
                }
              });
          }
          return string().matches(/^\d{4}$/, {
            excludeEmptyString: true,
            message: getText("forms.utdanning.errors.feilformatAarstall"),
          });
        }),
      })
    ),
  }),
  object().shape({
    praksis: yup.array().of(
      object().shape({
        navn: string().required(paakrevdMelding("form.praksis.navn", getText)),
        fraDato: yup
          .date()
          .required(paakrevdMelding("form.praksis.fraDato", getText)),
        tilDato: yup.date(),
      })
    ),
  }),
  object().shape({
    etablererstipend: object().shape({
      soektOm: yup.boolean().nullable().required(getText("form.etablererstipend.soektOm.paakrevd")),
      resultat: yup.string().nullable().when('soektOm', {
        is: true,
        then: yup.string().oneOf(['avslaatt', 'innvilget', 'ikkeFerdigBehandlet']).nullable().required(getText("form.etablererstipend.resultat.paakrevd"))
      })
    }),
  })
];
