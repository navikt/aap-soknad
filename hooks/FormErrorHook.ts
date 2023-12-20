import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { Dispatch, useState } from 'react';

function useFormErrors(): {
  errors?: SøknadValidationError[];
  clearErrors: () => void;
  findError: (path: string) => string | undefined;
  setErrors: Dispatch<SøknadValidationError[]>;
} {
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  const clearErrors = () => setErrors(undefined);
  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;

  return { errors, clearErrors, findError, setErrors };
}

export { useFormErrors };
