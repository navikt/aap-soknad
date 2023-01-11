import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
import { addYears, isValid, parse, subYears } from 'date-fns';
import React from 'react';
import { Matcher } from 'react-day-picker';
import { Control, Controller, FieldValues, RegisterOptions } from 'react-hook-form';
import { FieldPath } from 'react-hook-form/dist/types';

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
            id={name}
            onChange={onChange}
            onSelect={onChange}
            {...datepickerProps}
            disableWeekends={disableWeekend}
            dropdownCaption
            fromDate={fromDate}
            toDate={toDate}
            disabled={disabled}
          >
            <UNSAFE_DatePicker.Input
              onChange={(datoInput) => {
                if (datoInput.currentTarget.value.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                  console.log('ser ut som en dato');
                  const parsedDate = parse(datoInput.currentTarget.value, 'dd.MM.yyyy', new Date());
                  console.log(parsedDate);
                  return parsedDate;
                }
              }}
              onInput={(datoInput) => {
                if (datoInput.currentTarget.value.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                  console.log('ser ut som en dato');
                  const parsedDate = parse(datoInput.currentTarget.value, 'dd.MM.yyyy', new Date());
                  console.log(parsedDate);
                  return parsedDate;
                }
              }}
              value={value}
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
