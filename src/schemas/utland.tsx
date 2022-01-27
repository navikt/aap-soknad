import * as yup from "yup";

export const getUtlandSchemas = (getText: any) => ([
  yup.object({}),
  yup.object().shape({
    country: yup.string().required(getText('form.country.required')).notOneOf(['none'], getText('form.country.required')),
  }),
  yup.object().shape({
    fromDate: yup.date().required(getText('form.fromDate.required')),
    toDate: yup.date().required(getText('form.toDate.required')).when("fromDate",
      (fromDate, yup) => fromDate && yup.min(fromDate, 'Må være etter Fra dato'))
  }),
  yup.object().shape({
    confirmationPanel: yup.boolean().oneOf([true], getText('form.confirmationPanel.required')),
  }),
  yup.object({}),
]);
