import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import React from 'react';
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
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import Soknad from '../../../types/Soknad';
import TextWithLink from '../../../components/TextWithLink';
import { JaNeiVetIkke } from '../../../types/Generic';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const YRKESSKADE = 'yrkesskade';

export const Yrkesskade = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [YRKESSKADE]: yup
      .string()
      .required(getText('form.yrkesskade.required'))
      .oneOf(
        [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
        getText('form.yrkesskade.required')
      )
      .typeError(getText('form.yrkesskade.required')),
  });
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [YRKESSKADE]: søknad?.yrkesskade,
    },
  });
  const harSkadeEllerSykdom = watch(`${YRKESSKADE}`);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onCancel={() => onCancelClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {getText('steps.yrkesskade.title')}
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
          <Link target={'_blank'} href={getText('steps.yrkesskade.guide.legal.readMoreLink.href')}>
            {getText('steps.yrkesskade.guide.legal.readMoreLink.name')}
          </Link>
        </ReadMore>
      </GuidePanel>
      <RadioGroupWrapper
        name={`${YRKESSKADE}`}
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
          {getText('steps.yrkesskade.alertInfo.text')}
          <ul>
            <li>{getText('steps.yrkesskade.alertInfo.bullet1')}</li>
            <li>{getText('steps.yrkesskade.alertInfo.bullet2')}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
