import React from 'react';
import { RadioGroup } from '@navikt/ds-react';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import * as classes from './RadioGroupWrapper.module.css';

export interface RadioProps<T> extends UseControllerProps<T> {
  legend?: string;
  description?: string;
  error?: string;
  children?: React.ReactChild | React.ReactChild[];
}
const RadioGroupWrapper = <T extends FieldValues>({
  children,
  name,
  legend,
  description,
  control,
  error,
}: RadioProps<T>) => (
  <Controller
    name={name}
    control={control}
    // @ts-ignore
    defaultValue={null}
    render={({ field: { value, onChange } }) => (
      <RadioGroup
        id={name}
        value={value}
        name={name}
        legend={legend}
        description={description}
        error={error}
        onChange={onChange}
        className={classes?.fieldsetFocus}
        tabIndex={-1}
      >
        {children}
      </RadioGroup>
    )}
  />
);
export default RadioGroupWrapper;
