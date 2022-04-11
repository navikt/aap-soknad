import { GetText } from '../../../hooks/useTexts';
import { Alert, BodyLong, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import TextWithLink from '../../../components/TextWithLink';
import * as classes from './Kvittering.module.css';
import { SøkerView } from '../../../context/sokerOppslagContext';

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
      <BodyLong>
        <TextWithLink
          text={'$ og få informasjon om veien videre.'}
          links={[
            {
              name: 'Se søknaden din (åpnes i ny fane)',
              href: 'https://www.nav.no',
            },
          ]}
        />
      </BodyLong>
      <Link href={'https://www.nav.no/no/ditt-nav'}>Gå til DittNAV</Link>
    </div>
  );
};
export default Kvittering;
