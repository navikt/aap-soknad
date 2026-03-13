import * as yup from 'yup';
import { JaNeiVetIkke } from 'types/Generic';

export const STUDENT = 'student';
export const ER_STUDENT = 'erStudent';
export const KOMME_TILBAKE = 'kommeTilbake';

export enum JaNeiAvbrutt {
  JA = 'Ja',
  NEI = 'Nei',
  AVBRUTT = 'Avbrutt',
}

export const jaNeiAvbruttToTekstnøkkel = (jaNeiAvbrutt: JaNeiAvbrutt) => {
  switch (jaNeiAvbrutt) {
    case JaNeiAvbrutt.JA:
      return 'søknad.student.erStudent.ja';
    case JaNeiAvbrutt.AVBRUTT:
      return 'søknad.student.erStudent.avbrutt';
    case JaNeiAvbrutt.NEI:
      return 'søknad.student.erStudent.nei';
  }
};

export const getStudentSchema = (t: (id: string, values?: Record<string, any>) => string) =>
  yup.object().shape({
    [ER_STUDENT]: yup
      .string()
      .required(t('søknad.student.erStudent.required'))
      .oneOf(
        [JaNeiAvbrutt.JA, JaNeiAvbrutt.NEI, JaNeiAvbrutt.AVBRUTT],
        t('søknad.student.erStudent.required'),
      )
      .typeError(t('søknad.student.erStudent.required')),
    [KOMME_TILBAKE]: yup.string().when(ER_STUDENT, ([erStudent], schema) => {
      if (erStudent === JaNeiAvbrutt.AVBRUTT) {
        return yup
          .string()
          .required(t('søknad.student.kommeTilbake.required'))
          .oneOf(
            [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
            t('søknad.student.kommeTilbake.required'),
          )
          .typeError(t('søknad.student.kommeTilbake.required'));
      }
      return schema;
    }),
  });
