import { UNSAFE_MonthPicker, UNSAFE_useMonthpicker } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

export interface MonthPickerProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  selectedDate?: string | Date;
  fromDate?: Date;
  toDate?: Date;
  control: Control<FormFieldValues>;
}

export const MonthPickerWrapper = <FormFieldValues extends FieldValues>({
  name,
  label,
  selectedDate,
  fromDate,
  toDate,
  control,
}: MonthPickerProps<FormFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange }, fieldState: { error } }) => {
        const { monthpickerProps, inputProps } = UNSAFE_useMonthpicker({
          defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
          inputFormat: 'MM.yyyy',
          onMonthChange: (date) => {
            onChange(date);
          },
        });

        return (
          <UNSAFE_MonthPicker
            {...monthpickerProps}
            id={name}
            fromDate={fromDate}
            toDate={toDate}
            selected={value}
          >
            <UNSAFE_MonthPicker.Input
              id={name}
              name={name}
              error={error && error.message}
              label={label}
              value={value ? value.toString() : ''}
              {...inputProps}
            />
          </UNSAFE_MonthPicker>
        );
      }}
    />
  );
};
