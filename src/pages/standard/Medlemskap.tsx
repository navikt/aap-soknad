import { BodyShort, Radio, Button, Table, BodyLong } from '@navikt/ds-react';
import React, { useState, useEffect } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, useFieldArray, UseFormWatch } from 'react-hook-form';
import countries from 'i18n-iso-countries';
import { JaEllerNei } from '../../types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger from './UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from '../../utils/date';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import SoknadStandard from '../../types/SoknadStandard';

interface TilknytningTilNorgeProps {
  watch: UseFormWatch<FieldValues>;
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
}
const UTENLANDSOPPHOLD = 'utenlandsOpphold';
const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';

export const Medlemskap = ({ getText, control, errors, watch }: TilknytningTilNorgeProps) => {
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const utenlandsOppholdFieldArray = useFieldArray({ name: UTENLANDSOPPHOLD, control });
  const boddINorge = watch(`${BODD_I_NORGE}`);
  const arbeidINorge = watch(`${ARBEID_I_NORGE}`);
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }));
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  return (
    <>
      <RadioGroupWrapper
        name={BODD_I_NORGE}
        legend={getText('form.utenlandsopphold.radiolegend')}
        control={control}
        error={errors?.[BODD_I_NORGE]?.message}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroupWrapper>
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
      {boddINorge === JaEllerNei.NEI && (
        <RadioGroupWrapper
          name={ARBEID_I_NORGE}
          legend={getText('form.utenlandsarbeid.radiolegend')}
          control={control}
          error={errors?.[ARBEID_I_NORGE]?.message}
        >
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroupWrapper>
      )}
      {arbeidINorge === JaEllerNei.NEI &&
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
      {arbeidINorge === JaEllerNei.NEI && (
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
