import { MonthPicker, useMonthpicker } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { parse } from 'date-fns';

export interface MonthPickerProps {
  name: string;
  onChange: (e: any) => void;
  label: string;
  selectedDate?: string | Date;
  fromDate?: Date;
  toDate?: Date;
  dropdownCaption?: boolean;
  error?: string;
}

export const MonthPickerWrapper = <FormFieldValues extends FieldValues>({
  name,
  label,
  selectedDate,
  onChange,
  dropdownCaption,
  fromDate,
  toDate,
  error,
}: MonthPickerProps) => {
  const { monthpickerProps, inputProps, selectedMonth } = useMonthpicker({
    defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
    inputFormat: 'MM.yyyy',
    onMonthChange: onChange,
  });
  return (
    <MonthPicker
      {...monthpickerProps}
      id={name}
      onInput={onChange}
      dropdownCaption={dropdownCaption}
      fromDate={fromDate}
      toDate={toDate}
    >
      <MonthPicker.Input
        id={name}
        name={name}
        error={error}
        onChange={(datoInput) =>
          onChange(parse(datoInput.currentTarget.value, 'dd.MM.yyyy', new Date()))
        }
        onInput={(datoInput) =>
          onChange(parse(datoInput.currentTarget.value, 'dd.MM.yyyy', new Date()))
        }
        label={label}
        {...inputProps}
      />
    </MonthPicker>
  );
};
