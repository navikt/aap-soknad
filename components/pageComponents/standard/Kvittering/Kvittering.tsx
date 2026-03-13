'use client';
import { Alert, BodyLong, BodyShort, Button, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import * as classes from './Kvittering.module.css';
import { SuccessStroke } from '@navikt/ds-icons';
import { clientSideIsProd, isFunctionalTest } from 'utils/environments';
import { useTranslations } from 'next-intl';
import { KrrKontaktInfo } from 'app/api/oppslag/krr/route';
import { Person } from 'app/api/oppslagapi/person/route';

interface Props {
  person: Person;
  kontaktinformasjon?: KrrKontaktInfo;
}

const Kvittering = ({ person, kontaktinformasjon }: Props) => {
  const t = useTranslations();

  const mineAapUrl = () => {
    if (clientSideIsProd()) {
      return 'https://nav.no/aap/mine-aap';
    }
    if (isFunctionalTest()) {
      return process.env.NEXT_PUBLIC_MINE_AAP_URL;
    }
    return 'https://aap-mine-aap.ansatt.dev.nav.no/aap/mine-aap';
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
        {t('søknad.kvittering.title', { navn: person?.navn })}
      </Heading>
      <Alert variant={'success'}>
        <BodyLong>{t('søknad.kvittering.alert.text')}</BodyLong>
      </Alert>
      <Alert variant="info">
        <BodyShort spacing>
          <Link target="_blank" href={`${mineAapUrl()}/ettersendelse/`}>
            {t('søknad.kvittering.vedlegg.ettersendelseLink')}
          </Link>
        </BodyShort>
        <BodyShort spacing>
          {t.rich('søknad.kvittering.vedlegg.tekst1', {
              a: (chunks) => (
                <Link target="_blank" href={t('applinks.ettersending')}>
                  {chunks}
                </Link>
              ),
            })}
        </BodyShort>
      </Alert>

      {t.rich('søknad.kvittering.saksbehandlingstid', {
        a: (chunks) => (
          <Link href={t('applinks.saksbehandlingstid')}>{chunks}</Link>
        ),
      })}
      {(kontaktinformasjon?.mobil || kontaktinformasjon?.epost) && (
        <div>
          {t('søknad.kvittering.bekreftelse.title')}
          <ul className={classes?.kvitteringList}>
            {kontaktinformasjon?.mobil && (
              <li>
                {t('søknad.kvittering.bekreftelse.sms')}:{' '}
                {kontaktinformasjon?.mobil}
              </li>
            )}
            {kontaktinformasjon?.epost && (
              <li>
                {t('søknad.kvittering.bekreftelse.epost')}:{' '}
                {kontaktinformasjon?.epost}
              </li>
            )}
          </ul>
        </div>
      )}
      <form action={dittNavUrl}>
        <Button as={'a'} variant={'primary'} href={mineAapUrl()}>
          {t('søknad.kvittering.dittNavKnapp')}
        </Button>
      </form>
    </div>
  );
};
export default Kvittering;
