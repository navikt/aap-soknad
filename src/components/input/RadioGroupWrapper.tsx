import React from 'react';
import { RadioGroup } from '@navikt/ds-react';
import { Control, Controller } from 'react-hook-form';

export interface RadioProps {
  name: string;
  legend?: string;
  error?: string;
  control: Control;
  children?: React.ReactChild | React.ReactChild[];
}
const RadioGroupWrapper = ({ children, name, legend, control, error }: RadioProps) => (
  <Controller
    name={name}
    control={control}
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
