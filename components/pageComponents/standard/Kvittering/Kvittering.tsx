import { Alert, BodyLong, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from 'context/sokerOppslagContext';
import { Download } from '@navikt/ds-icons';
import { SuccessStroke } from '@navikt/ds-icons';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { useSoknadContextStandard } from 'context/soknadContextStandard';

interface StudentProps {
  søker: SøkerView;
}

const getUUUIDfromString = (str: string) => {
  return str.split('/').pop();
};

const getDownloadUrl = (url?: string) => {
  const filopplastingUrl = process.env.NEXT_PUBLIC_TEMP_FILOPPLASTING_LES_URL;
  if (filopplastingUrl && url) {
    return `${filopplastingUrl}${getUUUIDfromString(url)}`;
  }
  return url;
};

const Kvittering = ({ søker }: StudentProps) => {
  const { formatMessage, formatElement } = useFeatureToggleIntl();
  const { søknadState } = useSoknadContextStandard();

  const dittNavUrl =
    typeof window !== 'undefined' && window.location.href.includes('www.nav.no')
      ? 'https://www.nav.no/person/dittnav/'
      : 'https://www.dev.nav.no/person/dittnav/';

  return (
    <div className={classes?.kvitteringContent}>
      <SuccessStroke
        width="5rem"
        height="5rem"
        color="var(--navds-semantic-color-feedback-success-icon)"
        style={{ margin: '0px auto' }}
      />
      <Heading size={'large'} level={'2'}>
        {formatMessage('søknad.kvittering.title', { navn: søker?.fulltNavn })}
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>{formatMessage('søknad.kvittering.alert.text')}</BodyLong>
      </Alert>
      <BodyLong spacing>
        {formatElement('søknad.kvittering.saksbehandlingstid', {
          a: (chunks: string[]) => (
            <Link href={formatMessage('applinks.saksbehandlingstid')}>{chunks}</Link>
          ),
        })}
      </BodyLong>
      <BodyLong>
        {formatMessage('søknad.kvittering.bekreftelse.title')}
        <ul>
          <li>{formatMessage('søknad.kvittering.bekreftelse.sms')}: 99999999</li>
          <li>{formatMessage('søknad.kvittering.bekreftelse.epost')}: dittnavn@online.no</li>
        </ul>
      </BodyLong>
      <Link
        target={'_blank'}
        href={getDownloadUrl(søknadState.søknadUrl)}
        className={classes?.linkButton}
      >
        <Download />
        {formatMessage('søknad.kvittering.lastNedSøknad')}
      </Link>
      <form action={dittNavUrl}>
        <Button variant={'primary'}>{formatMessage('søknad.kvittering.dittNavKnapp')}</Button>
      </form>
    </div>
  );
};
export default Kvittering;
