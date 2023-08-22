import { GenericSoknadContextState } from '../../../../types/SoknadContext';
import { Soknad } from '../../../../types/Soknad';
import { useSoknadContextStandard } from '../../../../context/soknadContextStandard';
import { useIntl } from 'react-intl';
import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { updateSøknadData } from '../../../../context/soknadContextCommon';
import React from 'react';

interface Props {
  defaultValues?: GenericSoknadContextState<Soknad>;
  clearErrors: () => void;
  errorMessage?: string;
}

const FraDato = (props: Props) => {
  const { defaultValues, clearErrors, errorMessage } = props;
  const { søknadDispatch, søknadState } = useSoknadContextStandard();
  const { formatMessage } = useIntl();

  const { datepickerProps: fraDatoProps, inputProps: fraDatoInputProps } = useDatepicker({
    fromDate: new Date(),
    onDateChange: (value) => {
      clearErrors();
      updateSøknadData(søknadDispatch, {
        ferie: { ...søknadState?.søknad?.ferie, fraDato: value },
      });
    },
    ...(defaultValues?.søknad?.ferie?.fraDato !== undefined && {
      defaultSelected: new Date(defaultValues.søknad.ferie.fraDato),
    }),
  });

  return (
    <DatePicker {...fraDatoProps}>
      <DatePicker.Input
        {...fraDatoInputProps}
        label={formatMessage({ id: 'søknad.startDato.periode.fraDato.label' })}
        name={'ferie.fraDato'}
        id={'ferie.fraDato'}
        error={errorMessage}
      />
    </DatePicker>
  );
};

export default FraDato;
