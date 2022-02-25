import { BodyShort, Button, Loader } from '@navikt/ds-react';
import countries from 'i18n-iso-countries';
import { Step, StepWizard } from '../../components/StepWizard';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ModalContext } from '../../context/modalContext';
import {
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary,
} from './Steps';
import { fetchPOST } from '../../api/fetch';
import { formatDate } from '../../utils/date';
import useTexts from '../../hooks/useTexts';
import { getUtlandSchemas } from '../../schemas/utland';
import { FormErrorSummary } from '../../components/schema/FormErrorSummary';
import {
  hentSoknadState,
  slettLagretSoknadState,
  SøknadType,
  useSoknadContext,
} from '../../context/soknadContext';
import {
  useStepWizard,
  completeAndGoToNextStep,
  goToPreviousStep,
  resetStepWizard,
} from '../../context/stepWizardContextV2';
import * as tekster from './tekster';

import SoknadForm from '../../types/SoknadForm';
import { SoknadActionKeys } from '../../context/soknadActions';
import SoknadUtland from '../../types/SoknadUtland';
// Support norwegian & english languages.
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));
enum StepNames {
  INTRODUCTION = 'INTRODUCTION',
  DESTINATION = 'DESTINATION',
  TRAVEL_PERIOD = 'TRAVEL_PERIOD',
  SUMMARY = 'SUMMARY',
  RECEIPT = 'RECEIPT',
}
const getButtonText = (name?: string) => {
  switch (name) {
    case StepNames.INTRODUCTION:
      return 'Fortsett til søknaden';
    case StepNames.SUMMARY:
      return 'Send søknaden';
    default:
      return 'Neste';
  }
};

const showButton = (name?: string) => {
  switch (name) {
    case StepNames.RECEIPT:
      return false;
    default:
      return true;
  }
};

const Utland = (): JSX.Element => {
  const { søknadState, søknadDispatch } = useSoknadContext();
  // const {
  //   currentStepIndex,
  //   goToNamedStep,
  //   goToNextStep,
  //   setNamedStepCompleted,
  //   currentStep,
  //   nextStep,
  //   goToPreviousStep,
  //   resetStepWizard,
  // } = useContext(StepWizardContext);
  const { currentStep, currentStepIndex, stepWizardDispatch } = useStepWizard();
  const [countryList, setCountryList] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { getText } = useTexts(tekster);
  const { handleNotificationModal } = useContext(ModalContext);

  const SoknadUtlandSchemas = getUtlandSchemas(getText);
  const currentSchema = useMemo(() => {
    return SoknadUtlandSchemas[currentStepIndex];
  }, [currentStepIndex, SoknadUtlandSchemas]);

  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(currentSchema),
    defaultValues: useMemo(() => søknadState?.søknad, [søknadState]),
  });
  useEffect(() => {
    hentSoknadState(søknadDispatch, SøknadType.UTLAND);
  }, []);
  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames('nb', { select: 'official' }));
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  const myHandleSubmit = async (data: SoknadForm<SoknadUtland>) => {
    if (currentStep.name === StepNames.SUMMARY) {
      setIsLoading(true);
      const postResponse = await postSøknad(søknadState?.søknad);
      setIsLoading(false);
      if (!postResponse.ok) {
        console.error('noe gikk galt med sletting av lagret søknad', postResponse.error);
      }
    }
    // lagreState
    søknadDispatch({ type: SoknadActionKeys.SET_SOKNAD, payload: data });
    completeAndGoToNextStep(stepWizardDispatch);
  };
  const postSøknad = async (data?: SoknadForm<SoknadUtland>) =>
    fetchPOST('/aap/soknad-api/innsending/utland', {
      land: data?.country,
      periode: {
        fom: formatDate(data?.fromDate, 'yyyy-MM-dd'),
        tom: formatDate(data?.toDate, 'yyyy-MM-dd'),
      },
    });
  const onDeleteSøknad = async () => {
    if (søknadState.type) {
      const deleteRes = await slettLagretSoknadState(søknadDispatch, søknadState.type);
      if (deleteRes) {
        resetStepWizard(stepWizardDispatch);
      } else {
        console.error('noe gikk galt med sletting av lagret søknad');
      }
    }
  };

  return (
    <StepWizard hideLabels={false}>
      <Step order={1} name={StepNames.INTRODUCTION}>
        <StepIntroduction getText={getText} />
      </Step>
      <form
        onSubmit={handleSubmit(myHandleSubmit)}
        className="soknad-utland-form"
        autoComplete="off"
      >
        <Step order={2} name={StepNames.DESTINATION} label="Destinasjon">
          <StepSelectCountry
            getText={getText}
            control={control}
            errors={errors}
            countries={countryList}
          />
        </Step>
        <Step order={3} name={StepNames.TRAVEL_PERIOD} label="Periode">
          <StepSelectTravelPeriod
            getText={getText}
            control={control}
            errors={errors}
            getValues={getValues}
          />
        </Step>
        <Step order={4} name={StepNames.SUMMARY} label="Oppsummering">
          <StepSummary
            getText={getText}
            control={control}
            errors={errors}
            data={søknadState?.søknad}
          />
        </Step>
        <FormErrorSummary errors={errors} />
        <Step order={5} name={StepNames.RECEIPT} label="Kvittering">
          <StepKvittering getText={getText} />
        </Step>
        {showButton(currentStep?.name) && (
          <Button variant="primary" type="submit" disabled={isLoading}>
            <BodyShort>{getButtonText(currentStep?.name)}</BodyShort>
            {isLoading && <Loader />}
          </Button>
        )}
        <Button
          variant="tertiary"
          type="button"
          onClick={() => goToPreviousStep(stepWizardDispatch)}
        >
          <BodyShort>Tilbake</BodyShort>
        </Button>
        <Button variant="tertiary" type="button" onClick={() => onDeleteSøknad()}>
          <BodyShort>Slett påbegynt søknad</BodyShort>
        </Button>
      </form>
    </StepWizard>
  );
};

export default Utland;
