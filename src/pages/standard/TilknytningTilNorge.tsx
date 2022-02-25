import { BodyShort, Heading, RadioGroup, Radio, Button, Label, Checkbox } from '@navikt/ds-react';
import React, { useState, useEffect } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, useFieldArray } from 'react-hook-form';
import ControlDatoVelger from '../../components/input/ControlDatoVelger';
import ControlSelect from '../../components/input/ControlSelect';
import countries from 'i18n-iso-countries';

interface TilknytningTilNorgeProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
}
enum JaEllerNei {
  JA = 'ja',
  NEI = 'nei',
}
const fieldArrayDefault = {
  land: 'none',
  framåned: 'none',
  fraår: 'none',
  tilmåned: 'none',
  tilår: 'none',
};

export const TilknytningTilNorge = ({ getText, errors, control }: TilknytningTilNorgeProps) => {
  const [opphold, setOpphold] = useState<JaEllerNei>(JaEllerNei.JA);
  const [arbeid, setArbeid] = useState<JaEllerNei>(JaEllerNei.NEI);
  const [months, setMonths] = useState<Array<string>>([]);
  const [years, setYears] = useState<Array<number>>([]);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const utenlandsOppholdFieldArray = useFieldArray({ name: 'utenlandsopphold', control });
  const utenlandsarbeidFieldArray = useFieldArray({ name: 'utenlandsarbeid', control });
  const monthNames = () => {
    return Array.from(Array(12)).map((val, index) => {
      const month = new Date(new Date().getFullYear(), index);
      const monthName = month.toLocaleString('default', { month: 'long' });
      return `${monthName[0].toUpperCase()}${monthName.slice(1)}`;
    });
  };
  const yearNames = () => {
    const todayYear = new Date().getFullYear();
    return Array.from(Array(10)).map((val, index) =>
      new Date(todayYear - index, 0, 1).getFullYear()
    );
  };
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }));
      setCountryList(list);
      setYears(yearNames());
    };
    getCountries();
    setMonths(monthNames());
  }, [setCountryList]);
  return (
    <>
      <Heading size={'small'} level={'3'}>
        {getText('steps.tilknytning_til_norge.opphold.title')}
      </Heading>
      <BodyShort>{getText('steps.tilknytning_til_norge.opphold.ingress')}</BodyShort>
      <RadioGroup
        value={opphold}
        onChange={(val) => {
          setOpphold(val as JaEllerNei);
          if (val === JaEllerNei.NEI && utenlandsOppholdFieldArray?.fields?.length < 1) {
            console.log('append');
            utenlandsOppholdFieldArray?.append({ ...fieldArrayDefault });
          }
        }}
        legend={getText('form.utenlandsopphold.radiolegend')}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroup>
      {opphold === JaEllerNei.NEI &&
        utenlandsOppholdFieldArray?.fields?.map((field, index) => (
          <div key={field.id}>
            <ControlSelect
              name={`utenlandsopphold.${index}.land`}
              label={getText('form.utenlandsopphold.land.label')}
              control={control}
              error={errors.utenlandsopphold?.[index]?.land?.message}
            >
              {[
                <option key="none" value="none">
                  Velg land
                </option>,
                ...countryList.map(([key, val]) => (
                  <option key={key} value={key}>
                    {val}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsopphold.${index}.framåned`}
              label={getText('form.utenlandsopphold.framåned.label')}
              control={control}
              error={errors.utenlandsopphold?.[index]?.framåned?.message}
            >
              {[
                <option key="none" value="none">
                  Velg måned
                </option>,
                ...months.map((monthName, index) => (
                  <option key={`${index}`} value={monthName}>
                    {monthName}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsopphold.${index}.fraår`}
              label={getText('form.utenlandsopphold.fraår.label')}
              control={control}
              error={errors.utenlandsopphold?.[index]?.fraår?.message}
            >
              {[
                <option key="none" value="none">
                  Velg år
                </option>,
                ...years.map((year, index) => (
                  <option key={`${index}`} value={year}>
                    {year}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsopphold.${index}.tilmåned`}
              label={getText('form.utenlandsopphold.tilmåned.label')}
              control={control}
              error={errors.utenlandsopphold?.[index]?.tilmåned?.message}
            >
              {[
                <option key="none" value="none">
                  Velg måned
                </option>,
                ...months.map((monthName, index) => (
                  <option key={`${index}`} value={monthName}>
                    {monthName}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsopphold.${index}.tilår`}
              label={getText('form.utenlandsopphold.tilår.label')}
              control={control}
              error={errors.utenlandsopphold?.[index]?.tilår?.message}
            >
              {[
                <option key="none" value="none">
                  Velg år
                </option>,
                ...years.map((year, index) => (
                  <option key={`${index}`} value={year}>
                    {year}
                  </option>
                )),
              ]}
            </ControlSelect>
            <Button
              variant="primary"
              type="button"
              onClick={() => utenlandsOppholdFieldArray?.append({ ...fieldArrayDefault })}
            >
              Legg til periode
            </Button>
          </div>
        ))}
      <Heading size={'small'} level={'3'}>
        {getText('steps.tilknytning_til_norge.arbeid.title')}
      </Heading>
      <BodyShort>{getText('steps.tilknytning_til_norge.arbeid.ingress')}</BodyShort>
      <RadioGroup
        value={arbeid}
        onChange={(val) => {
          setArbeid(val as JaEllerNei);
          if (val === JaEllerNei.JA && utenlandsarbeidFieldArray?.fields?.length < 1) {
            console.log('append');
            utenlandsarbeidFieldArray?.append({ ...fieldArrayDefault });
          }
        }}
        legend={getText('form.utenlandsarbeid.radiolegend')}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroup>
      {arbeid === JaEllerNei.JA &&
        utenlandsarbeidFieldArray?.fields?.map((field, index) => (
          <div key={field.id}>
            <ControlSelect
              name={`utenlandsarbeid.${index}.land`}
              label={getText('form.utenlandsarbeid.land.label')}
              control={control}
              error={errors.utenlandsarbeid?.[index]?.land?.message}
            >
              {[
                <option key="none" value="none">
                  Velg land
                </option>,
                ...countryList.map(([key, val]) => (
                  <option key={key} value={key}>
                    {val}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsarbeid.${index}.framåned`}
              label={getText('form.utenlandsarbeid.framåned.label')}
              control={control}
              error={errors.utenlandsarbeid?.[index]?.framåned?.message}
            >
              {[
                <option key="none" value="none">
                  Velg måned
                </option>,
                ...months.map((monthName, index) => (
                  <option key={`${index}`} value={monthName}>
                    {monthName}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsarbeid.${index}.fraår`}
              label={getText('form.utenlandsarbeid.fraår.label')}
              control={control}
              error={errors.utenlandsarbeid?.[index]?.fraår?.message}
            >
              {[
                <option key="none" value="none">
                  Velg år
                </option>,
                ...years.map((year, index) => (
                  <option key={`${index}`} value={year}>
                    {year}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsarbeid.${index}.tilmåned`}
              label={getText('form.utenlandsarbeid.tilmåned.label')}
              control={control}
              error={errors.utenlandsarbeid?.[index]?.tilmåned?.message}
            >
              {[
                <option key="none" value="none">
                  Velg måned
                </option>,
                ...months.map((monthName, index) => (
                  <option key={`${index}`} value={monthName}>
                    {monthName}
                  </option>
                )),
              ]}
            </ControlSelect>
            <ControlSelect
              name={`utenlandsarbeid.${index}.tilår`}
              label={getText('form.utenlandsarbeid.tilår.label')}
              control={control}
              error={errors.utenlandsarbeid?.[index]?.tilår?.message}
            >
              {[
                <option key="none" value="none">
                  Velg år
                </option>,
                ...years.map((year, index) => (
                  <option key={`${index}`} value={year}>
                    {year}
                  </option>
                )),
              ]}
            </ControlSelect>
            <Button
              variant="primary"
              type="button"
              onClick={() => utenlandsarbeidFieldArray?.append({ ...fieldArrayDefault })}
            >
              Legg til periode
            </Button>
          </div>
        ))}
    </>
  );
};
