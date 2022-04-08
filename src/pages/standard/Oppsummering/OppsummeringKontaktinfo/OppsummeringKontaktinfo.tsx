import React from 'react';
import { BodyShort, Label, Link, ReadMore } from '@navikt/ds-react';
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
        <ReadMore header={getText('steps.oppsummering.kontaktinfo.adresseReadmore.title')}>
          <TextWithLink text={getText('steps.oppsummering.kontaktinfo.adresseReadmore.text')}>
            <Link
              target={'_blank'}
              href={getText('steps.oppsummering.kontaktinfo.adresseReadmore.link.href')}
            >
              {getText('steps.oppsummering.kontaktinfo.adresseReadmore.link.name')}
            </Link>
          </TextWithLink>
        </ReadMore>
      </div>
    </>
  );
};
export default OppsummeringKontaktinfo;
