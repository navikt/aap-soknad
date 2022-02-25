import { render, screen } from '@testing-library/react';
import { Etablererstipend } from './Etablererstipend';
import useTexts from '../../../hooks/useTexts';
import * as tekster from '../tekster';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);
describe('Etablererstipend', () => {
  const Component = () => {
    const { getText } = useTexts(tekster);
    return (
      <>
        <Etablererstipend
          getText={getText}
          register={jest.fn()}
          errors={{}}
          getValues={jest.fn()}
        />
      </>
    );
  };

  it('skal kun ha valg for ja og nei initiellt', () => {
    render(<Component />);
    expect(screen.getByText(tekster.nb.form.etablererstipend.soektOm.label)).toBeVisible();
    expect(screen.getByRole('radio', { name: /Ja/ })).toBeVisible();
    expect(screen.getByRole('radio', { name: /Nei/ })).toBeVisible();
  });

  it('skal få flere valg når man sier at man har søkt', () => {
    render(<Component />);
    expect(
      screen.queryByText(tekster.nb.form.etablererstipend.resultat.label)
    ).not.toBeInTheDocument();
    const jaValg = screen.getByRole('radio', { name: /Ja/ });
    userEvent.click(jaValg);
    expect(screen.getByText(tekster.nb.form.etablererstipend.resultat.label)).toBeVisible();
  });

  it('skal få filopplastning når man har fått svar på søknaden', () => {
    render(<Component />);
    userEvent.click(screen.getByRole('radio', { name: /Ja/ }));
    userEvent.click(screen.getByRole('radio', { name: /Innvilget/ }));
    expect(screen.getByText(tekster.nb.form.etablererstipend.vedlegg.label)).toBeVisible();
  });

  it('skal ikke ha brudd på krav til universell utforming', async () => {
    const { container } = render(<Component />);
    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});
