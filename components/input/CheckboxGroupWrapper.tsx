import React, { ReactNode } from 'react';
import { CheckboxGroup } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

export interface CheckboxProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  legend?: string;
  size?: 'small' | 'medium';
  control: Control<FormFieldValues>;
  children?: ReactNode;
}
const CheckboxGroupWrapper = <FormFieldValues extends FieldValues>({
  children,
  name,
  legend,
  size,
  control,
}: CheckboxProps<FormFieldValues>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange }, fieldState: { error } }) => (
      <CheckboxGroup
        size={size}
        id={name}
        name={name}
        legend={legend}
        error={error?.message}
        value={value || []}
        onChange={onChange}
      >
        {children}
      </CheckboxGroup>
    )}
  />
);
export default CheckboxGroupWrapper;
