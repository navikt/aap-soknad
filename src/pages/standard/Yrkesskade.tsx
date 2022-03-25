import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors } from 'react-hook-form';
import React, { useEffect, useMemo, useState } from 'react';
import { Accordion, BodyLong, BodyShort, GuidePanel, Heading, Link, Radio } from '@navikt/ds-react';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import SoknadStandard from '../../types/SoknadStandard';
import TextWithLink from '../../components/TextWithLink';

interface YrkesskadeProps {
  setValue: any;
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
  pageTitle?: string;
}
enum YrkesskadeStatuser {
  JA = 'JA',
  NEI = 'NEI',
  VET_IKKE = 'VET_IKKE',
}
type YrkesSkader = {
  [key in YrkesskadeStatuser]: string;
};
const YRKESSKADE = 'yrkesskade';

export const Yrkesskade = ({ getText, errors, control, setValue, pageTitle }: YrkesskadeProps) => {
  const [infoAccordian, setInfoAccordian] = useState<boolean>(false);
  const GodkjentYrkesskadeStatus: YrkesSkader = useMemo(
    () => ({
      JA: getText(`form.${YRKESSKADE}.ja`),
      NEI: getText(`form.${YRKESSKADE}.nei`),
      SØKNAD_UNDER_BEHANDLING: getText(`form.${YRKESSKADE}.søknadsendt`),
      VET_IKKE: getText(`form.${YRKESSKADE}.vetikke`),
    }),
    [getText]
  );
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
        <TextWithLink text={getText('steps.yrkesskade.guide.application.text')}>
          <Link href={getText('steps.yrkesskade.guide.application.link.href')}>
            {getText('steps.yrkesskade.guide.application.link.name')}
          </Link>
        </TextWithLink>
        <Accordion>
          <Accordion.Item open={infoAccordian}>
            <Accordion.Header
              onClick={(e) => {
                e.preventDefault();
                setInfoAccordian(!infoAccordian);
              }}
            >
              <Link>{getText('steps.yrkesskade.guide.legal.title')}</Link>
            </Accordion.Header>
            <Accordion.Content>
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
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
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
        <Radio value={GodkjentYrkesskadeStatus.JA}>
          <BodyShort>{'Ja'}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.NEI}>
          <BodyShort>{'Nei'}</BodyShort>
        </Radio>
        <Radio value={GodkjentYrkesskadeStatus.VET_IKKE}>
          <BodyShort>{'Vet ikke'}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
    </>
  );
};
