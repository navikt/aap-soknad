import {BodyShort, Button, Loader} from "@navikt/ds-react";
import countries from "i18n-iso-countries";
import { StepWizard, Step } from '../../components/StepWizard';
import React, {useContext, useEffect, useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {ModalContext} from "../../context/modalContext";
import {StepIntroduction, StepKvittering, StepSelectCountry, StepSelectTravelPeriod, StepSummary,} from "./Steps";
import {fetchPOST} from "../../api/useFetch";
import {formatDate} from "../../utils/date";
import useTexts from "../../hooks/useTexts";
import {getUtlandSchemas} from "../../schemas/utland";
import {FormErrorSummary} from "../../components/schema/FormErrorSummary";
import {useSoknadContext} from "../../hooks/useSoknadContext";
import {SøknadType} from "../../context/soknadContext";
import useSteps from "../../hooks/useSteps";

import * as tekster from "./tekster";

import {StepWizardContext} from "../../context/stepWizardContext";
import SoknadForm from "../../types/SoknadForm";
import {SoknadActionKeys} from "../../context/soknadActions";
// Support norwegian & english languages.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/nb.json"));
enum StepNames {
  INTRODUCTION = "INTRODUCTION",
  DESTINATION = "DESTINATION",
  TRAVEL_PERIOD = "TRAVEL_PERIOD",
  SUMMARY = "SUMMARY",
  RECEIPT = "RECEIPT",
}
const getButtonText = (name?: string) => {
  switch (name) {
    case StepNames.INTRODUCTION:
      return "Fortsett til søknaden";
    case StepNames.SUMMARY:
      return "Send søknaden";
    default:
      return "Neste";
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
  const { state, dispatch, deleteStoredState } = useSoknadContext(SøknadType.UTLAND);
  const { currentStepIndex, goToNamedStep, goToNextStep, setNamedStepCompleted, currentStep, nextStep, goToPreviousStep, resetStepWizard } = useContext(StepWizardContext);
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
    defaultValues: useMemo(() => state?.søknad, [state]),
  });
  useEffect(() => {
    if(state.currentStep && state.søknad) {
      reset({...state.søknad});
      goToNamedStep(state.currentStep as string);
    }
  }, [state, reset, goToNamedStep]);

  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(
        countries.getNames("nb", { select: "official" })
      );
      setCountryList(list);
    };
    getCountries();
  }, [setCountryList]);
  const myHandleSubmit = async (data: SoknadForm) => {
    switch(currentStep.name) {
      case StepNames.SUMMARY:
        setIsLoading(true);
        const postResponse = await postSøknad(state?.søknad);
        setIsLoading(false);
        console.log('postResponse', postResponse);
        if(!postResponse.ok) {
          handleNotificationModal({
            heading: 'Feil',
            text: postResponse.error,
            type: 'error'
          });
          return;
        }
        break;
      default:
        break;
    }
    dispatch({type: SoknadActionKeys.SET_CURRENT_STEP, payload: nextStep?.name})
    dispatch({type: SoknadActionKeys.SET_SOKNAD, payload: data});
    setNamedStepCompleted(currentStep.name);
    goToNextStep();
  }
  const postSøknad = async (data?: SoknadForm) =>
    fetchPOST("/aap/soknad-api/innsending/utland", {
      land: data?.country,
      periode: {
        fom: formatDate(data?.fromDate, "yyyy-MM-dd"),
        tom: formatDate(data?.toDate, "yyyy-MM-dd"),
      },
    });
  const onDeleteSøknad = async () => {
    const deleteRes = await deleteStoredState(state.type);
    if(deleteRes) {
      resetStepWizard();
    } else {
      handleNotificationModal({
        heading: 'Feil',
        text: 'Noe gikk galt. Venligst forsøk igjen senere.',
        type: 'error'
      });
    }
  }

  return (
    <StepWizard hideLabels={false}>
      <Step order={1} name={StepNames.INTRODUCTION} >
        <StepIntroduction getText={getText} />
      </Step>
      <form
        onSubmit={handleSubmit(myHandleSubmit)}
        className="soknad-utland-form"
      >
        <Step order={2} name={StepNames.DESTINATION} label='Destinasjon'>
          <StepSelectCountry
            getText={getText}
            control={control}
            errors={errors}
            countries={countryList}
          />
        </Step>
        <Step order={3} name={StepNames.TRAVEL_PERIOD} label='Periode'>
          <StepSelectTravelPeriod
            getText={getText}
            control={control}
            errors={errors}
            getValues={getValues}
          />
        </Step>
        <Step order={4} name={StepNames.SUMMARY} label='Oppsummering'>
          <StepSummary
            getText={getText}
            control={control}
            errors={errors}
            data={state?.søknad}
          />
        </Step>
        <FormErrorSummary errors={errors} />
        <Step order={5} name={StepNames.RECEIPT} label='Kvittering' >
          <StepKvittering getText={getText} />
        </Step>
        {showButton(currentStep?.name) && <Button variant="primary" type="submit" disabled={isLoading} >
          <BodyShort>{getButtonText(currentStep?.name)}</BodyShort>
          {isLoading && <Loader />}
        </Button>}
        <Button variant="tertiary" type="button" onClick={goToPreviousStep}>
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
