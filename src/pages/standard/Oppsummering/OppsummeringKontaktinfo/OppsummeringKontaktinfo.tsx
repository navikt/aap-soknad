import React from 'react';
import { BodyShort, Label, Link, ReadMore } from '@navikt/ds-react';
import { useSokerOppslag } from '../../../../context/sokerOppslagContext';
import { useFeatureToggleIntl } from '../../../../hooks/useFeatureToggleIntl';

const OppsummeringKontaktinfo = () => {
  const { formatMessage, formatElement, formatLink } = useFeatureToggleIntl();

  const { søker, kontaktInfo } = useSokerOppslag();
  return (
    <>
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.navn')}</Label>
        <BodyShort>{søker?.fulltNavn}</BodyShort>
      </div>
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.personnummer')}</Label>
        <BodyShort>{søker?.fødselsnummer}</BodyShort>
      </div>
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.adresse.label')}</Label>
        <BodyShort>{søker?.fullAdresse}</BodyShort>
        <ReadMore
          header={formatMessage('søknad.oppsummering.contactInformation.adresse.readMore.title')}
          type={'button'}
        >
          {formatElement('søknad.oppsummering.contactInformation.adresse.readMore.text', {
            a: (chunks: string[]) => (
              <Link target="_blank" href={formatLink('folkeregisteret')}>
                {chunks}
              </Link>
            ),
          })}
        </ReadMore>
      </div>
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.telefonnummer.label')}</Label>
        <BodyShort>{kontaktInfo?.mobil}</BodyShort>
        <ReadMore
          header={formatMessage(
            'søknad.oppsummering.contactInformation.telefonnummer.readMore.title'
          )}
          type={'button'}
        >
          {formatElement('søknad.oppsummering.contactInformation.telefonnummer.readMore.text', {
            a: (chunks: string[]) => (
              <Link target="_blank" href={formatLink('kontaktOgReservasjonsregisteret')}>
                {chunks}
              </Link>
            ),
          })}
        </ReadMore>
      </div>
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.epost.label')}</Label>
        <BodyShort>{kontaktInfo?.epost}</BodyShort>
        <ReadMore
          header={formatMessage('søknad.oppsummering.contactInformation.epost.readMore.title')}
          type={'button'}
        >
          {formatElement('søknad.oppsummering.contactInformation.epost.readMore.text', {
            a: (chunks: string[]) => (
              <Link target="_blank" href={formatLink('kontaktOgReservasjonsregisteret')}>
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
