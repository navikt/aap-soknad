import React, { useEffect, useMemo, useState } from 'react';
import countries from 'i18n-iso-countries';
import SelectWrapper from './SelectWrapper';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Soknad } from 'types/Soknad';

// Support norwegian & english languages.
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

interface Props<FormFieldValues extends FieldValues> {
  name: FieldPath<FormFieldValues>;
  label: string;
  className?: string;
  control: Control<FormFieldValues>;
}
const CountrySelector = <FormFieldValues extends FieldValues>({
  name,
  label,
  className,
  control,
}: Props<FormFieldValues>) => {
  const countryList = useMemo(() => {
    return Object.entries(countries.getNames('nb', { select: 'official' }))
      .filter((country) => country[0] !== 'NO' && country[0] !== 'SJ')
      .sort(
        (a, b) => (a[1] > b[1] ? 1 : -1) // Sorterer alfabetisk på navn i stedet for landkode
      );
  }, [countries]);

  return (
    <div className={className}>
      <SelectWrapper name={name} label={label} control={control}>
        {[
          <option key="none" value="none">
            Velg land
          </option>,
          ...countryList.map(([key, val]) => (
            <option key={key} value={`${key}:${val}`}>
              {val}
            </option>
          )),
        ]}
      </SelectWrapper>
    </div>
  );
};
export default CountrySelector;
