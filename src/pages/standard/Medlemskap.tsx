import {
  BodyShort,
  Radio,
  Button,
  Table,
  BodyLong,
  GuidePanel,
  Heading,
  ReadMore,
} from '@navikt/ds-react';
import React, { useState, useEffect, useMemo } from 'react';
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
const ARBEID_UTENFOR_NORGE_FØR_SYKDOM = 'arbeidetUtenforNorgeFørSykdom';
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
  const boddINorge = watch(`${MEDLEMSKAP}.${BODD_I_NORGE}.value`);
  const arbeidINorge = watch(`${MEDLEMSKAP}.${ARBEID_I_NORGE}.value`);
  const arbeidUtenforNorge = watch(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.value`);
  const hideArbeidInUtenlandsPeriode = useMemo(() => {
    if (boddINorge === JaEllerNei.NEI && arbeidINorge === JaEllerNei.NEI) {
      return false;
    }
    return true;
  }, [boddINorge, arbeidINorge]);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${BODD_I_NORGE}.label`, getText('form.medlemskap.boddINorge.legend'));
  }, [getText]);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.value`, undefined);
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.label`, undefined);
    setValue(`${MEDLEMSKAP}.${ARBEID_I_NORGE}.value`, undefined);
    setValue(`${MEDLEMSKAP}.${ARBEID_I_NORGE}.label`, undefined);
  }, [boddINorge]);
  useEffect(() => {
    if (arbeidINorge)
      setValue(
        `${MEDLEMSKAP}.${ARBEID_I_NORGE}.label`,
        getText('form.medlemskap.arbeidINorge.legend')
      );
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.value`, undefined);
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.label`, undefined);
  }, [arbeidINorge]);
  useEffect(() => {
    if (arbeidUtenforNorge)
      setValue(
        `${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.label`,
        getText('form.medlemskap.arbeidUtenforNorge.legend')
      );
  }, [arbeidUtenforNorge]);
  return (
    <>
      <Heading size="large" level="2">
        {pageTitle}
      </Heading>
      <GuidePanel>
        {getText(`steps.medlemskap.guide`)}
        <ul>
          <li>{getText('steps.medlemskap.guideBullet1')}</li>
          <li>{getText('steps.medlemskap.guideBullet2')}</li>
        </ul>
      </GuidePanel>
      <RadioGroupWrapper
        name={`${MEDLEMSKAP}.${BODD_I_NORGE}.value`}
        legend={getText('form.medlemskap.boddINorge.legend')}
        control={control}
        error={errors?.[MEDLEMSKAP]?.[BODD_I_NORGE]?.message}
      >
        <ReadMore header={'Hva menes med å ha "bodd sammenhengende"?'} type={'button'}>
          Dette betyr at du både
          <ul>
            <li>har hatt folkeregistrert adresse i Norge, og</li>
            <li>har oppholdt deg i Norge mesteparten av hver av disse årene</li>
          </ul>
        </ReadMore>
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {boddINorge === JaEllerNei.NEI && (
        <RadioGroupWrapper
          name={`${MEDLEMSKAP}.${ARBEID_I_NORGE}.value`}
          legend={getText('form.medlemskap.arbeidINorge.legend')}
          control={control}
          error={errors?.[MEDLEMSKAP]?.[ARBEID_I_NORGE]?.message}
        >
          <ReadMore
            header={
              'Hva hvis jeg har fått dagpenger, sykepenger, foreldrepenger eller tilsvarende?'
            }
            type={'button'}
          >
            Med “jobb” menes også offentlige ytelser du har fått som erstatning for arbeid, for
            eksempel dagpenger, sykepenger og foreldrepenger. Pensjon regnes ikke som erstatning for
            jobb.
          </ReadMore>
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroupWrapper>
      )}
      {(boddINorge === JaEllerNei.JA || arbeidINorge === JaEllerNei.JA) && (
        <RadioGroupWrapper
          name={`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}.value`}
          legend={getText('form.medlemskap.arbeidUtenforNorge.legend')}
          control={control}
          error={errors?.[MEDLEMSKAP]?.[ARBEID_UTENFOR_NORGE_FØR_SYKDOM]?.message}
        >
          <ReadMore
            header={getText('form.medlemskap.arbeidUtenforNorge.readMore.header')}
            type={'button'}
          >
            <BodyLong>{getText('form.medlemskap.arbeidUtenforNorge.readMore.text')}</BodyLong>
          </ReadMore>
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroupWrapper>
      )}
      <UtenlandsPeriodeVelger
        open={showUtenlandsPeriodeModal}
        onSave={(data) => {
          utenlandsOppholdFieldArray.append({ ...data });
          setShowUtenlandsPeriodeModal(false);
        }}
        hideIArbeid={hideArbeidInUtenlandsPeriode}
        onCancel={() => setShowUtenlandsPeriodeModal(false)}
        onClose={() => setShowUtenlandsPeriodeModal(false)}
        getText={getText}
        heading={getText('steps.medlemskap.utenlandsPeriode.title')}
      />

      {arbeidUtenforNorge === JaEllerNei.JA &&
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
      {(arbeidUtenforNorge === JaEllerNei.JA || arbeidINorge === JaEllerNei.NEI) && (
        <>
          <BodyLong>
            {boddINorge === JaEllerNei.JA && arbeidUtenforNorge === JaEllerNei.JA
              ? getText('steps.medlemskap.utenlandsPeriode.infoJaJa')
              : getText('steps.medlemskap.utenlandsPeriode.info')}
          </BodyLong>
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
