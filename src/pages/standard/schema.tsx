import * as yup from 'yup';

export const getStepSchemas = (getText: any) => [
  yup.object().shape({
    // rettogplikt: yup
    //   .boolean()
    //   .required(getText('form.rettogplikt.required'))
    //   .oneOf([true], getText('form.rettogplikt.required')),
    // riktigeopplysninger: yup
    //   .boolean()
    //   .required(getText('form.riktigeopplysninger.required'))
    //   .oneOf([true], getText('form.riktigeopplysninger.required')),
  }),
  // yup.object().shape({
  //   firstname: yup.string().required(getText('form.kontaktinfo.firstname.required')),
  //   lastname: yup.string().required(getText('form.kontaktinfo.lastname.required')),
  //   adresse: yup.string().required(getText('form.kontaktinfo.adresse.required')),
  //   postnummer: yup.string().required(getText('form.kontaktinfo.postnummer.required')),
  //   poststed: yup.string().required(getText('form.kontaktinfo.poststed.required')),
  //   epost: yup.string().email(getText('form.kontaktinfo.epost.format')),
  // }),
  yup.object().shape({
    // bekreftFastlege: yup.string().required(),
  }),
  yup.object().shape({
    // utenlandsopphold: yup.array().of(
    //   yup.object().shape({
    //     land: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.land.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.land.required')),
    //     framåned: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.framåned.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.framåned.required')),
    //     fraår: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.fraår.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.fraår.required')),
    //     tilmåned: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.tilmåned.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.tilmåned.required')),
    //     tilår: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.tilår.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.tilår.required')),
    //   })
    // ),
    // utenlandsarbeid: yup.array().of(
    //   yup.object().shape({
    //     land: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.land.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.land.required')),
    //     framåned: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.framåned.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.framåned.required')),
    //     fraår: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.fraår.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.fraår.required')),
    //     tilmåned: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.tilmåned.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.tilmåned.required')),
    //     tilår: yup
    //       .string()
    //       .required(getText('form.utenlandsarbeid.tilår.required'))
    //       .notOneOf(['none'], getText('form.utenlandsarbeid.tilår.required')),
    //   })
    // ),
  }),
  yup.object().shape({
    // yrkesskade: yup.string().required(getText('form.yrkesskade.required')),
  }),
  yup.object().shape({
    // lønnEllerSykepenger: yup.string().required(getText('form.lønnellersykepenger.required')),
    // andreGoder: yup.string().required(getText('form.andregoder.required'))
  }),
  yup.object().shape({}),
  yup.object().shape({}),
  yup.object().shape({}),
  yup.object().shape({}),
  yup.object().shape({}),
  yup.object().shape({}),
];
