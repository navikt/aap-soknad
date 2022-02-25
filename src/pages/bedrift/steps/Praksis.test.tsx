import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

import useTexts from '../../../hooks/useTexts';
import { Praksis } from './Praksis';

import * as tekster from '../tekster';

let dato = new Date();
let foersteIMnd = format(startOfMonth(dato), 'EEE MMM dd yyyy');
let sisteIMnd = format(endOfMonth(dato), 'EEE MMM dd yyyy');
expect.extend(toHaveNoViolations);

describe('Praksis', () => {
  const Component = () => {
    const { control } = useForm();
    const { getText } = useTexts(tekster);

    return (
      <>
        <Praksis getText={getText} control={control} register={jest.fn()} errors={{}} />
      </>
    );
  };

  it('skal starte uten oppføringer', () => {
    render(<Component />);
    expect(screen.getByText(tekster.nb.steps.praksis.guideText)).toBeVisible();
    expect(screen.queryByLabelText(tekster.nb.form.praksis.navn)).not.toBeInTheDocument();
  });

  it('må kunne legge til oppføringer', () => {
    render(<Component />);
    const leggTilKnapp = screen.getByRole('button', {
      name: tekster.nb.form.praksis.leggTil,
    });
    expect(leggTilKnapp).toBeVisible();
    userEvent.click(leggTilKnapp);
    userEvent.click(leggTilKnapp);
    expect(screen.getAllByLabelText(tekster.nb.form.praksis.navn)).toHaveLength(2);
  });

  it('må kunne slette rader', () => {
    render(<Component />);
    const firmanavn = 'Lokal snekker AS';
    const leggTilKnapp = screen.getByRole('button', {
      name: tekster.nb.form.praksis.leggTil,
    });

    userEvent.click(leggTilKnapp);

    userEvent.type(screen.getByLabelText(tekster.nb.form.praksis.navn), firmanavn);
    userEvent.click(screen.getByLabelText(tekster.nb.form.praksis.fraDato));
    userEvent.click(screen.getByLabelText(foersteIMnd));
    userEvent.click(screen.getByLabelText(sisteIMnd));

    userEvent.click(leggTilKnapp);

    userEvent.click(screen.getAllByRole('button', { name: tekster.nb.form.praksis.slettRad })[1]);
    expect(screen.getByDisplayValue(firmanavn)).toBeVisible();
  });

  it('skal ikke ha brudd på krav til universell utforming', async () => {
    const { container } = render(<Component />);
    const res = await axe(container);
    expect(res).toHaveNoViolations();
  });
});
