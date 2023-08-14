import { IntlFormatters } from 'react-intl';
import * as yup from 'yup';
import { JaEllerNei } from '../../../../types/Generic';
import {
  validateArbeidINorge,
  validateArbeidUtenforNorgeFørSykdom,
  validateOgsåArbeidetUtenforNorge,
} from './medlemskapUtils';

export const getMedlemskapSchema = (formatMessage: IntlFormatters['formatMessage']) => {
  return yup.object().shape({
    medlemskap: yup.object().shape({
      harBoddINorgeSiste5År: yup
        .mixed<JaEllerNei>()
        .required(
          formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.validation.required' })
        )
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
        .nullable(),
      harArbeidetINorgeSiste5År: yup.mixed<JaEllerNei>().when('harBoddINorgeSiste5År', {
        is: validateArbeidINorge,
        then: (yupSchema) =>
          yupSchema
            .required(
              formatMessage({
                id: 'søknad.medlemskap.harArbeidetINorgeSiste5År.validation.required',
              })
            )
            .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
            .nullable(),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      arbeidetUtenforNorgeFørSykdom: yup
        .mixed<JaEllerNei>()
        .when(['harBoddINorgeSiste5År', 'harArbeidetINorgeSiste5År'], {
          is: validateArbeidUtenforNorgeFørSykdom,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({ id: 'søknad.medlemskap.arbeidUtenforNorge.validation.required' })
              )
              .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
              .nullable(),
          otherwise: (yupSchema) => yupSchema.notRequired(),
        }),
      iTilleggArbeidUtenforNorge: yup
        .mixed<JaEllerNei>()
        .when(['harBoddINorgeSiste5År', 'harArbeidetINorgeSiste5År'], {
          is: validateOgsåArbeidetUtenforNorge,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.iTilleggArbeidUtenforNorge.validation.required',
                })
              )
              .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
              .nullable(),
          otherwise: (yupSchema) => yupSchema.notRequired(),
        }),
      utenlandsOpphold: yup
        .array()
        .when(['harBoddINorgeSiste5År', 'arbeidetUtenforNorgeFørSykdom'], {
          is: (harBoddINorgeSiste5År: JaEllerNei, arbeidetUtenforNorgeFørSykdom: JaEllerNei) =>
            harBoddINorgeSiste5År === JaEllerNei.JA &&
            arbeidetUtenforNorgeFørSykdom === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.boddINorgeArbeidUtenforNorge.validation.required',
                })
              )
              .min(
                1,
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.boddINorgeArbeidUtenforNorge.validation.required',
                })
              ),
        })
        .when(['iTilleggArbeidUtenforNorge'], {
          is: (iTilleggArbeidUtenforNorge: JaEllerNei) =>
            iTilleggArbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.ogsåArbeidUtenforNorge.validation.required',
                })
              )
              .min(
                1,
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.ogsåArbeidUtenforNorge.validation.required',
                })
              ),
        })
        .when(['harArbeidetINorgeSiste5År'], {
          is: (harArbeidetINorgeSiste5År: JaEllerNei) =>
            harArbeidetINorgeSiste5År === JaEllerNei.NEI,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.arbeidINorge.validation.required',
                })
              )
              .min(
                1,
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.arbeidINorge.validation.required',
                })
              ),
        }),
    }),
  });
};
