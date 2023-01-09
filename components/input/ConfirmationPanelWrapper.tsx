import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { ConfirmationPanel } from '@navikt/ds-react';
import React, { ReactNode } from 'react';

export interface ConfirmationPanelProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  control: Control<FormFieldValues>;
  children?: ReactNode;
}
const ConfirmationPanelWrapper = <FormFieldValues extends FieldValues>({
  children,
  label,
  control,
  name,
}: ConfirmationPanelProps<FormFieldValues>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange }, fieldState: { error } }) => (
      <ConfirmationPanel
        id={name}
        name={name}
        label={label}
        checked={value || false}
        onChange={onChange}
        error={!!error && error.message}
      >
        {children}
      </ConfirmationPanel>
    )}
  />
);

export default ConfirmationPanelWrapper;
