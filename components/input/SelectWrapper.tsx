import { Select } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import React, { ReactNode } from 'react';

export interface SelectProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  control: Control<FormFieldValues>;
  required?: string;
  validate?: (value: any) => any;
  children: ReactNode;
}

const SelectWrapper = <FormFieldValues extends FieldValues>({
  name,
  label,
  control,
  children,
}: SelectProps<FormFieldValues>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange }, fieldState: { error } }) => (
      <Select
        id={name}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        error={error?.message}
      >
        {children}
      </Select>
    )}
  />
);
export default SelectWrapper;
