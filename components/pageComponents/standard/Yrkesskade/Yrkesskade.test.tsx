import { Step, StepWizard } from 'components/StepWizard';
import React from 'react';
import { axe } from 'vitest-axe';
import messagesNb from 'translations/nb.json';
import { Yrkesskade } from './Yrkesskade';
import { expect, describe, it, vi } from 'vitest';
import { renderStepSoknadStandard } from 'vitestSetup';
import { findByRole, fireEvent, screen } from '@testing-library/react';

const YRKESSKADE = 'yrkesskade';

describe('Startdato', () => {
  const Component = () => {
    return (
      <StepWizard>
        <Step name={YRKESSKADE}>
          <Yrkesskade onBackClick={vi.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Yrkesskade - ikke utfylt', async () => {
    renderStepSoknadStandard(YRKESSKADE, <Component />, {});
    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekst = messagesNb?.søknad?.yrkesskade?.harDuYrkesskade?.validation?.required;
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekst })).not.toBeNull();
  });
  it('UU', async () => {
    const { container } = renderStepSoknadStandard(YRKESSKADE, <Component />, {});
    // @ts-expect-error Det er noe med extend som ikke fungerer helt. TS er misfornøyd men koden kjører
    expect(await axe(container)).toHaveNoViolations();
  });
});
