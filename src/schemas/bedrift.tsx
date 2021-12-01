import * as yup from "yup";

export const getBedriftSchema = (getText: Function) => ([
  yup.object(),
  yup.object().shape({
    typeStoette: yup.string().required(getText('form.typeStoette.required'))
  }),
  yup.object().shape({
    kommune: yup.string().required(getText('form.personlig.kommune.required')),
    tlfPrivat: yup.string().required(getText('form.personlig.tlfPrivat.required')),
    tlfArbeid: yup.string()
  })
]);
