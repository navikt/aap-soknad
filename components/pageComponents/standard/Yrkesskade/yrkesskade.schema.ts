import * as yup from 'yup';
import { JaEllerNei } from 'types/Generic';

export const getYrkesskadeSchema = (t: (id: string, values?: Record<string, any>) => string) =>
  yup.object().shape({
    yrkesskade: yup
      .string()
      .required(t('søknad.yrkesskade.harDuYrkesskade.validation.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });
