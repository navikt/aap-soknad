import { FieldValues, useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import { ReadMore, BodyLong, BodyShort, Heading, Radio, Alert, Link } from '@navikt/ds-react';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import Soknad from '../../../types/Soknad';
import { JaNeiVetIkke } from '../../../types/Generic';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
import { useDebounceLagreSoknad } from '../../../hooks/useDebounceLagreSoknad';

interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}
const YRKESSKADE = 'yrkesskade';

export const Yrkesskade = ({ onBackClick }: Props) => {
  const { formatMessage, formatElement, formatLink } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    [YRKESSKADE]: yup
      .string()
      .required(formatMessage('søknad.yrkesskade.harDuYrkesskade.validation.required'))
      .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE])
      .nullable(),
  });
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [YRKESSKADE]: søknadState?.søknad?.yrkesskade,
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const harSkadeEllerSykdom = watch(`${YRKESSKADE}`);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData<Soknad>(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.yrkesskade.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyLong>{formatMessage('søknad.yrkesskade.guide.text')}</BodyLong>
      </LucaGuidePanel>
      <RadioGroupWrapper
        name={`${YRKESSKADE}`}
        legend={formatMessage(`søknad.yrkesskade.harDuYrkesskade.label`)}
        control={control}
        error={errors?.[YRKESSKADE]?.message}
      >
        <ReadMore
          header={formatMessage('søknad.yrkesskade.harDuYrkesskade.readMore.title')}
          type={'button'}
        >
          <div>
            <BodyShort spacing>
              {formatMessage('søknad.yrkesskade.harDuYrkesskade.readMore.text1')}
            </BodyShort>
            <BodyShort spacing>
              {formatElement('søknad.yrkesskade.harDuYrkesskade.readMore.text2', {
                a: (chunks: string[]) => (
                  <Link target="_blank" href={formatLink('forskriftOmYrkessykdommer')}>
                    {chunks}
                  </Link>
                ),
              })}
            </BodyShort>
          </div>
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
          {formatMessage('søknad.yrkesskade.alert.navVilSjekke')}
          <ul>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointGodkjent')}</li>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointArbeidsevne')}</li>
          </ul>
          {formatMessage('søknad.yrkesskade.alert.daGjelder')}
          <ul>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointMedlem')}</li>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletpointRedusertArbeidsevne')}</li>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointNavBeregner')}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
