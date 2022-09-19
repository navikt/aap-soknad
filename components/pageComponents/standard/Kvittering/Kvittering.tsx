import { Alert, BodyLong, BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from 'context/sokerOppslagContext';
import { Download } from '@navikt/ds-icons';
import { SuccessStroke } from '@navikt/ds-icons';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { SøknadApiType } from 'pages/api/oppslag/soeknader';

interface StudentProps {
  søker: SøkerView;
  kontaktinformasjon?: { epost?: string; mobil?: string };
  søknad?: SøknadApiType;
}

const getUUUIDfromString = (str: string) => {
  return str.split('/').pop();
};

const getDownloadUrl = (url?: string) => {
  const filopplastingUrl = '/aap/soknad/api/vedlegg/les/?uuid=';
  if (filopplastingUrl && url) {
    return `${filopplastingUrl}${getUUUIDfromString(url)}`;
  }
  return url;
};

const Kvittering = ({ søker, kontaktinformasjon, søknad }: StudentProps) => {
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
      {søknad?.manglendeVedlegg?.length > 0 && (
        <Alert variant="warning">
          <BodyShort spacing>
            Vi mangler dokumentasjon fra deg for å kunne behandle søknaden.{' '}
            <Link
              href={`${process.env.NEXT_PUBLIC_MINE_AAP_URL}/${søknad?.søknadId}/ettersendelse/`}
            >
              Her kan du ettersende dokumentasjon digitalt.
            </Link>
            . Ettersend dette til oss så raskt du kan.
          </BodyShort>
          <BodyShort spacing>
            Du kan også <Link href="#">ettersende per post</Link>, eller levere dokumetansjon på
            ditt lokale NAV-kontor.
          </BodyShort>
        </Alert>
      )}
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
          <li>
            {formatMessage('søknad.kvittering.bekreftelse.sms')}: {kontaktinformasjon?.mobil}
          </li>
          <li>
            {formatMessage('søknad.kvittering.bekreftelse.epost')}: {kontaktinformasjon?.epost}
          </li>
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
        <Button as={'a'} variant={'primary'} href={process.env.NEXT_PUBLIC_MINE_AAP_URL ?? ''}>
          {formatMessage('søknad.kvittering.dittNavKnapp')}
        </Button>
      </form>
    </div>
  );
};
export default Kvittering;
