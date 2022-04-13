import React from 'react';
import { render, screen, fireEvent, findAllByRole, queryAllByRole } from '@testing-library/react';
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
    render(<Component />);

    fireEvent.submit(screen.getByRole('button', { name: 'Start søknad' }));
    const errorSummary = await screen.findByRole('region');

    expect(await findAllByRole(errorSummary, 'link')).toHaveLength(1);
  });
  it('Ingen feil hvis vilkår er godkjent', async () => {
    render(<Component />);

    fireEvent.input(screen.getByRole('checkbox'), {
      target: {
        value: true,
      },
    });
    expect(await screen.queryByRole('region')).toBeNull();
  });
});
