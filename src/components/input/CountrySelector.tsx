import React, { useEffect, useState } from 'react';
import countries from 'i18n-iso-countries';
import SelectWrapper from './SelectWrapper';
import { Control } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';

interface Props {
  name: string;
  label: string;
  error?: string;
  control: Control<SoknadStandard>;
}
const CountrySelector = ({ name, label, error, control }: Props) => {
  const [countryList, setCountryList] = useState<string[][]>([]);
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }));
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  return (
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
  );
};
export default CountrySelector;
