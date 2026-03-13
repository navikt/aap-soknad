import * as yup from 'yup';
import { JaEllerNei } from 'types/Generic';

export enum FerieType {
  DAGER = 'DAGER',
  PERIODE = 'PERIODE',
}

export const FerieTypeToMessageKey = (ferieType: FerieType) => {
  switch (ferieType) {
    case FerieType.PERIODE:
      return 'søknad.startDato.ferieType.values.periode';
    case FerieType.DAGER:
      return 'søknad.startDato.ferieType.values.dager';
  }
};

export const getStartDatoSchema = (t: (id: string, values?: Record<string, any>) => string) => {
  return yup.object().shape({
    sykepenger: yup
      .string()
      .required(t('søknad.startDato.sykepenger.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
    ferie: yup
      .object({
        skalHaFerie: yup.string().nullable(),
        ferieType: yup.string().nullable(),
        fraDato: yup.date().nullable(),
        tilDato: yup.date().nullable(),
        antallDager: yup.string().nullable(),
      })
      .when('sykepenger', ([sykepenger], schema) => {
        if (sykepenger === JaEllerNei.JA) {
          return yup.object({
            skalHaFerie: yup
              .string()
              .required(t('søknad.startDato.skalHaFerie.validation.required')),
            ferieType: yup.string().when('skalHaFerie', ([skalHaFerie], schema) => {
              if (skalHaFerie === JaEllerNei.JA) {
                return yup
                  .string()
                  .required(t('søknad.startDato.ferieType.validation.required'))
                  .nullable();
              }
              return schema;
            }),
            fraDato: yup.date().when('ferieType', ([ferieType], schema) => {
              if (ferieType === FerieType.PERIODE) {
                return yup
                  .date()
                  .required(t('søknad.startDato.periode.fraDato.validation.required'))
                  .typeError(t('søknad.startDato.periode.fraDato.validation.typeError'));
              }
              return schema;
            }),
            tilDato: yup.date().when('ferieType', ([ferieType], schema) => {
              if (ferieType === FerieType.PERIODE) {
                return yup
                  .date()
                  .required(t('søknad.startDato.periode.tilDato.validation.required'))
                  .typeError(t('søknad.startDato.periode.tilDato.validation.typeError'))
                  .min(
                    yup.ref('fraDato'),
                    t('søknad.startDato.periode.tilDato.validation.fraDatoEtterTilDato'),
                  );
              }
              return schema;
            }),
            antallDager: yup.string().when('ferieType', ([ferieType], schema) => {
              if (ferieType === FerieType.DAGER) {
                return yup
                  .string()
                  .required(t('søknad.startDato.antallDager.validation.required'));
              }
              return schema;
            }),
          });
        }
        return schema;
      }),
  });
};
