import React from 'react';
import TextFieldWrapper from './TextFieldWrapper';
import { useForm } from 'react-hook-form';
import { render, screen, waitFor } from 'setupTests';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import userEvent from '@testing-library/user-event';
import { Button } from '@navikt/ds-react';

interface Props {
  defaultValue?: string;
}

interface FormFields {
  name: string;
}

const TestComponent = (props: Props) => {
  const schema = yup.object().shape({
    name: yup.string().required('Dette er et påkrevd felt.'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: props.defaultValue,
    },
  });

  const submitFunction = jest.fn();

  return (
    <form onSubmit={handleSubmit(() => submitFunction())}>
      <TextFieldWrapper
        name={'name'}
        label={'Skriv inn navnet ditt'}
        description={'Skriv ditt fulle navn'}
        control={control}
      />
      <Button>Fullfør</Button>
    </form>
  );
};

describe('textfieldwrapper', () => {
  const user = userEvent.setup();
  it('skal vise label på tekstfeltet', () => {
    render(<TestComponent />);
    const label = screen.getByText('Skriv inn navnet ditt');
    expect(label).toBeInTheDocument();
  });

  it('skal vise description på tekstfeltet', () => {
    render(<TestComponent />);
    const description = screen.getByText('Skriv ditt fulle navn');
    expect(description).toBeInTheDocument();
  });

  it('det er mulig å skrive i tekstfeltet', async () => {
    render(<TestComponent />);
    const textfield = screen.getByRole('textbox', {
      name: /skriv inn navnet ditt/i,
    });

    expect(textfield).toHaveValue('');

    await waitFor(() => user.type(textfield, 'Kjell'));

    expect(textfield).toHaveValue('Kjell');
  });

  it('skal vise feilmelding på tekstfeltet når validering ikke er oppfylt', async () => {
    render(<TestComponent />);

    const textfield = screen.getByRole('textbox', {
      name: /skriv inn navnet ditt/i,
    });

    expect(textfield).toHaveValue('');

    const fullførKnapp = screen.getByRole('button', {
      name: /fullfør/i,
    });

    await waitFor(() => user.click(fullførKnapp));

    const feilmelding = await screen.findByText('Dette er et påkrevd felt.');

    expect(feilmelding).toBeInTheDocument();
  });

  it('skal fjerne feilmelding på tekstfeltet når man begynner å skrive', async () => {
    render(<TestComponent />);

    const textfield = screen.getByRole('textbox', {
      name: /skriv inn navnet ditt/i,
    });

    expect(textfield).toHaveValue('');

    const fullførKnapp = screen.getByRole('button', {
      name: /fullfør/i,
    });

    await waitFor(() => user.click(fullførKnapp));

    const feilmelding = await screen.findByText('Dette er et påkrevd felt.');

    expect(feilmelding).toBeInTheDocument();

    await waitFor(() => user.type(textfield, 'Kjell'));

    expect(feilmelding).not.toBeInTheDocument();
  });

  it('skal vise default value dersom den er satt', async () => {
    render(<TestComponent defaultValue={'Thomas'} />);

    const textfield = screen.getByRole('textbox', {
      name: /skriv inn navnet ditt/i,
    });

    expect(textfield).toHaveValue('Thomas');
  });
});
