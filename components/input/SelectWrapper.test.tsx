import React from 'react';
import { render, screen, waitFor } from 'setupTests';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@navikt/ds-react';
import SelectWrapper from './SelectWrapper';
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
      <SelectWrapper name={'land'} label={'Hvilket land jobbet du i?'} control={control}>
        <option>Velg land</option>
        <option>Norge</option>
        <option>Sverige</option>
        <option>Danmark</option>
      </SelectWrapper>
      <Button>Fullfør</Button>
    </form>
  );
};

describe('SelectWrapper', () => {
  const user = userEvent.setup();
  it('skal vise label for select', () => {
    render(<TestComponent />);
    const label = screen.getByText('Hvilket land jobbet du i?');
    expect(label).toBeVisible();
  });

  it('skal vise valgene i nedtrekkslisten', () => {
    render(<TestComponent />);

    const selectComponent = screen.getByRole('combobox', {
      name: /hvilket land jobbet du i\?/i,
    });

    waitFor(() => user.click(selectComponent));

    const norgeValg = screen.getByRole('option', { name: /norge/i });
    const sverigValg = screen.getByRole('option', { name: /sverige/i });
    const danmarkValg = screen.getByRole('option', { name: /danmark/i });

    expect(norgeValg).toBeVisible();
    expect(sverigValg).toBeVisible();
    expect(danmarkValg).toBeVisible();
  });

  it('skal være mulig å velge et valg fra nedtrekkslisten', async () => {
    render(<TestComponent />);
    const selectComponent = await screen.findByRole('combobox', {
      name: /hvilket land jobbet du i\?/i,
    });

    const norgeValg = await screen.findByRole('option', { name: /norge/i });

    await waitFor(() => user.selectOptions(selectComponent, norgeValg));

    const selectComponentWithValue = await screen.findByRole('combobox', {
      name: /hvilket land jobbet du i\?/i,
    });

    expect(selectComponentWithValue).toHaveValue('Norge');
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
    render(<TestComponent defaultValue={'Norge'} />);

    const selectComponent = screen.getByRole('combobox', {
      name: /hvilket land jobbet du i\?/i,
    });

    expect(selectComponent).toHaveValue('Norge');
  });
});
