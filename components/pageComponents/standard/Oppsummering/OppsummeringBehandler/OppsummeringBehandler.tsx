'use client';
import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';
import { Behandler } from 'types/Soknad';
import { formatTelefonnummer } from 'utils/StringFormatters';
import { useTranslations } from 'next-intl';

type Props = {
  behandler: Behandler;
};

const OppsummeringBehandler = ({ behandler }: Props) => {
  const t = useTranslations();

  return (
    <article className={''}>
      <Heading size={'small'} level={'3'}>
        {t('søknad.oppsummering.helseopplysninger.behandler')}
      </Heading>
      <BodyShort>{`${behandler?.firstname} ${behandler?.lastname}`}</BodyShort>
      {behandler?.legekontor && <BodyShort>{behandler?.legekontor}</BodyShort>}
      <BodyShort>{formaterAdresse(behandler)}</BodyShort>
      {behandler?.telefon && (
        <BodyShort>{`${t('søknad.helseopplysninger.dineBehandlere.telefon')}: ${formatTelefonnummer(behandler?.telefon)}`}</BodyShort>
      )}
    </article>
  );
};

function formaterAdresse(behandler: Behandler): string {
  let adresse = '';
  if (behandler.gateadresse) {
    adresse = behandler.gateadresse;

    if (behandler.poststed || behandler.postnummer) {
      adresse = adresse + ', ';
    }

    if (behandler.postnummer) {
      adresse = adresse + behandler.postnummer;
    }
    if (behandler.poststed) {
      adresse = adresse + ' ' + behandler.poststed;
    }
  }

  return adresse;
}

export default OppsummeringBehandler;
