import { getMedlemskapSchema } from './Medlemskap';
import { JaEllerNei } from '../../../../types/Generic';

describe('Medlemskap validation', () => {
  const schema = getMedlemskapSchema(jest.fn());
  it('should return invalid for empty object', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it("should be valid when 'harBoddINorgeSiste5År' is 'Ja' and 'arbeidetUtenforNorgeFørSykdom' is 'Nei'", async () => {
    const form = {
      medlemskap: {
        harBoddINorgeSiste5År: JaEllerNei.JA,
        arbeidetUtenforNorgeFørSykdom: JaEllerNei.NEI,
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  // eslint-disable-next-line max-len
  it("should be valid when 'harBoddINorgeSiste5År' is 'NEI' and 'harArbeidetINorgeSiste5År' is 'Ja' and 'iTilleggArbeidUtenforNorge' is 'NEI'", async () => {
    const form = {
      medlemskap: {
        harBoddINorgeSiste5År: JaEllerNei.NEI,
        harArbeidetINorgeSiste5År: JaEllerNei.JA,
        iTilleggArbeidUtenforNorge: JaEllerNei.NEI,
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
  it("should be invalid when 'harBoddINorgeSiste5År' is 'Nei' and 'harArbeidetINorgeSiste5År' is 'Ja'", async () => {
    const form = {
      medlemskap: {
        harBoddINorgeSiste5År: JaEllerNei.NEI,
        harArbeidetINorgeSiste5År: JaEllerNei.JA,
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it(
    "should be invalid when 'harBoddINorgeSiste5År' is 'Ja' " +
      "and 'harArbeidetINorgeSiste5År' is 'Ja' and empty utenlandsPeriode",
    async () => {
      const form = {
        medlemskap: {
          harBoddINorgeSiste5År: JaEllerNei.JA,
          arbeidetUtenforNorgeFørSykdom: JaEllerNei.JA,
          utenlandsOpphold: [],
        },
      };
      const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
      expect(result.errors.length).not.toBe(0);
    }
  );
  it(
    "should be valid when 'harBoddINorgeSiste5År' is 'Ja' " +
      "and 'harArbeidetINorgeSiste5År' is 'Ja' and not empty utenlandsPeriode",
    async () => {
      const form = {
        medlemskap: {
          harBoddINorgeSiste5År: JaEllerNei.JA,
          arbeidetUtenforNorgeFørSykdom: JaEllerNei.JA,
          utenlandsOpphold: [{}],
        },
      };
      const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
      expect(result).toStrictEqual(form);
    }
  );
});
