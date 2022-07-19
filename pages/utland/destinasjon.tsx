import { GuidePanel } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { NextSoknadFormWrapper } from '../../src/components/SoknadFormWrapper/NextSoknadFormWrapper';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldValues, useForm } from 'react-hook-form';
import {
  SoknadContextProviderUtland,
  useSoknadContextUtland,
} from '../../src/context/soknadContextUtland';
import CountrySelector from '../../src/components/input/CountrySelector';
import { useRouter } from 'next/router';
import { updateSøknadData, slettLagretSoknadState } from '../../src/context/soknadContextCommon';

const Destinasjon = () => {
  const { formatMessage } = useFeatureToggleIntl();

  const router = useRouter();

  const LAND = 'land';
  const schema = yup.object().shape({
    [LAND]: yup
      .string()
      .required(formatMessage('utland.land.select.required'))
      .notOneOf(['none'], formatMessage('utland.land.select.required')),
  });
  const { søknadState, søknadDispatch } = useSoknadContextUtland();
  ///const { stepList, stepWizardDispatch } = useStepWizard();
  //const debouncedLagre = useDebounceLagreSoknad<SoknadUtland>();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [LAND]: søknadState?.søknad?.[LAND],
    },
  });
  const allFields = watch();
  /*useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);*/
  return (
    <>
      <GuidePanel poster>{formatMessage('utland.land.guide.text')}</GuidePanel>
      <NextSoknadFormWrapper
        nextButtonText="Neste"
        backButtonText="Tilbake"
        onBack={() => router.push('/aap/soknad/utland')}
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          router.push('/');
        })}
        onDelete={() => slettLagretSoknadState(søknadDispatch, søknadState)}
        errors={errors}
      >
        <CountrySelector
          name={LAND}
          label={formatMessage('utland.land.select.label')}
          control={control}
          error={errors.country?.message}
        />
      </NextSoknadFormWrapper>
    </>
  );
};

const DestinasjonWithContextWrapper = () => (
  <SoknadContextProviderUtland>
    <Destinasjon />
  </SoknadContextProviderUtland>
);

export default DestinasjonWithContextWrapper;
