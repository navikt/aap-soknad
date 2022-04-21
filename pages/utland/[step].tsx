import {
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary,
} from '../../src/pages/utland/Steps';
import useTexts from '../../src/hooks/useTexts';
import countries from 'i18n-iso-countries';

import * as tekster from '../../src/pages/utland/tekster';
import { useRouter } from 'next/router';
import { BodyShort, Button, Heading, StepIndicator } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { getUtlandSchemas } from '../../src/schemas/utland';
import { useSøknadsdata } from '../../src/utils/useSøknadsdata';
import Error from 'next/error';
import SøknadFormWrapper from '../../src/components/SoknadFormWrapper/SoknadFormWrapper';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

const getCurrentStep = (slug: string | string[]) => {
  const step = Array.isArray(slug) ? slug[0] : slug;
  return Number.parseInt(step);
};

const Utland = () => {
  const router = useRouter();

  const { søknadsdata, setSøknadsdata } = useSøknadsdata('UTLAND');

  const { getText } = useTexts(tekster);

  const currentStep = getCurrentStep(router.query.step);

  const [countryList, setCountryList] = useState<string[][]>([]);

  const SoknadUtlandSchemas = getUtlandSchemas(getText);
  const currentSchema = useMemo(() => {
    return SoknadUtlandSchemas[currentStep + 1];
  }, [currentStep, SoknadUtlandSchemas]);

  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    //resolver: yupResolver(currentSchema),
    defaultValues: søknadsdata?.søknad,
  });

  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }));
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);

  const handleNext = (data) => {
    console.log('data', data);
    setSøknadsdata(data);
    router.push(`/utland/${currentStep + 1}`);
  };

  const onDeleteSøknad = async () => {
    /*if (søknadState.type) {
      const deleteRes = await slettLagretSoknadState(søknadDispatch, søknadState.type);
      if (deleteRes) {
        router.push('utland/1');
      } else {
        console.error('noe gikk galt med sletting av lagret søknad');
      }
    }*/
  };

  if (currentStep < 1 || currentStep > 5) {
    return <Error statusCode={404} />;
  }

  return (
    <>
      <StepIndicator
        activeStep={currentStep - 1}
        onStepChange={(x) => router.push(`/utland/${x + 1}`)}
        responsive={true}
      >
        <StepIndicator.Step>Introduksjon</StepIndicator.Step>
        <StepIndicator.Step>Destinasjon</StepIndicator.Step>
        <StepIndicator.Step>Periode</StepIndicator.Step>
        <StepIndicator.Step>Oppsummering</StepIndicator.Step>
        <StepIndicator.Step>Kvittering</StepIndicator.Step>
      </StepIndicator>
      {currentStep === 1 && <StepIntroduction getText={getText} />}

      {currentStep === 2 && (
        <SøknadFormWrapper
          onNext={handleSubmit((data) => handleNext(data))}
          onBack={() => router.push(`/utland/1`)}
          onCancel={() => onDeleteSøknad()}
          nextButtonText={'Neste'}
          backButtonText={'Forrige steg'}
          cancelButtonText={'Avbryt søknad'}
          errors={{}}
        >
          <StepSelectCountry
            getText={getText}
            control={control}
            errors={errors}
            countries={countryList}
          />
        </SøknadFormWrapper>
      )}
      {currentStep === 3 && (
        <SøknadFormWrapper
          onNext={handleSubmit((data) => handleNext(data))}
          onBack={() => router.push(`/utland/2`)}
          onCancel={() => onDeleteSøknad()}
          nextButtonText={'Neste'}
          backButtonText={'Forrige steg'}
          cancelButtonText={'Avbryt søknad'}
          errors={{}}
        >
          <StepSelectTravelPeriod
            getText={getText}
            control={control}
            errors={errors}
            getValues={getValues}
          />
        </SøknadFormWrapper>
      )}
      {currentStep === 4 && (
        <StepSummary
          getText={getText}
          control={control}
          errors={errors}
          data={søknadsdata?.søknad}
        />
      )}
      {currentStep === 5 && <StepKvittering getText={getText} />}

      {/*
      {currentStep === 1 && (
        <Button variant="primary" onClick={() => router.push(`/utland/${currentStep + 1}`)}>
          <BodyShort>Fortsett til søknaden</BodyShort>
        </Button>
      )}
      {currentStep > 1 && currentStep < 4 && (
        <Button variant="primary" onClick={() => handleNext}>
          Neste
        </Button>
      )}
      <Button
        variant="tertiary"
        type="button"
        onClick={() => router.push(`/utland/${currentStep - 1}`)}
      >
        <BodyShort>Tilbake</BodyShort>
      </Button>

      <Button variant="tertiary" type="button" onClick={() => onDeleteSøknad()}>
        <BodyShort>Slett påbegynt søknad</BodyShort>
      </Button>
    
      */}
    </>
  );
};

export default Utland;
