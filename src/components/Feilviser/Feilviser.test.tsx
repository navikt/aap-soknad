import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { render, screen } from '@testing-library/react';

import { Feilviser } from './Feilviser';

const feilmelding = 'En uventet feil oppstod.';
const CrashingComponent = (): JSX.Element => {
  throw new Error(feilmelding);
};

describe('Feilviser', () => {
  test('vis feilmelding når applikasjonen krasjer', () => {
    render(
      <ErrorBoundary FallbackComponent={Feilviser}>
        <CrashingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Å nei! Dette var ikke helt planlagt...')).toBeVisible();
    expect(screen.getByText(feilmelding)).toBeVisible();
  });
});
