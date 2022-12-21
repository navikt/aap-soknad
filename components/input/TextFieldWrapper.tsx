import React from 'react';
import { TextField } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

export interface TextFieldProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  description?: string;
  error?: string;
  className?: string;
  control: Control<FormFieldValues>;
}

const TextFieldWrapper = <FormFieldIds extends FieldValues>({
  name,
  label,
  description,
  control,
  error,
  className,
}: TextFieldProps<FormFieldIds>) => (
  <div className={className}>
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange } }) => (
        <TextField
          id={name}
          name={name}
          label={label}
          description={description}
          error={error}
          value={value || ''}
          onChange={onChange}
          //style={{ maxWidth: '255px' }}
        />
      )}
    />
  </div>
);

export default TextFieldWrapper;
