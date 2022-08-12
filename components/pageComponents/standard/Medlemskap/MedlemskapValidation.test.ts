import { getMedlemskapSchema } from './Medlemskap';

describe('Medlemskap validation', () => {
  const schema = getMedlemskapSchema(jest.fn());
  it('should return invalid for empty object', async () => {
    const result = await schema.validate({}, { abortEarly: false }).catch((err) => err);
    expect(result.errors.length).not.toBe(0);
  });
  it("should be valid when 'harBoddINorgeSiste5År' is 'Ja' and 'arbeidetUtenforNorgeFørSykdom' is 'Nei'", async () => {
    const form = {
      medlemskap: {
        harBoddINorgeSiste5År: 'Ja',
        arbeidetUtenforNorgeFørSykdom: 'Nei',
      },
    };
    const result = await schema.validate(form, { abortEarly: false }).catch((err) => err);
    expect(result).toStrictEqual(form);
  });
});
