import * as yup from 'yup';

export const getUtlandSchemas = (getText: any) => [
  yup.object({}),
  yup.object().shape({
    country: yup
      .string()
      .required(getText('form.country.required'))
      .notOneOf(['none'], getText('form.country.required')),
  }),
  yup.object().shape({
    fromDate: yup.date().required(getText('form.fromdate.required')),
    toDate: yup
      .date()
      .required(getText('form.todate.required'))
      .when(
        'fromDate',
        (fromDate, yup) => fromDate && yup.min(fromDate, getText('form.todate.afterfromdate'))
      ),
  }),
  yup.object().shape({
    confirmationPanel: yup
      .boolean()
      .required(getText('form.confirmationPanel.required'))
      .oneOf([true], getText('form.confirmationPanel.required')),
  }),
  yup.object({}),
];
