import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form';
import React, { useMemo } from 'react';
import { Alert, BodyShort, Radio } from '@navikt/ds-react';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';

interface YrkesskadeProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
  watch: UseFormWatch<FieldValues>;
}
type YrkesskadeAlertProps = {
  status?: string;
  getText: GetText;
  yrkesskadeStatuser: YrkesSkader;
};
enum YrkesskadeStatuser {
  JA = 'JA',
  NEI = 'NEI',
  SØKNAD_UNDER_BEHANDLING = 'SØKNAD_UNDER_BEHANDLING',
  VET_IKKE = 'VET_IKKE',
}
type YrkesSkader = {
  [key in YrkesskadeStatuser]: string;
};
const YRKESSKADE = 'yrkesskade';

const YrkesskadeAlert = ({ status, getText, yrkesskadeStatuser }: YrkesskadeAlertProps) => {
  return (
    <>
      {status === yrkesskadeStatuser.JA && (
        <Alert variant="info">
          <BodyShort>{getText('steps.yrkesskade.alert.ja.title')}</BodyShort>
          <ul>
            <li>{getText('steps.yrkesskade.alert.ja.bullet1')}</li>
            <li>{getText('steps.yrkesskade.alert.ja.bullet2')}</li>
            <li>{getText('steps.yrkesskade.alert.ja.bullet3')}</li>
          </ul>
        </Alert>
      )}
      {status === yrkesskadeStatuser.SØKNAD_UNDER_BEHANDLING && (
        <Alert variant="info">
          <BodyShort>{getText('steps.yrkesskade.alert.søknadsendt.title')}</BodyShort>
          <ul>
            <li>{getText('steps.yrkesskade.alert.søknadsendt.bullet1')}</li>
            <li>{getText('steps.yrkesskade.alert.søknadsendt.bullet2')}</li>
            <li>{getText('steps.yrkesskade.alert.søknadsendt.bullet3')}</li>
          </ul>
        </Alert>
      )}
      {status === yrkesskadeStatuser.VET_IKKE && (
        <Alert variant="info">
          <BodyShort>{getText('steps.yrkesskade.alert.vetikke')}</BodyShort>
        </Alert>
      )}
    </>
  );
};

export const Yrkesskade = ({ getText, errors, control, watch }: YrkesskadeProps) => {
  const GodkjentYrkesskadeStatus: YrkesSkader = useMemo(
    () => ({
      JA: getText(`form.${YRKESSKADE}.ja`),
      NEI: getText(`form.${YRKESSKADE}.nei`),
      SØKNAD_UNDER_BEHANDLING: getText(`form.${YRKESSKADE}.søknadsendt`),
      VET_IKKE: getText(`form.${YRKESSKADE}.vetikke`),
    }),
    [getText]
  );
  const godkjentYrkesskade = watch(`${YRKESSKADE}.value`);
  return (
    <>
      <BodyShort>{getText(`steps.${YRKESSKADE}.ingress`)}</BodyShort>
      <RadioGroupWrapper
        name={`${YRKESSKADE}.value`}
        legend={getText(`form.${YRKESSKADE}.legend`)}
        control={control}
        error={errors?.[YRKESSKADE]?.message}
      >
        <Radio value={GodkjentYrkesskadeStatus.JA}>
          <BodyShort>{getText(`form.${YRKESSKADE}.ja`)}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.NEI}>
          <BodyShort>{getText(`form.${YRKESSKADE}.nei`)}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.SØKNAD_UNDER_BEHANDLING}>
          <BodyShort>{getText(`form.${YRKESSKADE}.søknadsendt`)}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.VET_IKKE}>
          <BodyShort>{getText(`form.${YRKESSKADE}.vetikke`)}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {godkjentYrkesskade !== GodkjentYrkesskadeStatus.NEI && (
        <YrkesskadeAlert
          status={godkjentYrkesskade}
          getText={getText}
          yrkesskadeStatuser={GodkjentYrkesskadeStatus}
        />
      )}
    </>
  );
};
