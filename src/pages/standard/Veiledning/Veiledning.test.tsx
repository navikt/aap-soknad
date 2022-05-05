import React from 'react';
import {
  render,
  screen,
  fireEvent,
  findAllByRole,
  findByText,
  waitFor,
} from '@testing-library/react';
import { Veiledning } from './Veiledning';
import useTexts from '../../../hooks/useTexts';
import * as tekster from '../tekster';

describe('Veiledning', () => {
  const Component = () => {
    const { getText } = useTexts(tekster);
    return (
      <>
        <Veiledning onSubmit={jest.fn()} getText={getText} søker={{}} loading={false} />
      </>
    );
  };

  it('Feil hvis ikke vilkår er godkjent', async () => {
    const { container } = render(<Component />);

    await fireEvent.submit(screen.getByRole('button', { name: 'Start søknad' }));

    console.log('innerHtml', container.innerHTML);

    await waitFor(() => {
      expect(
        screen.getByText('Du må bekrefte at du vil gi så riktige opplysninger som mulig.')
      ).toBeVisible();
    });
  });
  it('Ingen feil hvis vilkår er godkjent', async () => {
    render(<Component />);

    fireEvent.input(screen.getByRole('checkbox'), {
      target: {
        value: true,
      },
    });
    expect(
      screen.queryByText('Du må bekrefte at du vil gi så riktige opplysninger som mulig.')
    ).toBeNull();
  });
});
