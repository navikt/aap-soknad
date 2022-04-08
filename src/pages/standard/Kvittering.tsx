import { GetText } from '../../hooks/useTexts';
import { Alert, BodyLong, Heading } from '@navikt/ds-react';
import React from 'react';
import { Success } from '@navikt/ds-icons';

interface StudentProps {
  getText: GetText;
}

const Kvittering = ({ getText }: StudentProps) => {
  return (
    <>
      <Success />
      <Heading size={'large'} level={'2'}>
        {getText('steps.kvittering.heading')}
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>{getText('steps.kvittering.alertSuccess')}</BodyLong>
      </Alert>
    </>
  );
};
export default Kvittering;
