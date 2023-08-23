import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { addYears, subYears } from 'date-fns';
import React from 'react';
import { Matcher } from 'react-day-picker';
import { FieldPath, FieldValues } from 'react-hook-form';

export interface DateProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  description?: React.ReactNode;
  disableWeekend?: boolean;
  selectedDate?: Date | null;
  fromDate?: Date;
  toDate?: Date;
  disabled?: Matcher[];
  dropdownCaption?: boolean;
  onChange: (date?: Date) => void;
  error?: string;
  id: string;
}

const FRA_DATO = subYears(new Date(), 80);
const TIL_DATO = addYears(new Date(), 80);
export const DatePickerWrapper = <FormFieldValues extends FieldValues>({
  name,
  label,
  description,
  selectedDate,
  disableWeekend = false,
  fromDate = FRA_DATO,
  toDate = TIL_DATO,
  disabled,
  dropdownCaption = false,
  onChange,
  error,
  id,
}: DateProps<FormFieldValues>) => {
  const { datepickerProps, inputProps } = useDatepicker({
    defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
    inputFormat: 'dd.MM.yyyy',
    fromDate: fromDate,
    toDate: toDate,
    onDateChange: onChange,
    disableWeekends: disableWeekend,
    disabled: disabled,
  });

  return (
    <DatePicker {...datepickerProps} id={name} dropdownCaption={dropdownCaption}>
      <DatePicker.Input
        label={label}
        {...inputProps}
        error={error}
        description={description}
        id={id}
      />
    </DatePicker>
  );
};
