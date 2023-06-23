import React from 'react';
import { BodyShort, Label, Link, ReadMore } from '@navikt/ds-react';
import { useSokerOppslag } from 'context/sokerOppslagContext';
import { formatTelefonnummer } from 'utils/StringFormatters';
import { FormattedMessage, useIntl } from 'react-intl';

const OppsummeringKontaktinfo = () => {
  const { formatMessage } = useIntl();

  const { søker, kontaktInfo } = useSokerOppslag();
  return (
    <>
      <div>
        <Label>{formatMessage({ id: 'søknad.oppsummering.contactInformation.navn' })}</Label>
        <BodyShort>{søker?.fulltNavn}</BodyShort>
      </div>
      <div>
        <Label>
          {formatMessage({ id: 'søknad.oppsummering.contactInformation.personnummer' })}
        </Label>
        <BodyShort>{søker?.fødselsnummer}</BodyShort>
      </div>
      {søker?.fullAdresse && (
        <div>
          <Label>
            {formatMessage({ id: 'søknad.oppsummering.contactInformation.adresse.label' })}
          </Label>
          <BodyShort>{søker?.fullAdresse}</BodyShort>
          <ReadMore
            header={formatMessage({
              id: 'søknad.oppsummering.contactInformation.adresse.readMore.title',
            })}
            type={'button'}
          >
            <FormattedMessage
              id={'søknad.oppsummering.contactInformation.adresse.readMore.text'}
              values={{
                a: (chunks) => (
                  <Link target="_blank" href={formatMessage({ id: 'applinks.folkeregisteret' })}>
                    {chunks}
                  </Link>
                ),
              }}
            />
          </ReadMore>
        </div>
      )}
      <div>
        <Label>
          {formatMessage({ id: 'søknad.oppsummering.contactInformation.telefonnummer.label' })}
        </Label>
        <BodyShort>{formatTelefonnummer(kontaktInfo?.mobil)}</BodyShort>
        <ReadMore
          header={formatMessage({
            id: 'søknad.oppsummering.contactInformation.telefonnummer.readMore.title',
          })}
          type={'button'}
        >
          <FormattedMessage
            id={'søknad.oppsummering.contactInformation.telefonnummer.readMore.text'}
            values={{
              a: (chunks) => (
                <Link
                  target="_blank"
                  href={formatMessage({ id: 'applinks.kontaktOgReservasjonsregisteret' })}
                >
                  {chunks}
                </Link>
              ),
            }}
          />
        </ReadMore>
      </div>
      <div>
        <Label>{formatMessage({ id: 'søknad.oppsummering.contactInformation.epost.label' })}</Label>
        <BodyShort>{kontaktInfo?.epost}</BodyShort>
        <ReadMore
          header={formatMessage({
            id: 'søknad.oppsummering.contactInformation.epost.readMore.title',
          })}
          type={'button'}
        >
          <FormattedMessage
            id={'søknad.oppsummering.contactInformation.epost.readMore.text'}
            values={{
              a: (chunks) => (
                <Link
                  target="_blank"
                  href={formatMessage({ id: 'applinks.kontaktOgReservasjonsregisteret' })}
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
