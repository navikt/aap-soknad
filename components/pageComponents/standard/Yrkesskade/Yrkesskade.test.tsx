import { findByRole, fireEvent, renderStepSoknadStandard, screen } from 'setupTests';
import { Step, StepWizard } from 'components/StepWizard';
import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import messagesNb from 'translations/nb.json';
import { Yrkesskade } from './Yrkesskade';
expect.extend(toHaveNoViolations);

const YRKESSKADE = 'yrkesskade';

describe('Startdato', () => {
  const Component = () => {
    return (
      <StepWizard>
        <Step name={YRKESSKADE}>
          <Yrkesskade onBackClick={jest.fn()} onNext={jest.fn()} />
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
    expect(await axe(container)).toHaveNoViolations();
  });
});
