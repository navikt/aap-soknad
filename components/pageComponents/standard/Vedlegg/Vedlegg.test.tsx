import { renderStepSoknadStandard, screen } from 'setupTests';
import { Step, StepWizard } from 'components/StepWizard';
import React from 'react';
import { toHaveNoViolations } from 'jest-axe';
import messagesNb from 'translations/nb.json';
import userEvent from '@testing-library/user-event';
import Vedlegg from './Vedlegg';
import { Soknad } from 'types/Soknad';
import { Relasjon } from 'components/pageComponents/standard/Barnetillegg/AddBarnModal';
import { JaEllerNei } from 'types/Generic';
import { SoknadContextState, SØKNAD_CONTEXT_VERSION } from 'context/soknadcontext/soknadContext';

expect.extend(toHaveNoViolations);

const requiredVedlegg = [
  {
    filterType: 'FORELDER',
    type: 'bc68d022-7f2e-43fa-8e83-067d405850b1',
    description: 'Fødselsattest eller adopsjonsbevis for Tor dafaf',
  },
  {
    filterType: 'FOSTERFORELDER',
    type: '56f7e798-4d50-43bd-9734-27cb4de437b3',
    description: 'Dokumentasjon på at du er fosterforelder for tor gfsdg, og fra når',
  },
  {
    type: 'OMSORGSSTØNAD',
    description: 'Kopi av avtalen om omsorgsstønad fra kommunen din',
  },
  {
    type: 'UTLANDSSTØNAD',
    description: 'Dokumentasjon av ytelser fra utenlandske trygdemyndigheter',
  },
  {
    type: 'SYKESTIPEND',
    description: 'Kopi av vedtaket eller søknaden om sykestipend fra Lånekassen',
  },
  {
    type: 'LÅN',
    description: 'Dokumentasjon på studielån fra Lånekassen',
  },
  {
    type: 'LØNN_OG_ANDRE_GODER',
    // eslint-disable-next-line max-len
    description: 'Dokumentasjon av ekstra utbetalinger fra arbeidsgiver',
  },
  {
    type: 'AVBRUTT_STUDIE',
    description: 'Bekreftelse fra studiested på hvilken dato studiet ble avbrutt fra.',
  },
];
const soknadContextInitial: SoknadContextState = {
  version: SØKNAD_CONTEXT_VERSION,
  type: undefined,
  søknad: {
    manuelleBarn: [
      {
        navn: {
          fornavn: 'Barn',
          etternavn: 'Barnnes',
        },
        fødseldato: new Date(),
        relasjon: Relasjon.FORELDER,
        internId: 'bc68d022-7f2e-43fa-8e83-067d405850b1',
      },
      {
        navn: {
          fornavn: 'Barn',
          etternavn: 'Barnesen',
        },
        fødseldato: new Date(),
        relasjon: Relasjon.FOSTERFORELDER,
        internId: '56f7e798-4d50-43bd-9734-27cb4de437b3',
      },
    ],
  },
  requiredVedlegg,
  søknadUrl: undefined,
};

describe('Vedlegg', () => {
  const user = userEvent.setup();

  const Component = () => {
    return (
      <StepWizard>
        <Step name={'VEDLEGG'}>
          <Vedlegg onBackClick={jest.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Omsorgsstønad input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const textOmsorgsstønad = messagesNb.søknad.andreUtbetalinger.stønad.values.omsorgsstønad;
    expect(await screen.findByRole('heading', { level: 1, name: textOmsorgsstønad })).toBeVisible();
  });
  it('Avbrutt studie input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.student.vedlegg.name;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
  it('Utenlandsstønad input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.andreUtbetalinger.stønad.values.utland;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
  it('Sykestipend input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.andreUtbetalinger.stønad.values.stipend;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
  it('Fosterforelder input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.vedlegg.andreBarn.title.FOSTERFORELDER;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
  it('Forelder input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.vedlegg.andreBarn.title.FORELDER;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
  it('Lønn og andre goder input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.andreUtbetalinger.lønn.title;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
  it('Lån input-boks er synlig', async () => {
    renderStepSoknadStandard('VEDLEGG', <Component />, {}, soknadContextInitial);
    const text = messagesNb.søknad.andreUtbetalinger.stønad.values.lån;
    expect(await screen.findByRole('heading', { level: 1, name: text })).toBeVisible();
  });
});
