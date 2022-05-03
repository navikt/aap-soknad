import { GetText } from '../../../hooks/useTexts';
import { Alert, BodyLong, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from '../../../context/sokerOppslagContext';
import { Download } from '@navikt/ds-icons';
import { SuccessStroke } from '@navikt/ds-icons';

interface StudentProps {
  getText: GetText;
  søker: SøkerView;
}

const Kvittering = ({ getText, søker }: StudentProps) => {
  return (
    <div className={classes?.kvitteringContent}>
      <SuccessStroke
        width="5rem"
        height="5rem"
        color="var(--navds-semantic-color-feedback-success-icon)"
        style={{ margin: '0px auto' }}
      />
      <Heading size={'large'} level={'2'}>
        {`${getText('steps.kvittering.heading')}, ${søker?.fulltNavn}`}
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>{getText('steps.kvittering.alertSuccess')}</BodyLong>
      </Alert>
      <BodyLong spacing>
        <Link href="https://www.nav.no/saksbehandlingstid">
          Du kan se forventet saksbehandlingstid på nav.no/saksbehandlingstid.
        </Link>
      </BodyLong>
      <BodyLong>
        {'Bekreftelse blir også sendt til deg på:'}
        <ul>
          <li>SMS: 99999999</li>
          <li>E-post: dittnavn@online.no</li>
        </ul>
      </BodyLong>
      <Link
        target={'_blank'}
        onClick={() => window && window.alert('vær så god')}
        className={classes?.linkButton}
      >
        <Download />
        Last ned søknaden som pdf
      </Link>
      <form action={'https://www.nav.no/no/ditt-nav'}>
        <Button variant={'primary'}>Se saken din på Ditt NAV</Button>
      </form>
    </div>
  );
};
export default Kvittering;
