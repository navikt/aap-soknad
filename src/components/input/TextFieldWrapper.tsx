import React from 'react';
import { TextField } from '@navikt/ds-react';
import { Control, Controller, FieldValues } from 'react-hook-form';

export interface TextFieldProps {
  name: string;
  label: string;
  error?: string;
  className?: string;
  control: Control<FieldValues>;
}

const TextFieldWrapper = ({ name, label, control, error, className }: TextFieldProps) => (
  <div className={className}>
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
  </div>
);

export default TextFieldWrapper;
