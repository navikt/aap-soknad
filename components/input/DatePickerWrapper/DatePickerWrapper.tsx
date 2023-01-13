import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import { addYears, parse, subYears } from 'date-fns';
import React from 'react';
import { Matcher } from 'react-day-picker';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

export interface DateProps<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  description?: React.ReactNode;
  disableWeekend?: boolean;
  selectedDate?: string | Date;
  control: Control<FormFieldValues>;
  fromDate?: Date;
  toDate?: Date;
  disabled?: Matcher[];
  dropdownCaption?: boolean;
}

const FRA_DATO = subYears(new Date(), 80);
const TIL_DATO = addYears(new Date(), 80);
export const DatePickerWrapper = <FormFieldValues extends FieldValues>({
  name,
  label,
  description,
  control,
  selectedDate,
  disableWeekend = false,
  fromDate = FRA_DATO,
  toDate = TIL_DATO,
  disabled,
  dropdownCaption = false,
}: DateProps<FormFieldValues>) => {
  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    defaultSelected: selectedDate ? new Date(selectedDate) : undefined,
    inputFormat: 'dd.MM.yyyy',
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange }, fieldState: { error } }) => {
        return (
          <UNSAFE_DatePicker
            {...datepickerProps}
            id={name}
            onChange={onChange}
            onSelect={onChange}
            disableWeekends={disableWeekend}
            dropdownCaption={dropdownCaption}
            fromDate={fromDate}
            toDate={toDate}
            disabled={disabled}
          >
            <UNSAFE_DatePicker.Input
              onChange={(datoInput) =>
                onChange(parse(datoInput.currentTarget.value, 'dd.MM.yyyy', new Date()))
              }
              onInput={(datoInput) =>
                onChange(parse(datoInput.currentTarget.value, 'dd.MM.yyyy', new Date()))
              }
              value={value ? value.toString() : ''}
              name={name}
              description={description}
              error={error && error.message}
              label={label}
              {...inputProps}
            />
          </UNSAFE_DatePicker>
        );
      }}
    />
  );
};
