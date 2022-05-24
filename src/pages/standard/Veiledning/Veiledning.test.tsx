import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Veiledning } from './Veiledning';
import useTexts from '../../../hooks/useTexts';
import * as tekster from '../tekster';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Veiledning', () => {
  const Component = () => {
    const { getText } = useTexts(tekster);
    return (
      <>
        <Veiledning onSubmit={jest.fn()} getText={getText} søker={{}} loading={false} />
      </>
    );
  };

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
  it('UU', async () => {
    const { container } = render(<Component />, {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
