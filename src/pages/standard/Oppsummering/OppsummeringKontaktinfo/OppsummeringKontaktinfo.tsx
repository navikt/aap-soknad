import React from 'react';
import { BodyShort, Label, ReadMore } from '@navikt/ds-react';
import { useSokerOppslag } from '../../../../context/sokerOppslagContext';
import { GetText } from '../../../../hooks/useTexts';
import TextWithLink from '../../../../components/TextWithLink';

interface Props {
  getText: GetText;
}

const OppsummeringKontaktinfo = ({ getText }: Props) => {
  const { søker, kontaktInfo } = useSokerOppslag();
  return (
    <>
      <div>
        <Label>{getText('steps.oppsummering.kontaktinfo.navn')}</Label>
        <BodyShort>{søker?.fulltNavn}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.oppsummering.kontaktinfo.fnr')}</Label>
        <BodyShort>{søker?.fødselsnummer}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.oppsummering.kontaktinfo.adresse')}</Label>
        <BodyShort>{søker?.fullAdresse}</BodyShort>
        <ReadMore
          header={getText('steps.oppsummering.kontaktinfo.adresseReadmore.title')}
          type={'button'}
        >
          <span>
            <TextWithLink
              text={getText('steps.oppsummering.kontaktinfo.adresseReadmore.text')}
              links={[getText('steps.oppsummering.kontaktinfo.adresseReadmore.link')]}
            />
          </span>
        </ReadMore>
      </div>
      <div>
        <Label>{'Telefonnummer'}</Label>
        <BodyShort>{kontaktInfo?.mobil}</BodyShort>
      </div>
      <div>
        <Label>{'E-post adresse'}</Label>
        <BodyShort>{kontaktInfo?.epost}</BodyShort>
      </div>
    </>
  );
};
export default OppsummeringKontaktinfo;
