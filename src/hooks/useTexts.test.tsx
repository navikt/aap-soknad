import useTexts from './useTexts';
import { render, screen } from '@testing-library/react';

describe('useTexts', () => {
  const tekstpakke = {
    nb: {
      overskrift: 'En overskrift',
      beskrivelse: 'En beskrivelse',
      steg: {
        intro: 'Introduksjon',
      },
    },
    en: {
      overskrift: 'A heading',
      beskrivelse: 'A description',
      steg: {
        intro: 'Introduction',
      },
    },
  };

  it('gir tekst tilbake', () => {
    const Component = () => {
      const { getText } = useTexts(tekstpakke);
      return (
        <>
          <h1>{getText('overskrift')}</h1>
          <div>{getText('beskrivelse')}</div>
          <dl>
            <dt>{getText('steg.intro')}</dt>
          </dl>
        </>
      );
    };

    render(<Component />);
    expect(screen.getByRole('heading', { name: tekstpakke.nb.overskrift })).toBeVisible();
    expect(screen.getByText(tekstpakke.nb.beskrivelse)).toBeVisible();
    expect(screen.getByText(tekstpakke.nb.steg.intro)).toBeVisible();
  });
});
