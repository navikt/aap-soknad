import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form';
import React, { useEffect } from 'react';
import {
  ReadMore,
  BodyLong,
  BodyShort,
  GuidePanel,
  Heading,
  Radio,
  Link,
  Alert,
} from '@navikt/ds-react';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import SoknadStandard from '../../types/SoknadStandard';
import TextWithLink from '../../components/TextWithLink';
import { JaNeiVetIkke } from '../../types/Generic';

interface YrkesskadeProps {
  setValue: any;
  watch: UseFormWatch<FieldValues>;
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
  pageTitle?: string;
}
const YRKESSKADE = 'yrkesskade';

export const Yrkesskade = ({
  getText,
  watch,
  errors,
  control,
  setValue,
  pageTitle,
}: YrkesskadeProps) => {
  useEffect(() => setValue(`${YRKESSKADE}.label`, getText(`form.${YRKESSKADE}.legend`)), [getText]);
  const harSkadeEllerSykdom = watch(`${YRKESSKADE}.value`);
  return (
    <>
      <Heading size="large" level="2">
        {pageTitle}
      </Heading>
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
          <TextWithLink
            text={getText('steps.yrkesskade.guide.application.text')}
            links={[getText('steps.yrkesskade.guide.application.link')]}
          />
          <Link
            target={'_blank'}
            href={'https://www.nav.no/no/person/arbeid/yrkesskade-og-yrkessykdom'}
          >
            Les mer om yrkesskader og yrkessykdommer (åpnes i ny fane)
          </Link>
        </ReadMore>
      </GuidePanel>
      <RadioGroupWrapper
        name={`${YRKESSKADE}.value`}
        legend={getText(`form.${YRKESSKADE}.legend`)}
        control={control}
        error={errors?.[YRKESSKADE]?.message}
      >
        <ReadMore header={getText('steps.yrkesskade.yrkesskadeReadMore.title')} type={'button'}>
          <div>{getText('steps.yrkesskade.yrkesskadeReadMore.skade')}</div>
          <TextWithLink
            text={getText('steps.yrkesskade.yrkesskadeReadMore.sykdom.text')}
            links={[getText('steps.yrkesskade.yrkesskadeReadMore.sykdom.link')]}
          />
          <Link
            target={'_blank'}
            href={getText('steps.yrkesskade.yrkesskadeReadMore.lesMerLink.href')}
          >
            {getText('steps.yrkesskade.yrkesskadeReadMore.lesMerLink.name')}
          </Link>
        </ReadMore>
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
      {harSkadeEllerSykdom && harSkadeEllerSykdom !== JaNeiVetIkke.NEI && (
        <Alert variant={'info'}>
          {'NAV vil nå sjekke'}
          <ul>
            <li>om du har en godkjent yrkesskade eller yrkessykdom</li>
            <li>om denne er årsaken til den nedsatte arbeidsevnen din</li>
          </ul>
        </Alert>
      )}
    </>
  );
};
