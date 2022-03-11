import { Controller } from 'react-hook-form';
import { ConfirmationPanel } from '@navikt/ds-react';
import React from 'react';

export interface ConfirmationPanelProps {
  name: string;
  label: string;
  control: any;
  error: string;
}
const ConfirmationPanelWrapper = ({ label, control, error, name }: ConfirmationPanelProps) => (
  <Controller
    name={name}
    control={control}
    defaultValue={false}
    render={({ field: { name, value, onChange } }) => (
      <ConfirmationPanel
        id={name}
        name={name}
        label={label}
        checked={value}
        onChange={onChange}
        error={!!error}
      />
    )}
  />
);

export default ConfirmationPanelWrapper;
