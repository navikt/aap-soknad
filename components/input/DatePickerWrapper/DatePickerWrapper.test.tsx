import * as yup from 'yup';
import { render, screen, waitFor } from 'setupTests';
import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';
import { DatePickerWrapper } from './DatePickerWrapper';
import userEvent from '@testing-library/user-event';
import { validate } from '../../../lib/utils/validationUtils';
import { SøknadValidationError } from '../../schema/FormErrorSummaryNew';

interface FormFields {
  dato?: Date;
}
const onSubmitMock = jest.fn();
const Datovelger = () => {
  const [state, oppdater] = useState<FormFields>({ dato: undefined });
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const schema = yup.object({
    dato: yup.date().required('Du må velge en dato!').typeError('Ugyldig format på dato.'),
  });

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const errors = await validate(schema, state);
        if (errors) {
          setErrors(errors);
        } else {
          onSubmitMock();
          setErrors(undefined);
        }
      }}
    >
      <DatePickerWrapper
        name={'dato'}
        label={'Velg dag'}
        id={'dato'}
        onChange={(val) => {
          oppdater(() => ({ dato: val }));
        }}
        selectedDate={state.dato}
        error={errors?.find((k) => k.path === 'dato')?.message}
      />
      <Button>Fullfør</Button>
    </form>
  );
};
describe('DatePickerWrapper', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  const user = userEvent.setup();
  test('viser input-felt for dato', () => {
    render(<Datovelger />);
    expect(screen.getByText('Velg dag')).toBeInTheDocument();
  });

  test('viser feilmelding når man ikke fyller inn dato', async () => {
    render(<Datovelger />);
    await waitFor(() => user.click(screen.getByRole('button', { name: /^Fullfør$/ })));
    await waitFor(() => expect(screen.getByText('Du må velge en dato!')).toBeVisible());
  });

  test('kan taste inn dato', async () => {
    render(<Datovelger />);
    const input = screen.getByRole('textbox', { name: /^Velg dag$/ });

    await waitFor(() => user.type(input, '12.01.2023'));

    expect(input).toHaveValue('12.01.2023');
  });

  test('viser feilmelding når det er tastet inn en ugyldig dato', async () => {
    render(<Datovelger />);
    const input = screen.getByRole('textbox', { name: /^Velg dag$/ });

    await waitFor(() => user.type(input, '12.13.2023'));

    expect(input).toHaveValue('12.13.2023');

    await waitFor(() => user.click(screen.getByRole('button', { name: /^Fullfør$/ })));
    // expect(screen.getByText('Ugyldig format på dato.')).toBeVisible(); // FIXME Må avklares
    expect(screen.getByText('Du må velge en dato!')).toBeVisible();
    expect(onSubmitMock).toHaveBeenCalledTimes(0);
  });

  test('kan taste inn dato og sende skjema', async () => {
    render(<Datovelger />);
    const input = screen.getByRole('textbox', { name: /^Velg dag$/ });

    await waitFor(() => user.type(input, '12.01.2023'));

    expect(input).toHaveValue('12.01.2023');

    await waitFor(() => user.click(screen.getByRole('button', { name: /^Fullfør$/ })));

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  /* TODO: Må skrives om til å ta høyde for at iMorgen er en ny måned og dermed må
  velges fra neste måned i kalenderen
  test('kan velge en dato fra dato-velgeren', async () => {
    render(<Datovelger />);
    const iDag = new Date();
    const iMorgen = addDays(iDag, 1);
    const knappetekst = format(iMorgen, 'cccc d', { locale: nb });

    await waitFor(() => user.click(screen.getByRole('button', { name: /^Åpne datovelger$/ })));

    expect(screen.getByRole('button', { name: knappetekst })).toBeVisible();

    await waitFor(() => user.click(screen.getByRole('button', { name: knappetekst })));

    expect(screen.getByRole('textbox', { name: /^Velg dag$/ })).toHaveValue(
      formatDate(iMorgen, 'dd.MM.yyyy')
    );

    await waitFor(() => user.click(screen.getByRole('button', { name: /^Fullfør$/ })));

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
  */
});
