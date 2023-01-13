import React from 'react';
import { Textarea } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

export interface TextAreaProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  description?: string;
  label: string;
  control: Control<FormFieldValues>;
  maxLength?: number;
}

const TextAreaWrapper = <FormFieldValues extends FieldValues>({
  name,
  description,
  label,
  control,
  maxLength,
}: TextAreaProps<FormFieldValues>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange }, fieldState: { error } }) => (
      <Textarea
        id={name}
        label={label}
        description={description}
        value={value}
        onChange={onChange}
        error={error?.message}
        name={name}
        maxLength={maxLength}
      />
    )}
  />
);
export default TextAreaWrapper;
