import { FormErrorSummary } from './FormErrorSummary';
import { render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('FormErrorSummary', () => {
  const errorArray = {
    aarstall: {
      message: 'Årstall må bestå av fire siffer',
    },
    fraDato: {
      message: 'Datoen kan ikke være tilbake i tid',
    },
  };

  it('skjuler ErrorSummary når vi ikke har feil', () => {
    const { container } = render(<FormErrorSummary errors={[]} />);
    console.log('container', container.innerHTML);
    expect(within(container).getByRole('alert', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(within(container).getByRole('list', { hidden: true }).childElementCount).toBe(1);
    expect(within(container).getByRole('listitem', { hidden: true })).toHaveTextContent('hidden');
  });

  it('lister opp alle feil', () => {
    render(<FormErrorSummary errors={errorArray} />);
    expect(screen.getByRole('link', { name: errorArray.aarstall.message })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: errorArray.aarstall.message }).getAttribute('href')
    ).toBe('#aarstall');
    expect(screen.getByRole('link', { name: errorArray.fraDato.message })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: errorArray.fraDato.message }).getAttribute('href')
    ).toBe('#fraDato');
  });

  it('uu-sjekk', async () => {
    const { container } = render(<FormErrorSummary errors={errorArray} />);
    const res = await axe(container);

    expect(res).toHaveNoViolations();
  });
});
