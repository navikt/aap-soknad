import React from 'react';
import { RadioGroup } from '@navikt/ds-react';
import { Control, Controller, FieldValues } from 'react-hook-form';

export interface RadioProps {
  name: string;
  legend?: string;
  error?: string;
  control: Control<FieldValues>;
  children?: React.ReactChild | React.ReactChild[];
}
export const InputRadioGroup = ({ children, name, legend, control, error }: RadioProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
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
