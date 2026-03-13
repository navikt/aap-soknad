import * as yup from 'yup';
import { JaEllerNei } from 'types/Generic';

export enum StønadType {
  ØKONOMISK_SOSIALHJELP = 'ØKONOMISK_SOSIALHJELP',
  OMSORGSSTØNAD = 'OMSORGSSTØNAD',
  INTRODUKSJONSSTØNAD = 'INTRODUKSJONSSTØNAD',
  KVALIFISERINGSSTØNAD = 'KVALIFISERINGSSTØNAD',
  VERV = 'VERV',
  UTLAND = 'UTLAND',
  AFP = 'AFP',
  STIPEND = 'STIPEND',
  LÅN = 'LÅN',
  NEI = 'NEI',
}

export const stønadTypeToAlternativNøkkel = (stønadType: StønadType) => {
  switch (stønadType) {
    case StønadType.ØKONOMISK_SOSIALHJELP:
      return 'søknad.andreUtbetalinger.stønad.values.økonomiskSosialhjelp';
    case StønadType.OMSORGSSTØNAD:
      return 'søknad.andreUtbetalinger.stønad.values.omsorgsstønad';
    case StønadType.INTRODUKSJONSSTØNAD:
      return 'søknad.andreUtbetalinger.stønad.values.introduksjonsStønad';
    case StønadType.KVALIFISERINGSSTØNAD:
      return 'søknad.andreUtbetalinger.stønad.values.kvalifiseringsstønad';
    case StønadType.VERV:
      return 'søknad.andreUtbetalinger.stønad.values.verv';
    case StønadType.UTLAND:
      return 'søknad.andreUtbetalinger.stønad.values.utland';
    case StønadType.AFP:
      return 'søknad.andreUtbetalinger.stønad.values.afp';
    case StønadType.STIPEND:
      return 'søknad.andreUtbetalinger.stønad.values.stipend';
    case StønadType.LÅN:
      return 'søknad.andreUtbetalinger.stønad.values.lån';
    case StønadType.NEI:
      return 'søknad.andreUtbetalinger.stønad.values.nei';
  }
};

export const getAndreUtbetalingerSchema = (t: (id: string, values?: Record<string, any>) => string) =>
  yup.object().shape({
    lønn: yup
      .string()
      .required(t('søknad.andreUtbetalinger.lønn.validation.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
    stønad: yup
      .array()
      .ensure()
      .min(1, t('søknad.andreUtbetalinger.stønad.validation.required')),
    afp: yup
      .object({
        hvemBetaler: yup.string().nullable(),
      })
      .when('stønad', ([stønad], schema) => {
        if (stønad?.includes(StønadType.AFP)) {
          return yup.object({
            hvemBetaler: yup.string().required(
              t('søknad.andreUtbetalinger.hvemBetalerAfp.validation.required'),
            ),
          });
        }
        return schema;
      }),
  });
