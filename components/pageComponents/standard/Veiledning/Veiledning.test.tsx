import React, { useRef } from 'react';
import { render, screen, fireEvent } from 'setupTests';
import { Veiledning } from './Veiledning';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Veiledning', () => {
  const Component = () => {
    const dummyRef = useRef(null);
    return (
      <>
        <Veiledning
          onSubmit={jest.fn()}
          søker={{}}
          isLoading={false}
          hasError={false}
          errorMessageRef={dummyRef}
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
      screen.queryByText('Du må bekrefte at du vil gi så riktige opplysninger som mulig.')
    ).toBeNull();
  });
  /*
  // TODO: se om denne testen vil passere med oppgradering av ds-react
  it('UU', async () => {
    const { container } = render(<Component />, {});
    expect(await axe(container)).toHaveNoViolations();
  });
  */
});
