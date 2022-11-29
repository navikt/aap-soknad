import { Alert, BodyLong, BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from 'context/sokerOppslagContext';
import { Download } from '@navikt/ds-icons';
import { SuccessStroke } from '@navikt/ds-icons';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { SøknadApiType } from 'pages/api/oppslag/soeknader';
import { clientSideIsLabs, clientSideIsProd } from 'utils/environments';

interface StudentProps {
  søker: SøkerView;
  kontaktinformasjon?: { epost?: string; mobil?: string };
  søknad?: SøknadApiType;
}

const getDownloadUrl = (journalpostId?: string) => {
  const filopplastingUrl = '/aap/soknad/api/oppslag/journalpost/?journalpostId=';
  if (journalpostId) {
    return `${filopplastingUrl}${journalpostId}`;
  }
  return journalpostId;
};

const Kvittering = ({ søker, kontaktinformasjon, søknad }: StudentProps) => {
  const { formatMessage, formatElement } = useFeatureToggleIntl();

  const mineAapUrl = clientSideIsLabs()
    ? process.env.NEXT_PUBLIC_MINE_AAP_URL
    : clientSideIsProd()
    ? 'https://nav.no/aap/mine-aap'
    : 'https://aap-innsyn.dev.nav.no/aap/mine-aap';
  const dittNavUrl = clientSideIsProd()
    ? 'https://www.nav.no/person/dittnav/'
    : 'https://www.dev.nav.no/person/dittnav/';

  return (
    <div className={classes?.kvitteringContent}>
      <SuccessStroke
        width="5rem"
        height="5rem"
        color="var(--a-icon-success)"
        style={{ margin: '0px auto' }}
        title="suksess"
        aria-hidden={true}
      />
      <Heading size={'large'} level={'2'}>
        {formatMessage('søknad.kvittering.title', { navn: søker?.fulltNavn })}
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>{formatMessage('søknad.kvittering.alert.text')}</BodyLong>
      </Alert>
      {(søknad?.manglendeVedlegg?.length ?? 0) > 0 && (
        <Alert variant="warning">
          <BodyShort spacing>
            Vi mangler dokumentasjon fra deg for å kunne behandle søknaden.{' '}
            <Link href={`${mineAapUrl}/${søknad?.søknadId}/ettersendelse/`}>
              Her kan du ettersende dokumentasjon digitalt
            </Link>
            . Ettersend dette til oss så raskt du kan.
          </BodyShort>
          <BodyShort spacing>
            Du kan også{' '}
            <Link target={'_blank'} href={formatMessage('applinks.ettersending')}>
              ettersende per post (åpnes i ny fane)
            </Link>
            , eller levere dokumetasjon på ditt lokale NAV-kontor.
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
      {(kontaktinformasjon?.mobil || kontaktinformasjon?.epost) && (
        <BodyLong>
          {formatMessage('søknad.kvittering.bekreftelse.title')}
          <ul>
            {kontaktinformasjon?.mobil && (
              <li>
                {formatMessage('søknad.kvittering.bekreftelse.sms')}: {kontaktinformasjon?.mobil}
              </li>
            )}
            {kontaktinformasjon?.epost && (
              <li>
                {formatMessage('søknad.kvittering.bekreftelse.epost')}: {kontaktinformasjon?.epost}
              </li>
            )}
          </ul>
        </BodyLong>
      )}
      <Link
        target={'_blank'}
        href={getDownloadUrl(søknad?.journalpostId)}
        className={classes?.linkButton}
      >
        <Download title="Last ned søknad" />
        {formatMessage('søknad.kvittering.lastNedSøknad')}
      </Link>
      <form action={dittNavUrl}>
        <Button as={'a'} variant={'primary'} href={mineAapUrl}>
          {formatMessage('søknad.kvittering.dittNavKnapp')}
        </Button>
      </form>
    </div>
  );
};
export default Kvittering;
