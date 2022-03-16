import { BodyShort, Checkbox, Radio } from '@navikt/ds-react';
import React, { useEffect, useMemo } from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors } from 'react-hook-form';
import CheckboxGroupWrapper from '../../components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import SoknadStandard from '../../types/SoknadStandard';

interface AndreUtbetalingerProps {
  setValue: any;
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
}
const ANDRE_UTBETALINGER = 'andreUtbetalinger';
const LØNN = 'lønn';
const STØNAD = 'stønad';

export const AndreUtbetalinger = ({
  getText,
  errors,
  control,
  setValue,
}: AndreUtbetalingerProps) => {
  const LønnsAlternativer = useMemo(
    () => ({
      JA: getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.ja`),
      NEI: getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.nei`),
      VET_IKKE: getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.vetikke`),
    }),
    [getText]
  );
  const StønadAlternativer = useMemo(
    () => ({
      OMSORGSSTØNAD: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.omsorgsstønad`),
      FOSTERHJEMSGODTGJØRELSE: getText(
        `form.${ANDRE_UTBETALINGER}.${STØNAD}.fosterhjemsgodtgjørelse`
      ),
      VERV: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.verv`),
      UTLAND: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.utland`),
      ANNET: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.annet`),
      NEI: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.nei`),
    }),
    [getText]
  );
  useEffect(() => {
    setValue(
      `${ANDRE_UTBETALINGER}.${STØNAD}.label`,
      getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.legend`)
    );
    setValue(
      `${ANDRE_UTBETALINGER}.${LØNN}.label`,
      getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.legend`)
    );
  }, [getText]);
  return (
    <>
      <RadioGroupWrapper
        legend={getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.legend`)}
        name={`${ANDRE_UTBETALINGER}.${LØNN}.value`}
        control={control}
        error={errors?.[ANDRE_UTBETALINGER]?.[LØNN]?.message}
      >
        <Radio value={LønnsAlternativer.JA}>
          <BodyShort>{LønnsAlternativer.JA}</BodyShort>
        </Radio>
        <Radio value={LønnsAlternativer.NEI}>
          <BodyShort>{LønnsAlternativer.NEI}</BodyShort>
        </Radio>
        <Radio value={LønnsAlternativer.VET_IKKE}>
          <BodyShort>{LønnsAlternativer.VET_IKKE}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      <CheckboxGroupWrapper
        name={`${ANDRE_UTBETALINGER}.${STØNAD}.value`}
        control={control}
        size="medium"
        legend={getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.legend`)}
        error={errors?.[ANDRE_UTBETALINGER]?.[STØNAD]?.message}
      >
        <Checkbox value={StønadAlternativer.OMSORGSSTØNAD}>
          {StønadAlternativer.OMSORGSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadAlternativer.FOSTERHJEMSGODTGJØRELSE}>
          {StønadAlternativer.FOSTERHJEMSGODTGJØRELSE}
        </Checkbox>
        <Checkbox value={StønadAlternativer.VERV}>{StønadAlternativer.VERV}</Checkbox>
        <Checkbox value={StønadAlternativer.UTLAND}>{StønadAlternativer.UTLAND}</Checkbox>
        <Checkbox value={StønadAlternativer.ANNET}>{StønadAlternativer.ANNET}</Checkbox>
        <Checkbox value={StønadAlternativer.NEI}>{StønadAlternativer.NEI}</Checkbox>
      </CheckboxGroupWrapper>
    </>
  );
};
