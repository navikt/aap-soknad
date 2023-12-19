import { Soknad } from '../../../../types/Soknad';
import { useIntl } from 'react-intl';
import { DatePicker, useDatepicker } from '@navikt/ds-react';
import React from 'react';
import { SoknadContextState, useSoknadContext } from 'context/soknadcontext/soknadContext';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  defaultValues?: SoknadContextState;
  clearErrors: () => void;
  errorMessage?: string;
}

const FraDato = (props: Props) => {
  const { defaultValues, clearErrors, errorMessage } = props;
  const { søknadDispatch, søknadState } = useSoknadContext();
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
