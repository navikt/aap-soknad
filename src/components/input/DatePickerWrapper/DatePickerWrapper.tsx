import '@navikt/ds-datepicker/lib/index.css';
import { Datepicker } from '@navikt/ds-datepicker';
import { Controller } from 'react-hook-form';

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
        <Datepicker
          locale={'nb'}
          inputName={name}
          id={name}
          label={label}
          value={value}
          //error={error}
          onChange={onChange}
          inputProps={{
            'aria-invalid': !!error,
          }}
          calendarSettings={{ showWeekNumbers: false }}
          showYearSelector={true}
          limitations={{
            weekendsNotSelectable: false,
          }}
        />
      )}
    />
  );
};

export default DatePickerWrapper;
