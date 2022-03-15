import {
  BodyShort,
  Heading,
  RadioGroup,
  Radio,
  Button,
  Ingress,
  Table,
  BodyLong,
} from '@navikt/ds-react';
import React, { useState, useEffect } from 'react';
import { GetText } from '../../hooks/useTexts';
import { FieldErrors, useFieldArray, useFormContext } from 'react-hook-form';
import countries from 'i18n-iso-countries';
import { JaEllerNei } from '../../types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger, {
  UtenlandsPeriode,
} from './UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from '../../utils/date';

interface TilknytningTilNorgeProps {
  getText: GetText;
  errors: FieldErrors;
}
const UTENLANDSOPPHOLD = 'utenlandsOpphold';
type Utenlandsopphold = {
  [UTENLANDSOPPHOLD]: UtenlandsPeriode[];
};

export const Medlemskap = ({ getText }: TilknytningTilNorgeProps) => {
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const [opphold, setOpphold] = useState<JaEllerNei>(JaEllerNei.JA);
  const [arbeid, setArbeid] = useState<JaEllerNei>(JaEllerNei.JA);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const { control } = useFormContext<Utenlandsopphold>();
  const utenlandsOppholdFieldArray = useFieldArray({ name: UTENLANDSOPPHOLD, control });
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }));
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  return (
    <>
      <Heading size={'small'} level={'2'}>
        {getText('steps.tilknytningTilNorge.heading')}
      </Heading>
      <Ingress>{getText('steps.tilknytningTilNorge.opphold.ingress')}</Ingress>
      <RadioGroup
        value={opphold}
        onChange={(val) => {
          setOpphold(val as JaEllerNei);
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
      <UtenlandsPeriodeVelger
        open={showUtenlandsPeriodeModal}
        onSave={(data) => {
          utenlandsOppholdFieldArray.append({ ...data });
          setShowUtenlandsPeriodeModal(false);
        }}
        onCancel={() => setShowUtenlandsPeriodeModal(false)}
        onClose={() => setShowUtenlandsPeriodeModal(false)}
        getText={getText}
        options={countryList}
        heading={getText('steps.medlemskap.utenlandsPeriode.title')}
        ingress={getText('steps.medlemskap.utenlandsPeriode.ingress')}
      />
      {opphold === JaEllerNei.NEI && (
        <RadioGroup
          value={arbeid}
          onChange={(val) => {
            setArbeid(val as JaEllerNei);
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
      )}
      {arbeid === JaEllerNei.NEI &&
        utenlandsOppholdFieldArray?.fields?.map((field, index) => (
          <Table.Row key={field.id}>
            <Table.DataCell>{`${field?.land.split(':')?.[1]} ${formatDate(
              field?.fraDato,
              'dd.MM.yyyy'
            )} - ${formatDate(field?.tilDato, 'dd.MM.yyyy')}${
              field?.iArbeid ? '(Jobb)' : ''
            }`}</Table.DataCell>
            <Table.DataCell>
              {<Delete onClick={() => utenlandsOppholdFieldArray.remove(index)} />}
            </Table.DataCell>
          </Table.Row>
        ))}
      {arbeid === JaEllerNei.NEI && (
        <>
          <BodyLong>{getText('steps.medlemskap.utenlandsPeriode.info')}</BodyLong>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setShowUtenlandsPeriodeModal(true)}
          >
            <Add />
            Legg til periode
          </Button>
        </>
      )}
    </>
  );
};
