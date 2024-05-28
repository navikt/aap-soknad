import React, { ChangeEventHandler, useMemo } from 'react';
import countries from 'i18n-iso-countries';
import { Select } from '@navikt/ds-react';

// Support norwegian & english languages.
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

interface Props {
  name: string;
  label: string;
  value?: string;
  className?: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  error?: string;
}
const CountrySelector = ({ name, label, className, onChange, value, error }: Props) => {
  const countryList = useMemo(() => {
    return Object.entries(countries.getNames('nb', { select: 'official' }))
      .filter((country) => country[0] !== 'NO' && country[0] !== 'SJ')
      .sort(
        (a, b) => (a[1] > b[1] ? 1 : -1), // Sorterer alfabetisk på navn i stedet for landkode
      );
  }, [countries]);

  return (
    <div className={className}>
      <Select id={name} name={name} label={label} onChange={onChange} value={value} error={error}>
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
      </Select>
    </div>
  );
};
export default CountrySelector;
