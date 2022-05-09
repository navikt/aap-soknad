import { Controller } from 'react-hook-form';
import DatoVelger from '../datovelger';
import React from 'react';

export interface DatoVelgerProps {
  name: string;
  label: string;
  control: any;
  description?: React.ReactChild | React.ReactChild[];
  error?: string;
  required?: string;
  validate?: () => any;
}

const DatoVelgerWrapper = ({ name, label, control, error, description }: DatoVelgerProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange } }) => (
      <DatoVelger
        id={name}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        description={description}
      />
    )}
  />
);

export default DatoVelgerWrapper;
