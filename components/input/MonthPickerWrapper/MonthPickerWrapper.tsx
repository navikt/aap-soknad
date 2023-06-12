import { MonthPicker, useMonthpicker } from '@navikt/ds-react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { parse } from 'date-fns';

export interface MonthPickerProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  control: Control<FormFieldValues>;
  label: string;
  selectedDate?: string | Date;
  fromDate?: Date;
  toDate?: Date;
  dropdownCaption?: boolean;
}

export const MonthPickerWrapper = <FormFieldValues extends FieldValues>({
  name,
  label,
  selectedDate,
  control,
  dropdownCaption,
  fromDate,
  toDate,
}: MonthPickerProps<FormFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange }, fieldState: { error } }) => {
        const { monthpickerProps, inputProps, selectedMonth } = useMonthpicker({
          defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
          inputFormat: 'MM.yyyy',
          onMonthChange: onChange,
        });
        return (
          <MonthPicker
            {...monthpickerProps}
            id={name}
            onChange={onChange}
            onSelect={onChange}
            dropdownCaption={dropdownCaption}
            fromDate={fromDate}
            toDate={toDate}
          >
            <MonthPicker.Input
              id={name}
              name={name}
              error={error && error.message}
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
      }}
    />
  );
};
