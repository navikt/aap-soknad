import '@navikt/ds-datepicker/lib/index.css';
import { Datepicker } from '@navikt/ds-datepicker';
import { Controller } from 'react-hook-form';
import { DatoVelgerProps } from '../DatoVelgerWrapper';

const DatePickerWrapper = ({ name, label, control, error }: DatoVelgerProps) => {
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
