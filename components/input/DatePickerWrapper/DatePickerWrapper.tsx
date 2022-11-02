import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import { useEffect } from 'react';

export interface DatePickerProps {
  name: string;
  label: string;
  selectedDate?: string | Date;
  setValue: any;
  fromDate?: Date;
  toDate?: Date;
  error?: string;
}

const DatePickerWrapper = ({
  name,
  label,
  selectedDate,
  setValue,
  fromDate,
  toDate,
  error,
}: DatePickerProps) => {
  const { datepickerProps, inputProps, selectedDay } = UNSAFE_useDatepicker({
    defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
    fromDate: fromDate,
    toDate: toDate,
    inputFormat: 'dd.MM.yyyy',
  });

  useEffect(() => {
    setValue(name, selectedDay);
  }, [selectedDay]);

  return (
    <UNSAFE_DatePicker {...datepickerProps} dropdownCaption={fromDate && toDate ? true : false}>
      <UNSAFE_DatePicker.Input {...inputProps} id={name} label={label} error={error} />
    </UNSAFE_DatePicker>
  );
};

export default DatePickerWrapper;
