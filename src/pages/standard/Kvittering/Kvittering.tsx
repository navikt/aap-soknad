import { GetText } from '../../../hooks/useTexts';
import { Alert, BodyLong, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from '../../../context/sokerOppslagContext';
import { Download } from '@navikt/ds-icons';

interface StudentProps {
  getText: GetText;
  søker: SøkerView;
}

const Kvittering = ({ getText, søker }: StudentProps) => {
  return (
    <div className={classes?.kvitteringContent}>
      <Heading size={'large'} level={'2'}>
        {`${getText('steps.kvittering.heading')}, ${søker?.fulltNavn}`}
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>{getText('steps.kvittering.alertSuccess')}</BodyLong>
      </Alert>
      <BodyLong>
        {'Bekreftelse blir også sendt til deg på:'}
        <ul>
          <li>SMS: 99999999</li>
          <li>E-post: dittnavn@online.no</li>
        </ul>
      </BodyLong>
      <Link target={'_blank'} href={'https://www.nav.no'}>
        Se søknaden din (åpnes i ny fane)
      </Link>
      <Link
        target={'_blank'}
        onClick={() => window && window.alert('vær så god')}
        className={classes?.linkButton}
      >
        <Download />
        Last ned søknaden som pdf
      </Link>
      <form action={'https://www.nav.no/no/ditt-nav'}>
        <Button variant={'primary'}>Gå til Ditt NAV</Button>
      </form>
    </div>
  );
};
export default Kvittering;
