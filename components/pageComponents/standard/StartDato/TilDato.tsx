import { DatePicker, useDatepicker } from '@navikt/ds-react';
import React from 'react';
import { useIntl } from 'react-intl';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  defaultValues?: SoknadContextState;
  clearErrors: () => void;
  errorMessage?: string;
}
const TilDato = (props: Props) => {
  const { defaultValues, clearErrors, errorMessage } = props;
  const { søknadDispatch, søknadState } = useSoknad();
  const { formatMessage } = useIntl();

  const { datepickerProps: tilDatoProps, inputProps: tilDatoInputProps } = useDatepicker({
    fromDate: new Date(),
    onDateChange: (value) => {
      clearErrors();
      updateSøknadData(søknadDispatch, {
        ferie: { ...søknadState?.søknad?.ferie, tilDato: value },
      });
    },
    ...(defaultValues?.søknad?.ferie?.tilDato !== undefined && {
      defaultSelected: new Date(defaultValues.søknad.ferie.tilDato),
    }),
  });
  return (
    <DatePicker {...tilDatoProps}>
      <DatePicker.Input
        {...tilDatoInputProps}
        label={formatMessage({ id: 'søknad.startDato.periode.tilDato.label' })}
        name={'ferie.tilDato'}
        id={'ferie.tilDato'}
        error={errorMessage}
      />
    </DatePicker>
  );
};

export default TilDato;
