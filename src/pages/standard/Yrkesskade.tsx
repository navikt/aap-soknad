import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import React, { useMemo, useState } from 'react';
import { Alert, BodyShort, Radio, RadioGroup } from '@navikt/ds-react';
import { InputRadioGroup } from '../../components/input/InputRadio';

interface YrkesskadeProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
}
enum GodkjentYrkesskadeStatus {
  JA = 'ja',
  NEI = 'nei',
  SØKNAD_UNDER_BEHANDLING = 'søknad_under_behandling',
  VET_IKKE = 'vet_ikke',
}
type YrkesskadeAlertProps = {
  status?: GodkjentYrkesskadeStatus;
  getText: GetText;
};
const YrkesskadeAlert = ({ status, getText }: YrkesskadeAlertProps) => {
  return (
    <>
      {status === GodkjentYrkesskadeStatus.JA && (
        <Alert variant="info">
          <BodyShort>{getText('steps.yrkesskade.alert.ja.title')}</BodyShort>
          <ul>
            <li>{getText('steps.yrkesskade.alert.ja.bullet1')}</li>
            <li>{getText('steps.yrkesskade.alert.ja.bullet2')}</li>
            <li>{getText('steps.yrkesskade.alert.ja.bullet3')}</li>
          </ul>
        </Alert>
      )}
      {status === GodkjentYrkesskadeStatus.SØKNAD_UNDER_BEHANDLING && (
        <Alert variant="info">
          <BodyShort>{getText('steps.yrkesskade.alert.søknadsendt.title')}</BodyShort>
          <ul>
            <li>{getText('steps.yrkesskade.alert.søknadsendt.bullet1')}</li>
            <li>{getText('steps.yrkesskade.alert.søknadsendt.bullet2')}</li>
            <li>{getText('steps.yrkesskade.alert.søknadsendt.bullet3')}</li>
          </ul>
        </Alert>
      )}
      {status === GodkjentYrkesskadeStatus.VET_IKKE && (
        <Alert variant="info">
          <BodyShort>{getText('steps.yrkesskade.alert.vetikke')}</BodyShort>
        </Alert>
      )}
    </>
  );
};

export const Yrkesskade = ({ getText, errors, control }: YrkesskadeProps) => {
  const [godkjentYrkesskade, setGodkjentYrkesskade] = useState<GodkjentYrkesskadeStatus>();
  const alert = useMemo(() => {
    switch (godkjentYrkesskade) {
      case GodkjentYrkesskadeStatus.JA:
        return getText('steps.yrkesskade.alert.ja');
      case GodkjentYrkesskadeStatus.SØKNAD_UNDER_BEHANDLING:
        return getText('steps.yrkesskade.alert.søknadsendt');
      case GodkjentYrkesskadeStatus.VET_IKKE:
        return getText('steps.yrkesskade.alert.vetikke');
      default:
        return '';
    }
  }, [godkjentYrkesskade]);
  return (
    <>
      <BodyShort>{getText('steps.yrkesskade.ingress')}</BodyShort>
      <InputRadioGroup
        name={'yrkesskade'}
        legend={getText('form.yrkesskade.legend')}
        control={control}
        error={errors?.yrkesskade?.message}
      >
        <Radio value={GodkjentYrkesskadeStatus.JA}>
          <BodyShort>{getText('form.yrkesskade.ja')}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.NEI}>
          <BodyShort>{getText('form.yrkesskade.nei')}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.SØKNAD_UNDER_BEHANDLING}>
          <BodyShort>{getText('form.yrkesskade.søknadsendt')}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.VET_IKKE}>
          <BodyShort>{getText('form.yrkesskade.vetikke')}</BodyShort>
        </Radio>
      </InputRadioGroup>
      {godkjentYrkesskade !== GodkjentYrkesskadeStatus.NEI && (
        <YrkesskadeAlert status={godkjentYrkesskade} getText={getText} />
      )}
    </>
  );
};
