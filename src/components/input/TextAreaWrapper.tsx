import React from 'react';
import { Textarea } from '@navikt/ds-react';
import { Control, Controller, FieldValues } from 'react-hook-form';

export interface TextAreaProps {
  name: string;
  description?: string;
  label: string;
  error?: string;
  control: Control<FieldValues>;
}

const TextAreaWrapper = ({ name, description, label, control, error }: TextAreaProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange } }) => (
      <Textarea
        label={label}
        description={description}
        value={value}
        onChange={onChange}
        error={error}
        name={name}
      />
    )}
  />
);

export default TextAreaWrapper;
