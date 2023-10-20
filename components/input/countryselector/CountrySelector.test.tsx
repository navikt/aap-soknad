import React, { useState } from 'react';
import { render, screen, waitFor } from 'setupTests';
import CountrySelector from 'components/input/countryselector/CountrySelector';
import * as yup from 'yup';
import { Button } from '@navikt/ds-react';
import userEvent from '@testing-library/user-event';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';

interface Props {
  defaultValue?: string;
}

const TestComponent = (props: Props) => {
  const [land, setLand] = useState('');
  const [error, setError] = useState<SøknadValidationError[] | undefined>();
  const schema = yup.object().shape({
    land: yup.string().required('Dette er et påkrevd felt.'),
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const error = await validate(schema, { land });
        if (error) {
          setError(error);
        }
      }}
    >
      <CountrySelector
        name={'land'}
        label={'Hvilket land liker du?'}
        onChange={(e) => setLand(e.target.value)}
        value={props.defaultValue}
        error={error?.find((error) => error.path === 'land')?.message}
      />
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
