import React from 'react';
import { TextField } from '@navikt/ds-react';
import { Control, Controller, FieldValues } from 'react-hook-form';

export interface TextFieldProps {
  name: string;
  label: string;
  error?: string;
  control: Control<FieldValues>;
}

const TextFieldWrapper = ({ name, label, control, error }: TextFieldProps) => (
  <Controller
    name={name}
    control={control}
    defaultValue={''}
    render={({ field: { name, value, onChange } }) => (
      <TextField
        id={name}
        name={name}
        label={label}
        error={error}
        value={value}
        onChange={onChange}
        //style={{ maxWidth: '255px' }}
      />
    )}
  />
);

export default TextFieldWrapper;
