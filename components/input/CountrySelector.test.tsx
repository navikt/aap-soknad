import React from 'react';
import { render, screen, waitFor } from 'setupTests';
import CountrySelector from './CountrySelector';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Button } from '@navikt/ds-react';
import userEvent from '@testing-library/user-event';

interface Props {
  defaultValue?: string;
}

interface FormFields {
  land: string;
}

const TestComponent = (props: Props) => {
  const schema = yup.object().shape({
    land: yup.string().required('Dette er et påkrevd felt.'),
  });

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      land: props.defaultValue,
    },
  });

  const submitFunction = jest.fn();

  return (
    <form onSubmit={handleSubmit(() => submitFunction())}>
      <CountrySelector name={'land'} label={'Hvilket land liker du?'} control={control} />
      <Button>Fullfør</Button>
    </form>
  );
};

describe('CountrySelector', () => {
  const user = userEvent.setup();
  it('skal vise label for landvelger', () => {
    render(<TestComponent />);
    const label = screen.getByText('Hvilket land liker du?');
    expect(label).toBeVisible();
  });

  it('skal vise valgene i nedtrekkslisten', async () => {
    render(<TestComponent />);

    const selectComponent = screen.getByRole('combobox', {
      name: /hvilket land liker du\?/i,
    });

    await waitFor(() => user.click(selectComponent));

    const sverigValg = screen.getByRole('option', { name: /sverige/i });
    const danmarkValg = screen.getByRole('option', { name: /danmark/i });

    expect(sverigValg).toBeVisible();
    expect(danmarkValg).toBeVisible();
  });

  it('skal være mulig å velge et valg fra nedtrekkslisten', async () => {
    render(<TestComponent />);
    const selectComponent = await screen.findByRole('combobox', {
      name: /hvilket land liker du\?/i,
    });

    const sverigeValg = await screen.findByRole('option', { name: /sverige/i });

    await waitFor(() => user.selectOptions(selectComponent, sverigeValg));

    const selectComponentWithValue = await screen.findByRole('combobox', {
      name: /hvilket land liker du\?/i,
    });

    expect(selectComponentWithValue).toHaveValue('SE:Sverige');
  });

  it('skal dukke opp en feilmelding dersom valideringen ikke går gjennom', async () => {
    render(<TestComponent />);

    const fullførKnapp = screen.getByRole('button', {
      name: /fullfør/i,
    });

    await waitFor(() => user.click(fullførKnapp));

    const feilmelding = await screen.findByText('Dette er et påkrevd felt.');

    expect(feilmelding).toBeVisible();
  });

  it('skal vise defaultvalue dersom den er satt', () => {
    render(<TestComponent defaultValue={'BE:Belgia'} />);

    const selectComponent = screen.getByRole('combobox', {
      name: /hvilket land liker du\?/i,
    });

    expect(selectComponent).toHaveValue('BE:Belgia');
  });

  it('skal ikke vise Norge i nedtrekkslisten', async () => {
    render(<TestComponent />);

    const sverigeValg = await screen.findByRole('option', { name: /sverige/i });
    const norgeValg = await screen.queryByRole('option', { name: /norge/i });

    expect(sverigeValg).toBeVisible();
    expect(norgeValg).not.toBeInTheDocument();
  });
});
