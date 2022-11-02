import { MonthValidationT, UNSAFE_MonthPicker, UNSAFE_useMonthpicker } from '@navikt/ds-react';
import { useEffect } from 'react';

export interface MonthPickerProps {
  name: string;
  label: string;
  selectedDate?: string | Date;
  setValue: any;
  fromDate?: Date;
  toDate?: Date;
  error?: string;
}

export const MonthPickerWrapper = ({
  name,
  label,
  selectedDate,
  setValue,
  fromDate,
  toDate,
  error,
}: MonthPickerProps) => {
  const { monthpickerProps, inputProps, selectedMonth } = UNSAFE_useMonthpicker({
    defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
    //fromDate: fromDate,
    //toDate: toDate,
    inputFormat: 'MM.yyyy',
  });

  useEffect(() => {
    setValue(name, selectedMonth);
  }, [selectedMonth]);

  return (
    <UNSAFE_MonthPicker {...monthpickerProps}>
      <UNSAFE_MonthPicker.Input {...inputProps} id={name} label={label} error={error} />
    </UNSAFE_MonthPicker>
  );
};
