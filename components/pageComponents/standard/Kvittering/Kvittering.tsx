import { Alert, BodyLong, BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from 'context/sokerOppslagContext';
import { Download, SuccessStroke } from '@navikt/ds-icons';
import { SøknadApiType } from 'pages/api/oppslag/soeknader';
import { clientSideIsLabs, clientSideIsProd } from 'utils/environments';
import { FormattedMessage, useIntl } from 'react-intl';

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
  const { formatMessage } = useIntl();

  const mineAapUrl = clientSideIsLabs()
    ? process.env.NEXT_PUBLIC_MINE_AAP_URL
    : clientSideIsProd()
    ? 'https://nav.no/aap/mine-aap'
    : 'https://aap-mine-aap.intern.dev.nav.no/aap/mine-aap';
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
        <FormattedMessage id={'søknad.kvittering.title'} values={{ navn: søker?.fulltNavn }} />
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>
          {formatMessage({ id: 'søknad.kvittering.alert.text' })}
          {(søknad?.manglendeVedlegg?.length ?? 0) === 0 && (
            <> {formatMessage({ id: 'søknad.kvittering.ingenManglendeVedlegg' })}</>
          )}
        </BodyLong>
      </Alert>
      {(søknad?.manglendeVedlegg?.length ?? 0) > 0 && (
        <Alert variant="warning">
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.kvittering.manglendeVedlegg.tekst1' })}
            <Link target="_blank" href={`${mineAapUrl}/${søknad?.søknadId}/ettersendelse/`}>
              {formatMessage({ id: 'søknad.kvittering.manglendeVedlegg.ettersendelseLink' })}
            </Link>
          </BodyShort>
          <BodyShort spacing>
            <FormattedMessage
              id={'søknad.kvittering.manglendeVedlegg.tekst2'}
              values={{
                a: (chunks) => (
                  <Link target="_blank" href={formatMessage({ id: 'applinks.ettersending' })}>
                    {chunks}
                  </Link>
                ),
              }}
            />
          </BodyShort>
        </Alert>
      )}

      <FormattedMessage
        id={'søknad.kvittering.saksbehandlingstid'}
        values={{
          a: (chunks) => (
            <Link href={formatMessage({ id: 'applinks.saksbehandlingstid' })}>{chunks}</Link>
          ),
        }}
      />
      {(kontaktinformasjon?.mobil || kontaktinformasjon?.epost) && (
        <div>
          {formatMessage({ id: 'søknad.kvittering.bekreftelse.title' })}
          <ul className={classes?.kvitteringList}>
            {kontaktinformasjon?.mobil && (
              <li>
                {formatMessage({ id: 'søknad.kvittering.bekreftelse.sms' })}:{' '}
                {kontaktinformasjon?.mobil}
              </li>
            )}
            {kontaktinformasjon?.epost && (
              <li>
                {formatMessage({ id: 'søknad.kvittering.bekreftelse.epost' })}:{' '}
                {kontaktinformasjon?.epost}
              </li>
            )}
          </ul>
        </div>
      )}
      <Link
        target={'_blank'}
        href={getDownloadUrl(søknad?.journalpostId)}
        className={classes?.linkButton}
      >
        <Download title="Last ned søknad" />
        {formatMessage({ id: 'søknad.kvittering.lastNedSøknad' })}
      </Link>
      <form action={dittNavUrl}>
        <Button as={'a'} variant={'primary'} href={mineAapUrl}>
          {formatMessage({ id: 'søknad.kvittering.dittNavKnapp' })}
        </Button>
      </form>
    </div>
  );
};
export default Kvittering;
