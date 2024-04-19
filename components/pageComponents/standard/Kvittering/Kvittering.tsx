import { Alert, BodyLong, BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { KontaktInfoView, SøkerView } from 'context/sokerOppslagContext';
import { SuccessStroke } from '@navikt/ds-icons';
import { clientSideIsProd, isFunctionalTest } from 'utils/environments';
import { FormattedMessage, useIntl } from 'react-intl';

interface StudentProps {
  søker: SøkerView;
  kontaktinformasjon?: KontaktInfoView;
}

const Kvittering = ({ søker, kontaktinformasjon }: StudentProps) => {
  const { formatMessage } = useIntl();

  const mineAapUrl = () => {
    if (clientSideIsProd()) {
      return 'https://nav.no/aap/mine-aap';
    }
    if (isFunctionalTest()) {
      return process.env.NEXT_PUBLIC_MINE_AAP_URL;
    }
    return 'https://aap-mine-aap.intern.dev.nav.no/aap/mine-aap';
  };

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
        <BodyLong>{formatMessage({ id: 'søknad.kvittering.alert.text' })}</BodyLong>
      </Alert>
      <Alert variant="info">
        <BodyShort spacing>
          <Link target="_blank" href={`${mineAapUrl()}/ettersendelse/`}>
            {formatMessage({ id: 'søknad.kvittering.vedlegg.ettersendelseLink' })}
          </Link>
        </BodyShort>
        <BodyShort spacing>
          <FormattedMessage
            id={'søknad.kvittering.vedlegg.tekst1'}
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
      <form action={dittNavUrl}>
        <Button as={'a'} variant={'primary'} href={mineAapUrl()}>
          {formatMessage({ id: 'søknad.kvittering.dittNavKnapp' })}
        </Button>
      </form>
    </div>
  );
};
export default Kvittering;
