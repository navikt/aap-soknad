import React from 'react';

import { Alert, BodyShort, Button, Heading, Label, Panel } from '@navikt/ds-react';

const Feilviser = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: Function;
}) => (
  <Alert variant={'error'}>
    <Heading level={'1'} size={'large'}>
      Å nei! Dette var ikke helt planlagt...
    </Heading>
    <BodyShort>Applikasjonen har dessverre krasjet :(</BodyShort>
    <Label>Feilmelding:</Label>
    <Panel border>{error.message}</Panel>
    <Button onClick={() => resetErrorBoundary()}>Last applikasjonen på nytt</Button>
  </Alert>
);

export { Feilviser };
