import { Alert, BodyShort, Checkbox, Radio } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form';
import CheckboxGroupWrapper from '../../components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import DatoVelgerWrapper from '../../components/input/DatoVelgerWrapper';

interface AndreUtbetalingerProps {
  watch: UseFormWatch<FieldValues>;
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
}
enum JaNeiVetikke {
  JA = 'JA',
  NEI = 'NEI',
  VET_IKKE = 'VET_IKKE',
}
enum Ferie {
  JA_DATOER = 'JA_DATOER',
  JA_DAGER = 'JA_DAGER',
  NEI = 'NEI',
  VET_IKKE = 'VET_IKKE',
}
enum Utbetalingsmåte {
  ENGANGSBELØP = 'ENGANGSBELØP',
  LØPENDE = 'LØPENDE',
}

export const AndreUtbetalinger = ({ getText, errors, control, watch }: AndreUtbetalingerProps) => {
  const lønnEllerSykepenger = watch('lønnEllerSykepenger');
  const feriePlaner = watch('ferie.harPlaner');
  const fårAndreGoder = watch('andreGoder.fårAndreGoder');
  return (
    <>
      <BodyShort>{getText('steps.andre_utbetalinger.ingress')}</BodyShort>
      <CheckboxGroupWrapper
        name={'andreutbetalinger'}
        control={control}
        size="medium"
        legend={getText('form.andreutbetalinger.legend')}
      >
        <Checkbox value="Kvalifiseringsstønad">
          {getText('form.andreutbetalinger.kvalifiseringsstønad')}
        </Checkbox>
        <Checkbox value="sosialhjelp">{getText('form.andreutbetalinger.sosialhjelp')}</Checkbox>
        <Checkbox value="introduksjonsstønad">
          {getText('form.andreutbetalinger.introduksjonsstønad')}
        </Checkbox>
        <Checkbox value="omsorgsstønad">{getText('form.andreutbetalinger.omsorgsstønad')}</Checkbox>
        <Checkbox value="forsterhjemsgodtgjørelse">
          {getText('form.andreutbetalinger.forsterhjemsgodtgjørelse')}
        </Checkbox>
        <Checkbox value="verv">{getText('form.andreutbetalinger.verv')}</Checkbox>
        <Checkbox value="utland">{getText('form.andreutbetalinger.utland')}</Checkbox>
        <Checkbox value="annet">{getText('form.andreutbetalinger.annet')}</Checkbox>
        <Checkbox value="nei">{getText('form.andreutbetalinger.nei')}</Checkbox>
      </CheckboxGroupWrapper>
      <RadioGroupWrapper
        legend={getText('form.lønnellersykepenger.legend')}
        name={'lønnEllerSykepenger'}
        control={control}
        error={errors?.lønnEllerSykepenger?.message}
      >
        <Radio value={JaNeiVetikke.JA}>
          <BodyShort>{getText('form.lønnellersykepenger.ja')}</BodyShort>
        </Radio>
        <Radio value={JaNeiVetikke.NEI}>
          <BodyShort>{getText('form.lønnellersykepenger.nei')}</BodyShort>
        </Radio>
        <Radio value={JaNeiVetikke.VET_IKKE}>
          <BodyShort>{getText('form.lønnellersykepenger.vetikke')}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {lønnEllerSykepenger === JaNeiVetikke.JA && (
        <RadioGroupWrapper
          legend={getText('form.ferie.legend')}
          name={'ferie.harPlaner'}
          control={control}
          error={errors?.ferie?.message}
        >
          <Radio value={Ferie.JA_DATOER}>
            <BodyShort>{getText('form.ferie.ja_datoer')}</BodyShort>
          </Radio>
          <Radio value={Ferie.JA_DAGER}>
            <BodyShort>{getText('form.ferie.ja_dager')}</BodyShort>
          </Radio>
          <Radio value={Ferie.NEI}>
            <BodyShort>{getText('form.ferie.nei')}</BodyShort>
          </Radio>
          <Radio value={Ferie.VET_IKKE}>
            <BodyShort>{getText('form.ferie.vetikke')}</BodyShort>
          </Radio>
        </RadioGroupWrapper>
      )}
      {lønnEllerSykepenger === JaNeiVetikke.JA && feriePlaner === Ferie.JA_DATOER && (
        <>
          <DatoVelgerWrapper
            name="ferie.fromdate"
            label={getText('form.ferie.fromdate.label')}
            control={control}
            error={errors.ferie?.fromdate?.message}
          />
          <DatoVelgerWrapper
            name="ferie.todate"
            label={getText('form.ferie.todate.label')}
            control={control}
            error={errors.ferie?.todate?.message}
          />
        </>
      )}
      <RadioGroupWrapper
        legend={getText('form.andregoder.legend')}
        name={'andreGoder.fårAndreGoder'}
        control={control}
        error={errors?.andreGoder?.message}
      >
        <Radio value={JaNeiVetikke.JA}>
          <BodyShort>{getText('form.andregoder.ja')}</BodyShort>
        </Radio>
        <Radio value={JaNeiVetikke.NEI}>
          <BodyShort>{getText('form.andregoder.nei')}</BodyShort>
        </Radio>
        <Radio value={JaNeiVetikke.VET_IKKE}>
          <BodyShort>{getText('form.andregoder.vetikke')}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {fårAndreGoder === JaNeiVetikke.JA && (
        <>
          <RadioGroupWrapper
            legend={getText('form.andregoder.utbetalingsmåte.legend')}
            name={'andreGoder.utbetalingsmåte'}
            control={control}
            error={errors?.andreGoder?.message}
          >
            <Radio value={Utbetalingsmåte.ENGANGSBELØP}>
              <BodyShort>{getText('form.andregoder.utbetalingsmåte.engangsbeløp')}</BodyShort>
            </Radio>
            <Radio value={Utbetalingsmåte.LØPENDE}>
              <BodyShort>{getText('form.andregoder.utbetalingsmåte.løpende')}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          <Alert variant="info">
            <BodyShort>{getText('steps.andre_utbetalinger.vedlegg.title')}</BodyShort>
            <ul>
              <li>{getText('steps.andre_utbetalinger.vedlegg.bullet1')}</li>
              <li>{getText('steps.andre_utbetalinger.vedlegg.bullet2')}</li>
            </ul>
          </Alert>
        </>
      )}
    </>
  );
};
