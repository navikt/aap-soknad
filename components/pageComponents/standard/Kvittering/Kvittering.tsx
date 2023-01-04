import { Alert, BodyLong, BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import React, { ReactNode } from 'react';
import * as classes from './Kvittering.module.css';
import { SøkerView } from 'context/sokerOppslagContext';
import { Download } from '@navikt/ds-icons';
import { SuccessStroke } from '@navikt/ds-icons';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { SøknadApiType } from 'pages/api/oppslag/soeknader';
import { clientSideIsLabs, clientSideIsProd } from 'utils/environments';

interface KvitteringProps {
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

const Kvittering = ({ søker, kontaktinformasjon, søknad }: KvitteringProps) => {
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
        <BodyLong>
          {formatMessage('søknad.kvittering.alert.text')}
          {(søknad?.manglendeVedlegg?.length ?? 0) === 0 && (
            <> {formatMessage('søknad.kvittering.ingenManglendeVedlegg')}</>
          )}
        </BodyLong>
      </Alert>
      {(søknad?.manglendeVedlegg?.length ?? 0) > 0 && (
        <Alert variant="warning">
          <BodyShort spacing>
            {formatMessage('søknad.kvittering.manglendeVedlegg.tekst1')}
            <Link target="_blank" href={`${mineAapUrl}/${søknad?.søknadId}/ettersendelse/`}>
              {formatMessage('søknad.kvittering.manglendeVedlegg.ettersendelseLink')}
            </Link>
          </BodyShort>
          <BodyShort spacing>
            {formatElement('søknad.kvittering.manglendeVedlegg.tekst2', {
              a: (chunks: string[]) => (
                <Link target="_blank" href={formatMessage('applinks.ettersending')}>
                  {chunks}
                </Link>
              ),
            })}
          </BodyShort>
        </Alert>
      )}
      {formatElement('søknad.kvittering.saksbehandlingstid', {
        a: (chunks: string[]) => (
          <Link href={formatMessage('applinks.saksbehandlingstid')}>{chunks}</Link>
        ),
      })}
      {(kontaktinformasjon?.mobil || kontaktinformasjon?.epost) && (
        <div>
          {formatMessage('søknad.kvittering.bekreftelse.title')}
          <ul className={classes?.kvitteringList}>
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
        </div>
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
