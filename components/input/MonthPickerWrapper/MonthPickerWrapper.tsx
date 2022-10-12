import { UNSAFE_MonthPicker } from '@navikt/ds-react';
import { Controller } from 'react-hook-form';

export interface MonthPickerProps {
  name: string;
  label: string;
  control: any;
  error?: string;
}

export const MonthPickerWrapper = ({ name, label, control, error }: MonthPickerProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange } }) => (
        <UNSAFE_MonthPicker>
          <UNSAFE_MonthPicker.Input
            id={name}
            label={label}
            error={error}
            value={value}
            onChange={onChange}
          />
        </UNSAFE_MonthPicker>
      )}
    />
  );
};
