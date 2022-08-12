import { Select } from '@navikt/ds-react';
import { Controller } from 'react-hook-form';
import React from 'react';

export interface SelectProps {
  name: string;
  label: string;
  control: any;
  error?: string;
  required?: string;
  validate?: (value: any) => any;
  children?: React.ReactChild | React.ReactChild[];
}

const SelectWrapper = ({ name, label, control, error, children }: SelectProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange } }) => (
      <Select name={name} label={label} value={value} onChange={onChange} error={error}>
        {children}
      </Select>
    )}
  />
);

export default SelectWrapper;
