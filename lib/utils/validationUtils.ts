import { ObjectSchema, ValidationError } from 'yup';
import { SøknadValidationError } from '../../components/schema/FormErrorSummaryNew';

export async function validate(
  yupSchema: ObjectSchema<any>,
  søknadState: any
): Promise<SøknadValidationError[] | undefined> {
  try {
    await yupSchema.validate(søknadState, {
      abortEarly: false,
    });
    return undefined;
  } catch (e) {
    if (e instanceof ValidationError) {
      return e.inner.map((error) => {
        return {
          path: error.path || '',
          message: error.message,
        };
      });
    }
  }
}