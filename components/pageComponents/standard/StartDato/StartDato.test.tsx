import { findByRole, fireEvent, getByRole, renderStepSoknadStandard, screen } from 'setupTests';
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
  it('Skal ha ferie, ferietype: PERIODE - fraDato/tilDato: visning og påkrevd', async () => {
    renderStepSoknadStandard(STARTDATO, <Component />, {});
    // Sykepenger
    const sykepengerLabel = messagesNb?.søknad?.startDato?.sykepenger?.legend;
    const sykepenger = screen.getByRole('group', { name: sykepengerLabel });
    fireEvent.click(getByRole(sykepenger, 'radio', { name: JaEllerNei.JA }), {});
    // Skal ha ferie
    const skalHaFerieLabel = messagesNb?.søknad?.startDato?.skalHaFerie?.label;
    const skalHaFerie = screen.getByRole('group', { name: skalHaFerieLabel });
    fireEvent.click(getByRole(skalHaFerie, 'radio', { name: JaEllerNei.JA }), {});
    // Ferietype PERIODE
    const periodeLabel = messagesNb?.søknad?.startDato?.ferieType?.values?.periode;
    fireEvent.click(screen.getByRole('radio', { name: periodeLabel }), {});
    // Fra-dato
    const fraLabel = messagesNb?.søknad?.startDato?.periode?.fraDato?.label;
    const fraDato = screen.getByLabelText(fraLabel);
    expect(fraDato).not.toBeNull();
    // Til-dato
    const tilLabel = messagesNb?.søknad?.startDato?.periode?.tilDato?.label;
    const tilDato = screen.getByLabelText(tilLabel);
    expect(tilDato).not.toBeNull();
    // Fra og til-dato er påkrevd
    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekstFra = messagesNb?.søknad?.startDato?.periode?.fraDato?.validation?.required;
    const påkrevdTekstTil = messagesNb?.søknad?.startDato?.periode?.tilDato?.validation?.required;
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekstFra })).not.toBeNull();
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekstTil })).not.toBeNull();
  });
  it('Skal ha ferie, ferietype: DAGER - antallDager: visning og påkrevd', async () => {
    renderStepSoknadStandard(STARTDATO, <Component />, {});
    // Sykepenger
    const sykepengerLabel = messagesNb?.søknad?.startDato?.sykepenger?.legend;
    const sykepenger = screen.getByRole('group', { name: sykepengerLabel });
    act(() => {
      fireEvent.click(getByRole(sykepenger, 'radio', { name: JaEllerNei.JA }), {});
    });
    // Skal ha ferie
    const skalHaFerieLabel = messagesNb?.søknad?.startDato?.skalHaFerie?.label;
    const skalHaFerie = screen.getByRole('group', { name: skalHaFerieLabel });
    act(() => {
      fireEvent.click(getByRole(skalHaFerie, 'radio', { name: JaEllerNei.JA }), {});
    });
    // Ferietype DAGER
    const dagerLabel = messagesNb?.søknad?.startDato?.ferieType?.values?.dager;
    act(() => {
      fireEvent.click(screen.getByRole('radio', { name: dagerLabel }), {});
    });
    // Ferietype DAGER
    // Antall dager
    const antallDagerLabel = messagesNb?.søknad?.startDato?.antallDager?.label;
    const antallDager = screen.getByLabelText(antallDagerLabel);
    expect(antallDager).not.toBeNull();
    // Antall dager er påkrevd
    act(() => {
      fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    });
    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekstAntallDager =
      messagesNb?.søknad?.startDato?.antallDager?.validation?.required;
    expect(
      await findByRole(errorSummary, 'link', { name: påkrevdTekstAntallDager })
    ).not.toBeNull();
  });
  it('UU', async () => {
    const { container } = renderStepSoknadStandard(STARTDATO, <Component />, {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
