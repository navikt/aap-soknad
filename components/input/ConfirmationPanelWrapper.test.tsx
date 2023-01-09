import React from 'react';
import { render, screen } from 'setupTests';
import ConfirmationPanelWrapper from './ConfirmationPanelWrapper';
import { useForm } from 'react-hook-form';
import { Button } from '@navikt/ds-react';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import exp from 'constants';

interface FormFields {
  tillatelse: string;
}

const TestComponent = () => {
  const schema = yup.object().shape({
    tillatelse: yup.boolean().required('Du må godkjenne for å gå videre').oneOf([true]).nullable(),
  });

  const { control, handleSubmit } = useForm<FormFields>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(() => jest.fn())}>
      <ConfirmationPanelWrapper control={control} name={'tillatelse'} label={'Ja, jeg samtykker.'}>
        For å komme videre må du gi oss lov til å hente inn og bruke opplysninger om deg.
      </ConfirmationPanelWrapper>
      <Button>Fullfør</Button>
    </form>
  );
};

describe('ConfirmationPanelWrapper', () => {
  const user = userEvent.setup();
  it('skal vise label', () => {
    render(<TestComponent />);

    const label = screen.getByText('Ja, jeg samtykker.');

    expect(label).toBeInTheDocument();
  });

  it('skal vise description', () => {
    render(<TestComponent />);

    const description = screen.getByText(
      'For å komme videre må du gi oss lov til å hente inn og bruke opplysninger om deg.'
    );

    expect(description).toBeInTheDocument();
  });

  it('skal være mulig å sjekke av', async () => {
    render(<TestComponent />);

    const checkbox = screen.getByRole('checkbox', {
      name: /ja, jeg samtykker\./i,
    });

    expect(checkbox).not.toBeChecked();

    await act(async () => {
      await waitFor(() => user.click(checkbox));
    });

    const checkboxAfterClick = await screen.findByRole('checkbox', {
      name: /ja, jeg samtykker\./i,
    });
    expect(checkbox).toBeChecked();
  });

  it('skal dukke opp en feilmelding dersom validering ikke går gjennom', async () => {
    render(<TestComponent />);

    const knapp = screen.getByText(/fullfør/i);

    const checkbox = screen.getByRole('checkbox', {
      name: /ja, jeg samtykker\./i,
    });

    expect(checkbox).not.toBeChecked();

    await act(async () => {
      await waitFor(() => user.click(knapp));
    });

    const feilmelding = await screen.findByText(/du må godkjenne for å gå videre/i);

    expect(feilmelding).toBeInTheDocument();
  });
});
