import { JaNeiVetIkke } from 'types/Generic';
import { getStudentSchema, JaNeiAvbrutt } from './Student';

describe('Student validation', () => {
  const schema = getStudentSchema(jest.fn());
  it('ingenting utfylt', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('er student', async () => {
    const form = {
      erStudent: JaNeiAvbrutt.JA,
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('er ikke student', async () => {
    const form = {
      erStudent: JaNeiAvbrutt.NEI,
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('er student, men har avbrutt, må fylle ut mer', async () => {
    const form = {
      erStudent: JaNeiAvbrutt.AVBRUTT,
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it('er student, men har avbrutt, kommer tilbake til studiet', async () => {
    const form = {
      erStudent: JaNeiAvbrutt.AVBRUTT,
      kommeTilbake: JaNeiVetIkke.JA,
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('er student, men har avbrutt, kommer ikke tilbake til studiet', async () => {
    const form = {
      erStudent: JaNeiAvbrutt.AVBRUTT,
      kommeTilbake: JaNeiVetIkke.NEI,
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it('er student, men har avbrutt, vet ikke om hen kommer tilbake til studiet', async () => {
    const form = {
      erStudent: JaNeiAvbrutt.AVBRUTT,
      kommeTilbake: JaNeiVetIkke.VET_IKKE,
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
});
