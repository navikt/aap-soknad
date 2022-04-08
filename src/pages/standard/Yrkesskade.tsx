import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors } from 'react-hook-form';
import React, { useEffect } from 'react';
import { ReadMore, BodyLong, BodyShort, GuidePanel, Heading, Radio } from '@navikt/ds-react';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import SoknadStandard from '../../types/SoknadStandard';
import TextWithLink from '../../components/TextWithLink';
import { JaNeiVetIkke } from '../../types/Generic';

interface YrkesskadeProps {
  setValue: any;
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
  pageTitle?: string;
}
const YRKESSKADE = 'yrkesskade';

export const Yrkesskade = ({ getText, errors, control, setValue, pageTitle }: YrkesskadeProps) => {
  useEffect(() => setValue(`${YRKESSKADE}.label`, getText(`form.${YRKESSKADE}.legend`)), [getText]);
  return (
    <>
      <GuidePanel>
        <BodyLong>{getText('steps.yrkesskade.guide.info.text')}</BodyLong>
        <ul>
          <li>
            <BodyShort>{getText('steps.yrkesskade.guide.info.bullet1')}</BodyShort>
          </li>
          <li>
            <BodyShort>{getText('steps.yrkesskade.guide.info.bullet2')}</BodyShort>
          </li>
        </ul>
        <TextWithLink
          text={getText('steps.yrkesskade.guide.application.text')}
          links={[getText('steps.yrkesskade.guide.application.link')]}
        />
        <ReadMore header={getText('steps.yrkesskade.guide.legal.title')} type={'button'}>
          <BodyLong>{getText('steps.yrkesskade.guide.legal.text')}</BodyLong>
          <ul>
            <li>
              <BodyShort>{getText('steps.yrkesskade.guide.legal.bullet1')}</BodyShort>
            </li>
            <li>
              <BodyShort>{getText('steps.yrkesskade.guide.legal.bullet2')}</BodyShort>
            </li>
            <li>
              <BodyShort>{getText('steps.yrkesskade.guide.legal.bullet3')}</BodyShort>
            </li>
          </ul>
        </ReadMore>
      </GuidePanel>
      <Heading size="large" level="2">
        {pageTitle}
      </Heading>
      <RadioGroupWrapper
        name={`${YRKESSKADE}.value`}
        legend={getText(`form.${YRKESSKADE}.legend`)}
        control={control}
        error={errors?.[YRKESSKADE]?.message}
      >
        <Radio value={JaNeiVetIkke.JA}>
          <BodyShort>{JaNeiVetIkke.JA}</BodyShort>
        </Radio>
        <Radio value={JaNeiVetIkke.NEI}>
          <BodyShort>{JaNeiVetIkke.NEI}</BodyShort>
        </Radio>
        <Radio value={JaNeiVetIkke.VET_IKKE}>
          <BodyShort>{JaNeiVetIkke.VET_IKKE}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
    </>
  );
};
