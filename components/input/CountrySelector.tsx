import React, { useEffect, useState } from 'react';
import countries from 'i18n-iso-countries';
import SelectWrapper from './SelectWrapper';
import { Control } from 'react-hook-form';
import { Soknad } from 'types/Soknad';

// Support norwegian & english languages.
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

interface Props {
  name: string;
  label: string;
  error?: string;
  className?: string;
  control: Control<Soknad>;
}
const CountrySelector = ({ name, label, error, className, control }: Props) => {
  const [countryList, setCountryList] = useState<string[][]>([]);
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }))
        .filter((country) => country[0] !== 'NO' && country[0] !== 'SJ')
        .sort(
          (a, b) => (a[1] > b[1] ? 1 : -1) // Sorterer alfabetisk på navn i stedet for landkode
        );
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  return (
    <div className={className}>
      <SelectWrapper name={name} label={label} control={control} error={error}>
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
