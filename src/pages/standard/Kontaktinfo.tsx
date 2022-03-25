import { BodyShort, GuidePanel, Heading, Label } from '@navikt/ds-react';
import React from 'react';
import { getLinks, GetText } from '../../hooks/useTexts';
import TextWithLink from '../../components/TextWithLink';

interface KontaktinfoProps {
  getText: GetText;
  søkerFulltNavn: string;
  personident: string;
  adresseFull: string;
  pageTitle?: string;
}
export const Kontaktinfo = ({
  getText,
  søkerFulltNavn,
  personident,
  adresseFull,
  pageTitle,
}: KontaktinfoProps) => {
  return (
    <>
      <GuidePanel>
        <TextWithLink text={getText(`steps.kontaktinfo.guide`)}>
          {getLinks(`steps.kontaktinfo.guideLinks`, getText)}
        </TextWithLink>
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
        <BodyShort>{søkerFulltNavn}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.personident')}</Label>
        <BodyShort>{personident}</BodyShort>
      </div>
      <div>
        <Label>{getText('steps.kontaktinfo.adresse')}</Label>
        <BodyShort>{adresseFull}</BodyShort>
      </div>
    </>
  );
};
