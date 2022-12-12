import React from 'react';
import { TextField } from '@navikt/ds-react';
import { Control, Controller, FieldValues } from 'react-hook-form';

export interface TextFieldProps {
  name: string;
  label: string;
  description?: string;
  error?: string;
  className?: string;
  control: Control<FieldValues>;
}

const TextFieldWrapper = ({
  name,
  label,
  description,
  control,
  error,
  className,
}: TextFieldProps) => (
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
          description={description}
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
