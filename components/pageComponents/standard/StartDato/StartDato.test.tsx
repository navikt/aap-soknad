import {
  findAllByRole,
  findByRole,
  fireEvent,
  getByRole,
  renderStepSoknadStandard,
  screen,
} from 'setupTests';
import { Step, StepWizard } from 'components/StepWizard';
import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import messagesNb from 'translations/nb.json';
import { act } from 'react-dom/test-utils';
import StartDato from './StartDato';
import { JaEllerNei } from 'types/Generic';
expect.extend(toHaveNoViolations);

const STARTDATO = 'STARTDATO';

describe('Startdato', () => {
  window.HTMLElement.prototype.scrollIntoView = function () {};
  const Component = () => {
    return (
      <StepWizard>
        <Step name={STARTDATO}>
          <StartDato onBackClick={jest.fn()} onNext={jest.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Sykepenger - ikke utfylt', async () => {
    renderStepSoknadStandard(STARTDATO, <Component />, {});
    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekst = messagesNb?.søknad?.startDato?.sykepenger?.required;
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekst })).not.toBeNull();
  });
  it('Er på sykepenger - vis spørsmål om ferie', async () => {
    renderStepSoknadStandard(STARTDATO, <Component />, {});
    fireEvent.click(screen.getByRole('radio', { name: JaEllerNei.JA }), {});
    const skalHaFerieLabel = messagesNb?.søknad?.startDato?.skalHaFerie?.label;
    const oppfølgingsspørsmål = screen.getByRole('group', { name: skalHaFerieLabel });
    expect(oppfølgingsspørsmål).not.toBeNull();
  });
  it('Er på sykepenger - ikke svart på spørsmål om ferie', async () => {
    renderStepSoknadStandard(STARTDATO, <Component />, {});
    fireEvent.click(screen.getByRole('radio', { name: JaEllerNei.JA }), {});
    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekst = messagesNb?.søknad?.startDato?.skalHaFerie?.validation?.required;
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekst })).not.toBeNull();
  });
  it('Skal ha ferie - ferietype: visning og påkrevd', async () => {
    renderStepSoknadStandard(STARTDATO, <Component />, {});
    // Sykepenger
    const sykepengerLabel = messagesNb?.søknad?.startDato?.sykepenger?.legend;
    const sykepenger = screen.getByRole('group', { name: sykepengerLabel });
    fireEvent.click(getByRole(sykepenger, 'radio', { name: JaEllerNei.JA }), {});
    // Skal ha ferie
    const skalHaFerieLabel = messagesNb?.søknad?.startDato?.skalHaFerie?.label;
    const skalHaFerie = screen.getByRole('group', { name: skalHaFerieLabel });
    fireEvent.click(getByRole(skalHaFerie, 'radio', { name: JaEllerNei.JA }), {});
    // Ferietype finnes
    const ferieTypeLabel = messagesNb?.søknad?.startDato?.ferieType?.label;
    const ferieType = screen.getByRole('group', { name: ferieTypeLabel });
    expect(ferieType).not.toBeNull();
    // Ferietype er påkrevd
    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekst = messagesNb?.søknad?.startDato?.ferieType?.validation?.required;
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekst })).not.toBeNull();
  });
  // it('Skal ha ferie, ferietype: PERIODE - fraDato/tilDato: visning og påkrevd', async () => {
  // });
  // it('Skal ha ferie, ferietype: DAGER - antallDager: visning og påkrevd', async () => {
  // });
  it('UU', async () => {
    const { container } = renderStepSoknadStandard(STARTDATO, <Component />, {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
