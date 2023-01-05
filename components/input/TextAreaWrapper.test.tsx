import React from 'react';
import { useForm } from 'react-hook-form';
import { render, screen, waitFor } from 'setupTests';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import userEvent from '@testing-library/user-event';
import { Button } from '@navikt/ds-react';
import TextAreaWrapper from './TextAreaWrapper';

interface Props {
  defaultValue?: string;
}

interface FormFields {
  begrunnelse: string;
}

const TestComponent = (props: Props) => {
  const schema = yup.object().shape({
    begrunnelse: yup.string().required('Dette er et påkrevd felt.'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      begrunnelse: props.defaultValue,
    },
  });

  const submitFunction = jest.fn();

  return (
    <form onSubmit={handleSubmit(() => submitFunction())}>
      <TextAreaWrapper
        name={'begrunnelse'}
        label={'Skriv din begrunnelse.'}
        description={'Dette feltet er valgfritt.'}
        control={control}
        maxLength={50}
      />
      <Button>Fullfør</Button>
    </form>
  );
};

describe('textareawrapper', () => {
  const user = userEvent.setup();
  it('skal vise label på tekstfeltet', () => {
    render(<TestComponent />);
    const label = screen.getByText('Skriv din begrunnelse.');
    expect(label).toBeInTheDocument();
  });

  it('skal vise description på tekstfeltet', () => {
    render(<TestComponent />);
    const description = screen.getByText('Dette feltet er valgfritt.');
    expect(description).toBeInTheDocument();
  });

  it('det er mulig å skrive i tekstfeltet', async () => {
    render(<TestComponent />);
    const textfield = screen.getByRole('textbox', {
      name: /skriv din begrunnelse/i,
    });

    expect(textfield).toHaveValue('');

    await waitFor(() =>
      user.type(
        textfield,
        'Dette er min begrunnelse for hvorfor det her er min begrunnelse for hvorfor'
      )
    );

    expect(textfield).toHaveValue(
      'Dette er min begrunnelse for hvorfor det her er min begrunnelse for hvorfor'
    );
  });

  it('skal vise feilmelding på tekstfeltet når validering ikke er oppfylt', async () => {
    render(<TestComponent />);

    const textfield = screen.getByRole('textbox', {
      name: /skriv din begrunnelse/i,
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
      name: /skriv din begrunnelse/i,
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
    render(<TestComponent defaultValue={'Min lengre tekst'} />);

    const textfield = screen.getByRole('textbox', {
      name: /skriv din begrunnelse/i,
    });

    expect(textfield).toHaveValue('Min lengre tekst');
  });

  it('skal gi feilmelding dersom tekst er lengre enn maxLength', async () => {
    render(<TestComponent defaultValue={'Min lengre tekst'} />);

    const textfield = screen.getByRole('textbox', {
      name: /skriv din begrunnelse/i,
    });

    await waitFor(() =>
      user.type(
        textfield,
        'Dette er min begrunnelse for hvorfor det her er min begrunnelse for hvorfor også er den lengre enn 50 tegn'
      )
    );

    const feilmelding = screen.getByText('Antall tegn for mye 72');

    expect(feilmelding).toBeInTheDocument();
  });
});
