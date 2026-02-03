import React, { useRef } from 'react';
import { Veiledning } from './Veiledning';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'vitestSetup';

describe('Veiledning', () => {
  const Component = () => {
    const dummyRef = useRef(null);
    return (
      <>
        <Veiledning
          onSubmit={vi.fn()}
          errorMessageRef={dummyRef}
          hasError={false}
          isLoading={false}
        />
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
      screen.queryByText('Du må bekrefte at du vil gi så riktige opplysninger som mulig.'),
    ).toBeNull();
  });
  it('UU', async () => {
    const { container } = render(<Component />, {});
    // @ts-expect-error Det er noe med extend som ikke fungerer helt. TS er misfornøyd men koden kjører
    expect(await axe(container)).toHaveNoViolations();
  });
});
