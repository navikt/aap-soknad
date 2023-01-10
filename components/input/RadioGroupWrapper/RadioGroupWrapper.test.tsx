import React from 'react';
import { render, screen } from 'setupTests';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Button, Radio } from '@navikt/ds-react';
import RadioGroupWrapper from './RadioGroupWrapper';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';

interface FormFields {
  ukedag: string;
}

interface Props {
  defaultValue?: string;
}

const TestComponent = (props: Props) => {
  const schema = yup.object().shape({
    ukedag: yup.string().required('Du må velge minst èn dag'),
  });

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: { ukedag: props.defaultValue },
  });

  return (
    <form onSubmit={handleSubmit(() => jest.fn())}>
      <RadioGroupWrapper
        legend={'Hvilken dag passer for deg?'}
        description={'Du kan bare velge én dag'}
        name={'ukedag'}
        control={control}
      >
        <Radio value={'mandag'}>Mandag</Radio>
        <Radio value={'tirsdag'}>Tirsdag</Radio>
        <Radio value={'onsdag'}>Onsdag</Radio>
        <Radio value={'torsdag'}>Torsdag</Radio>
        <Radio value={'fredag'}>Fredag</Radio>
      </RadioGroupWrapper>
      <Button>Fullfør</Button>
    </form>
  );
};

describe('RadioGroupWrapper', () => {
  const user = userEvent.setup();
  it('skal vise label', () => {
    render(<TestComponent />);
    const label = screen.getByText(/hvilken dag passer for deg\?/i);
    expect(label).toBeVisible();
  });

  it('skal vise description', () => {
    render(<TestComponent />);
    const description = screen.getByText(/du kan bare velge én dag/i);
    expect(description).toBeVisible();
  });

  it('skal vise valgene', () => {
    render(<TestComponent />);
    expect(screen.getByRole('radio', { name: /mandag/i })).toBeVisible();
    expect(screen.getByRole('radio', { name: /tirsdag/i })).toBeVisible();
    expect(screen.getByRole('radio', { name: /onsdag/i })).toBeVisible();
    expect(screen.getByRole('radio', { name: /torsdag/i })).toBeVisible();
    expect(screen.getByRole('radio', { name: /fredag/i })).toBeVisible();
  });

  it('skal ikke ha en verdi dersom noe ikke er valgt', () => {
    render(<TestComponent />);
    const valg = screen.getAllByRole('radio');

    valg.map((e) => expect(e).not.toBeChecked());
  });

  it('defaultverdi skal være satt', () => {
    render(<TestComponent defaultValue={'mandag'} />);

    const mandagValg = screen.getByRole('radio', { name: /mandag/i });
    expect(mandagValg).toBeChecked();
  });
  it('skal vise feilmelding dersom validering ikke er oppfylt', async () => {
    render(<TestComponent />);
    const fullførKnapp = screen.getByRole('button', { name: /fullfør/i });

    await act(async () => {
      await user.click(fullførKnapp);
    });

    const feilmelding = await screen.findByText(/du må velge minst èn dag/i);
    expect(feilmelding).toBeVisible();
  });

  it('skal være mulig å endre verdi', async () => {
    render(<TestComponent />);
    const tirsdagValg = screen.getByRole('radio', { name: /tirsdag/i });

    expect(tirsdagValg).not.toBeChecked();

    await act(async () => {
      await user.click(tirsdagValg);
    });

    expect(tirsdagValg).toBeChecked();
  });
});
