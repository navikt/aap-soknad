import React, { ReactNode } from 'react';
import { RadioGroup } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import * as classes from './RadioGroupWrapper.module.css';

export interface RadioProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  legend?: string;
  control: Control<FormFieldValues>;
  description?: string;
  error?: string;
  children?: ReactNode;
}
const RadioGroupWrapper = <FormFieldValues extends FieldValues>({
  children,
  name,
  legend,
  description,
  control,
  error,
}: RadioProps<FormFieldValues>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange } }) => (
      <RadioGroup
        id={name}
        value={value || ''}
        name={name}
        legend={legend}
        description={description}
        error={error}
        onChange={onChange}
        className={classes?.fieldsetFocus}
        tabIndex={-1}
      >
        {children}
      </RadioGroup>
    )}
  />
);
export default RadioGroupWrapper;
