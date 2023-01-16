import React from 'react';
import { BodyShort, Label, Link, ReadMore } from '@navikt/ds-react';
import { useSokerOppslag } from 'context/sokerOppslagContext';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { formatTelefonnummer } from 'utils/StringFormatters';

const OppsummeringKontaktinfo = () => {
  const { formatMessage, FormatElement } = useFeatureToggleIntl();

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
      {søker?.fullAdresse && (
        <div>
          <Label>{formatMessage('søknad.oppsummering.contactInformation.adresse.label')}</Label>
          <BodyShort>{søker?.fullAdresse}</BodyShort>
          <ReadMore
            header={formatMessage('søknad.oppsummering.contactInformation.adresse.readMore.title')}
            type={'button'}
          >
            <FormatElement
              id={'søknad.oppsummering.contactInformation.adresse.readMore.text'}
              values={{
                a: (chunks: string[]) => (
                  <Link target="_blank" href={formatMessage('applinks.folkeregisteret')}>
                    {chunks}
                  </Link>
                ),
              }}
            />
          </ReadMore>
        </div>
      )}
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.telefonnummer.label')}</Label>
        <BodyShort>{formatTelefonnummer(kontaktInfo?.mobil)}</BodyShort>
        <ReadMore
          header={formatMessage(
            'søknad.oppsummering.contactInformation.telefonnummer.readMore.title'
          )}
          type={'button'}
        >
          <FormatElement
            id={'søknad.oppsummering.contactInformation.telefonnummer.readMore.text'}
            values={{
              a: (chunks: string[]) => (
                <Link
                  target="_blank"
                  href={formatMessage('applinks.kontaktOgReservasjonsregisteret')}
                >
                  {chunks}
                </Link>
              ),
            }}
          />
        </ReadMore>
      </div>
      <div>
        <Label>{formatMessage('søknad.oppsummering.contactInformation.epost.label')}</Label>
        <BodyShort>{kontaktInfo?.epost}</BodyShort>
        <ReadMore
          header={formatMessage('søknad.oppsummering.contactInformation.epost.readMore.title')}
          type={'button'}
        >
          <FormatElement
            id={'søknad.oppsummering.contactInformation.epost.readMore.text'}
            values={{
              a: (chunks: string[]) => (
                <Link
                  target="_blank"
                  href={formatMessage('applinks.kontaktOgReservasjonsregisteret')}
                >
                  {chunks}
                </Link>
              ),
            }}
          />
        </ReadMore>
      </div>
    </>
  );
};
export default OppsummeringKontaktinfo;
