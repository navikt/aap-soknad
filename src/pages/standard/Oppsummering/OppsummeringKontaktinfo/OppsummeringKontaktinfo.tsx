import React from 'react';
import { BodyShort, Label, ReadMore } from '@navikt/ds-react';
import { SøkerView } from '../../../../context/sokerOppslagContext';
import { GetText } from '../../../../hooks/useTexts';
import TextWithLink from '../../../../components/TextWithLink';

interface Props {
  getText: GetText;
  søker?: SøkerView;
}

const OppsummeringKontaktinfo = ({ getText, søker }: Props) => {
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
    </>
  );
};
export default OppsummeringKontaktinfo;
