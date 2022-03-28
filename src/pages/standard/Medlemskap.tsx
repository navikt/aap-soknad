import { BodyShort, Radio, Button, Table, BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import React, { useState, useEffect } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, useFieldArray, UseFormWatch } from 'react-hook-form';
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
  setValue: any;
  pageTitle?: string;
}
const UTENLANDSOPPHOLD = 'utenlandsOpphold';
const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';
const MEDLEMSKAP = 'medlemskap';

export const Medlemskap = ({
  getText,
  control,
  errors,
  watch,
  setValue,
  pageTitle,
}: TilknytningTilNorgeProps) => {
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const utenlandsOppholdFieldArray = useFieldArray({
    name: `${MEDLEMSKAP}.${UTENLANDSOPPHOLD}`,
    control,
  });
  const arbeidINorge = watch(`${MEDLEMSKAP}.${ARBEID_I_NORGE}.value`);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${BODD_I_NORGE}.label`, getText('form.utenlandsopphold.radiolegend'));
    setValue(`${MEDLEMSKAP}.${ARBEID_I_NORGE}.label`, getText('form.utenlandsarbeid.radiolegend'));
  }, [getText]);
  return (
    <>
      <GuidePanel>
        <BodyLong>{getText(`steps.medlemskap.guide`)}</BodyLong>
      </GuidePanel>
      <Heading size="large" level="2">
        {pageTitle}
      </Heading>
      <RadioGroupWrapper
        name={`${MEDLEMSKAP}.${BODD_I_NORGE}.value`}
        legend={getText('form.utenlandsopphold.radiolegend')}
        control={control}
        error={errors?.[MEDLEMSKAP]?.[BODD_I_NORGE]?.message}
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
        heading={getText('steps.medlemskap.utenlandsPeriode.title')}
        ingress={getText('steps.medlemskap.utenlandsPeriode.ingress')}
      />
      <RadioGroupWrapper
        name={`${MEDLEMSKAP}.${ARBEID_I_NORGE}.value`}
        legend={getText('form.utenlandsarbeid.radiolegend')}
        control={control}
        error={errors?.[MEDLEMSKAP]?.[ARBEID_I_NORGE]?.message}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroupWrapper>

      {arbeidINorge === JaEllerNei.NEI &&
        utenlandsOppholdFieldArray?.fields?.map((field, index) => (
          <Table.Row key={field.id}>
            <Table.DataCell>{`${field?.land?.value?.split(':')?.[1]} ${formatDate(
              field?.fraDato?.value,
              'dd.MM.yyyy'
            )} - ${formatDate(field?.tilDato?.value, 'dd.MM.yyyy')}${
              field?.iArbeid?.value ? '(Jobb)' : ''
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
