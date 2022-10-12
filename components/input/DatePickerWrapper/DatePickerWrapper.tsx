import { Controller } from 'react-hook-form';
import { UNSAFE_DatePicker } from '@navikt/ds-react';

export interface DatePickerProps {
  name: string;
  label: string;
  control: any;
  description?: React.ReactChild | React.ReactChild[];
  error?: string;
  required?: string;
  validate?: () => any;
}

const DatePickerWrapper = ({ name, label, control, error }: DatePickerProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange } }) => (
        <UNSAFE_DatePicker>
          <UNSAFE_DatePicker.Input
            id={name}
            label={label}
            error={error}
            onChange={onChange}
            error={error}
          />
        </UNSAFE_DatePicker>
      )}
    />
  );
};

export default DatePickerWrapper;
