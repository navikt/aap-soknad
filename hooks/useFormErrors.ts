import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { useState } from 'react';

const useFormErrors = <T>() => {
  const [errors, updateErrors] = useState<SøknadValidationError[] | undefined>();

  const clearErrors = () => updateErrors(undefined);
  const setErrors = (errors: SøknadValidationError[]) => updateErrors(errors);
  const findError = (path: T) => errors?.find((error) => error.path === path)?.message;

  return { errors, clearErrors, findError, setErrors };
};

export { useFormErrors };
