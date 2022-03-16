import React from 'react';
import { RadioGroup } from '@navikt/ds-react';
import { Controller, FieldError, FieldValues, UseControllerProps } from 'react-hook-form';

export interface RadioProps<T> extends UseControllerProps<T> {
  legend?: string;
  error: FieldError | undefined;
  children?: React.ReactChild | React.ReactChild[];
}
const RadioGroupWrapper = <T extends FieldValues>({
  children,
  name,
  legend,
  control,
  error,
}: RadioProps<T>) => (
  <Controller
    name={name}
    control={control}
    // @ts-ignore
    defaultValue={null}
    render={({ field: { value, onChange } }) => (
      <RadioGroup
        id={name}
        value={value}
        name={name}
        legend={legend}
        error={error}
        onChange={onChange}
      >
        {children}
      </RadioGroup>
    )}
  />
);
export default RadioGroupWrapper;
