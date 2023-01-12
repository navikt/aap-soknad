import { findAllByRole, findByRole, fireEvent, renderStepSoknadStandard, screen } from 'setupTests';
import { Step, StepWizard } from 'components/StepWizard';
import React from 'react';
import Student, { JaNeiAvbrutt } from './Student';
import { axe, toHaveNoViolations } from 'jest-axe';
import messagesNb from 'translations/nb.json';
import { act } from 'react-dom/test-utils';
expect.extend(toHaveNoViolations);

const STUDENT = 'student';

describe('Student', () => {
  window.HTMLElement.prototype.scrollIntoView = function () {};
  const Component = () => {
    return (
      <StepWizard>
        <Step name={STUDENT}>
          <Student onBackClick={jest.fn()} onNext={jest.fn()} />
        </Step>
      </StepWizard>
    );
  };

  it('Feil utfylt', async () => {
    renderStepSoknadStandard(STUDENT, <Component />, {});
    fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    const errorSummary = await screen.findByRole('alert');

    expect(await findAllByRole(errorSummary, 'link')).toHaveLength(1);
  });
  it('Riktig utfylt - enkleste vei', async () => {
    renderStepSoknadStandard(STUDENT, <Component />, {});
    fireEvent.click(screen.getByRole('radio', { name: JaNeiAvbrutt.NEI }), {});
    expect(await screen.queryByRole('region')).toBeNull();
  });
  it('Avbrutt studie - vis oppfølgingsspørsmål', async () => {
    renderStepSoknadStandard(STUDENT, <Component />, {});
    const avbruttLabel = messagesNb?.søknad?.student?.erStudent?.avbrutt;
    fireEvent.click(screen.getByRole('radio', { name: avbruttLabel }), {});
    const kommetilbakeTilStudietLegend = messagesNb?.søknad?.student?.kommeTilbake?.legend;
    const oppfølgingsspørsmål = screen.getByRole('group', { name: kommetilbakeTilStudietLegend });
    expect(oppfølgingsspørsmål).not.toBeNull();
  });
  it('Avbrutt studie - oppfølgingsspørsmål påkrevd', async () => {
    renderStepSoknadStandard(STUDENT, <Component />, {});
    act(() => {
      const avbruttLabel = messagesNb?.søknad?.student?.erStudent?.avbrutt;
      fireEvent.click(screen.getByRole('radio', { name: avbruttLabel }), {});
    });
    act(() => {
      fireEvent.submit(screen.getByRole('button', { name: 'Neste steg' }));
    });

    const errorSummary = await screen.findByRole('alert');
    const påkrevdTekst = messagesNb?.søknad?.student?.kommeTilbake?.required;
    expect(await findByRole(errorSummary, 'link', { name: påkrevdTekst })).not.toBeNull();
  });
  it('UU', async () => {
    const { container } = renderStepSoknadStandard(STUDENT, <Component />, {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
