import React from 'react';
import { render, screen, waitFor } from 'setupTests';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Checkbox } from '@navikt/ds-react';
import CheckboxGroupWrapper from './CheckboxGroupWrapper';
import userEvent from '@testing-library/user-event';

interface FormFields {
  ukedager: string[];
}

const TestComponent = () => {
  const schema = yup.object().shape({
    ukedager: yup.array().required('Du må velge minst èn dag'),
  });

  const { control, handleSubmit } = useForm<FormFields>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(() => jest.fn())}>
      <CheckboxGroupWrapper
        control={control}
        name={'ukedager'}
        legend={'Hvilke dager foretrekker du?'}
      >
        <Checkbox value={'mandag'}>mandag</Checkbox>
        <Checkbox value={'tirsdag'}>tirsdag</Checkbox>
        <Checkbox value={'onsdag'}>onsdag</Checkbox>
        <Checkbox value={'torsdag'}>torsdag</Checkbox>
        <Checkbox value={'fredag'}>fredag</Checkbox>
      </CheckboxGroupWrapper>
      <Button>Fullfør</Button>
    </form>
  );
};

describe('ChecboxGroupWrapper', () => {
  const user = userEvent.setup();
  it('skal vise label', () => {
    render(<TestComponent />);
    const label = screen.getByText('Hvilke dager foretrekker du?');
    expect(label).toBeVisible();
  });
  it('skal vise valgene', () => {
    render(<TestComponent />);

    expect(screen.getByRole('checkbox', { name: /mandag/ })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /tirsdag/ })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /onsdag/ })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /torsdag/ })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /fredag/ })).toBeVisible();
  });

  it('skal vise feilmelding hvis validering ikke er oppfylt', async () => {
    render(<TestComponent />);

    const knapp = screen.getByRole('button', { name: /fullfør/i });

    await waitFor(() => user.click(knapp));

    const feilmelding = await screen.findByText('Du må velge minst èn dag');
    expect(feilmelding).toBeVisible();
  });

  it('skal være mulig å endre verdi', async () => {
    render(<TestComponent />);
    const mandag = screen.getByRole('checkbox', { name: /mandag/ });

    expect(mandag).not.toBeChecked();

    await waitFor(() => user.click(mandag));

    await waitFor(() => expect(mandag).toBeChecked());
  });
});
