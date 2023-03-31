import * as yup from 'yup';
import { render, screen, waitFor } from 'setupTests';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@navikt/ds-react';
import React from 'react';
import { DatePickerWrapper } from './DatePickerWrapper';
import userEvent from '@testing-library/user-event';
import { addDays, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { formatDate } from '../../../utils/date';

interface FormFields {
  dato: Date;
}
const onSubmitMock = jest.fn();
const Datovelger = () => {
  const schema = yup.object().shape({
    dato: yup.date().required('Du må velge en dato!').typeError('Ugyldig format på dato.'),
  });
  const { control, handleSubmit } = useForm<FormFields>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(() => onSubmitMock())}>
      <DatePickerWrapper name={'dato'} label={'Velg dag'} control={control} />
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
    expect(screen.getByText('Ugyldig format på dato.')).toBeVisible();
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
