import { BodyShort, GuidePanel, Heading, Label } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import TextWithLink from '../../components/TextWithLink';
import { SøkerView } from '../../context/sokerOppslagContext';

interface KontaktinfoProps {
  getText: GetText;
  søker: SøkerView;
  pageTitle?: string;
}
export const Kontaktinfo = ({ getText, søker, pageTitle }: KontaktinfoProps) => {
  return (
    <>
      <GuidePanel>
        <TextWithLink
          text={getText(`steps.kontaktinfo.guide`)}
          links={[getText(`steps.kontaktinfo.guideLink`)]}
        />
      </GuidePanel>
      <Heading size="large" level="2">
        {pageTitle}
      </Heading>
      <div>
        <Label>{getText('steps.kontaktinfo.registrertInfo.title')}</Label>
        <BodyShort>{getText('steps.kontaktinfo.registrertInfo.text')}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.fullname')}</Label>
        <BodyShort>{søker?.fulltNavn}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.personident')}</Label>
        <BodyShort>{'TODO: fnr'}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.adresse')}</Label>
        <BodyShort>{søker?.fullAdresse}</BodyShort>
      </div>
    </>
  );
};
