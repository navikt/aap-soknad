import { BodyShort } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import ControlConfirmationPanel from '../../components/input/ControlConfirmationPanel';

interface VeiledningProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
}
export const Veiledning = ({ getText, errors, control }: VeiledningProps) => {
  return (
    <>
      <BodyShort>{getText('steps.veiledning.ingress')}</BodyShort>
      <ControlConfirmationPanel
        label={getText('steps.veiledning.rettogplikt')}
        control={control}
        name="rettogplikt"
        error={errors?.rettogplikt?.message}
      />
    </>
  );
};
