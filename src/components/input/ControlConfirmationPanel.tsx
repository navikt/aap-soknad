import { Controller } from 'react-hook-form';
import { ConfirmationPanel } from '@navikt/ds-react';
import React from 'react';

export interface ConfirmationPanelProps {
  name: string;
  label: string;
  control: any;
  error: string;
}
const ControlConfirmationPanel = ({ label, control, error, name }: ConfirmationPanelProps) => (
  <Controller
    name={name}
    control={control}
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

export default ControlConfirmationPanel;
