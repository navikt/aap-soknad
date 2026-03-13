import * as yup from 'yup';

export const getBehandlerSchema = (t: (id: string, values?: Record<string, any>) => string) => {
  return yup.object().shape({
    firstname: yup
      .string()
      .required(t('søknad.helseopplysninger.modal.fornavn.validation.required'))
      .nullable(),
    lastname: yup
      .string()
      .required(t('søknad.helseopplysninger.modal.etternavn.validation.required'))
      .nullable(),
  });
};
