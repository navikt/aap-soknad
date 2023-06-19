import { FieldErrors } from 'react-hook-form';
import { ObjectSchema, ValidationError } from 'yup';
import { GenericSoknadContextState } from '../../types/SoknadContext';
import { Soknad } from '../../types/Soknad';

export async function validate(
  yupSchema: ObjectSchema<any>,
  søknadState: any
): Promise<FieldErrors | undefined> {
  try {
    await yupSchema.validate(søknadState, {
      abortEarly: false,
    });
    return undefined;
  } catch (e) {
    if (e instanceof ValidationError) {
      return e.inner.reduce(
        (acc, currentValue) => ({
          ...acc,
          [currentValue.path as string]: {
            message: currentValue.message,
            type: currentValue.type,
          },
        }),
        {}
      );
    }
  }
}
