import { UNSAFE_MonthPicker, UNSAFE_useMonthpicker } from '@navikt/ds-react';
import { useEffect } from 'react';

export interface MonthPickerProps {
  name: string;
  label: string;
  setValue: any;
  fromDate?: Date;
  toDate?: Date;
  error?: string;
}

export const MonthPickerWrapper = ({
  name,
  label,
  setValue,
  fromDate,
  toDate,
  error,
}: MonthPickerProps) => {
  const { monthpickerProps, inputProps, selectedMonth } = UNSAFE_useMonthpicker({
    fromDate: fromDate,
    toDate: toDate,
  });

  useEffect(() => {
    setValue(name, selectedMonth);
  }, [selectedMonth]);

  return (
    <UNSAFE_MonthPicker {...monthpickerProps} dropdownCaption={fromDate && toDate ? true : false}>
      <UNSAFE_MonthPicker.Input {...inputProps} id={name} label={label} error={error} />
    </UNSAFE_MonthPicker>
  );
};
