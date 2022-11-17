import { FieldValues, useForm, useWatch } from 'react-hook-form';
import React, { useEffect } from 'react';
import { ReadMore, BodyLong, BodyShort, Heading, Radio, Alert, Link } from '@navikt/ds-react';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { Soknad } from 'types/Soknad';
import { JaEllerNei, JaNeiVetIkke } from 'types/Generic';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
const YRKESSKADE = 'yrkesskade';

export const getYrkesskadeSchema = (formatMessage: (id: string) => string) =>
  yup.object().shape({
    [YRKESSKADE]: yup
      .string()
      .required(formatMessage('søknad.yrkesskade.harDuYrkesskade.validation.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });

export const Yrkesskade = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage, formatElement } = useFeatureToggleIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(getYrkesskadeSchema(formatMessage)),
    defaultValues: {
      [YRKESSKADE]: defaultValues?.søknad?.yrkesskade,
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const harSkadeEllerSykdom = useWatch({ control, name: `${YRKESSKADE}` });
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onNext(data);
      })}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
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
                  <Link target="_blank" href={formatMessage('applinks.forskriftOmYrkessykdommer')}>
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
      </RadioGroupWrapper>
      {harSkadeEllerSykdom && harSkadeEllerSykdom !== JaNeiVetIkke.NEI && (
        <Alert variant={'info'}>
          {formatMessage('søknad.yrkesskade.alert.navVilSjekke')}
          <ul>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointGodkjent')}</li>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointArbeidsevne')}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
