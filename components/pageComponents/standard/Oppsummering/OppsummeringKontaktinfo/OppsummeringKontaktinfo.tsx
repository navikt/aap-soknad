'use client';
import React from 'react';
import { BodyShort, Label, Link, ReadMore } from '@navikt/ds-react';
import { formatTelefonnummer } from 'utils/StringFormatters';
import { useTranslations } from 'next-intl';
import { Person } from 'app/api/oppslagapi/person/route';
import { KrrKontaktInfo } from 'app/api/oppslag/krr/route';

type Props = {
  kontaktinformasjon: KrrKontaktInfo | null;
  person: Person;
};
const OppsummeringKontaktinfo = ({ kontaktinformasjon, person }: Props) => {
  const t = useTranslations();

  return (
    <>
      <div>
        <Label>{t('søknad.oppsummering.contactInformation.navn')}</Label>
        <BodyShort>{person?.navn}</BodyShort>
      </div>
      {person?.adresse && (
        <div>
          <Label>
            {t('søknad.oppsummering.contactInformation.adresse.label')}
          </Label>
          <BodyShort>{person.adresse}</BodyShort>
          <ReadMore
            header={t('søknad.oppsummering.contactInformation.adresse.readMore.title')}
            type={'button'}
          >
            {t.rich('søknad.oppsummering.contactInformation.adresse.readMore.text', {
                a: (chunks) => (
                  <Link target="_blank" href={t('applinks.folkeregisteret')}>
                    {chunks}
                  </Link>
                ),
              })}
          </ReadMore>
        </div>
      )}
      <div>
        <Label>
          {t('søknad.oppsummering.contactInformation.telefonnummer.label')}
        </Label>
        <BodyShort>{formatTelefonnummer(kontaktinformasjon?.mobil)}</BodyShort>
        <ReadMore
          header={t('søknad.oppsummering.contactInformation.telefonnummer.readMore.title')}
          type={'button'}
        >
          {t.rich('søknad.oppsummering.contactInformation.telefonnummer.readMore.text', {
              a: (chunks) => (
                <Link
                  target="_blank"
                  href={t('applinks.kontaktOgReservasjonsregisteret')}
                >
                  {chunks}
                </Link>
              ),
            })}
        </ReadMore>
      </div>
      <div>
        <Label>{t('søknad.oppsummering.contactInformation.epost.label')}</Label>
        <BodyShort>{kontaktinformasjon?.epost}</BodyShort>
        <ReadMore
          header={t('søknad.oppsummering.contactInformation.epost.readMore.title')}
          type={'button'}
        >
          {t.rich('søknad.oppsummering.contactInformation.epost.readMore.text', {
              a: (chunks) => (
                <Link
                  target="_blank"
                  href={t('applinks.kontaktOgReservasjonsregisteret')}
                >
                  {chunks}
                </Link>
              ),
            })}
        </ReadMore>
      </div>
    </>
  );
};
export default OppsummeringKontaktinfo;
