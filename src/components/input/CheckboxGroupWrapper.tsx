import React from 'react';
import { CheckboxGroup } from '@navikt/ds-react';
import { Control, Controller, FieldValues } from 'react-hook-form';

export interface CheckboxProps {
  name: string;
  legend?: string;
  size?: 'small' | 'medium';
  error?: string;
  control: Control<FieldValues>;
  children?: React.ReactChild | React.ReactChild[];
}
const CheckboxGroupWrapper = ({ children, name, legend, size, control, error }: CheckboxProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange } }) => (
      <CheckboxGroup
        size={size}
        id={name}
        name={name}
        legend={legend}
        error={error}
        value={value}
        onChange={onChange}
      >
        {children}
      </CheckboxGroup>
    )}
  />
);
export default CheckboxGroupWrapper;
