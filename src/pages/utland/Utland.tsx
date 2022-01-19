import React, {useContext, useEffect, useMemo, useState} from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {Button, Loader} from "@navikt/ds-react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";

import {ModalContext} from "../../context/modalContext";
import SoknadWizard, {StepType} from "../../layouts/SoknadWizard";
import {StepIntroduction, StepKvittering, StepSelectCountry, StepSelectTravelPeriod, StepSummary,} from "./Steps";
import {fetchPOST} from "../../api/useFetch";
import {formatDate} from "../../utils/date";
import useTexts from "../../hooks/useTexts";
import {getUtlandSchemas} from "../../schemas/utland";
import {Step} from "../../components/Step";
import {FormErrorSummary} from "../../components/schema/FormErrorSummary";
import {useSoknadContext} from "../../hooks/useSoknadContext";
import {SoknadActionKeys} from "../../context/soknadActions";
import SoknadUtland from "../../types/SoknadUtland";
import {SøknadType} from "../../context/soknadContext";
import useSteps from "../../hooks/useSteps";

// Support norwegian & english languages.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/nb.json"));

enum StepName {
  INTRODUCTION = "INTRODUCTION",
  COUNTRY = "COUNTRY",
  PERIOD = "PERIOD",
  SUMMARY = "SUMMARY",
  RECEIPT = "RECEIPT",
}
// Move inside component in useState if we need dynamic steps
const initStepList: StepType[] = [
  { name: StepName.INTRODUCTION },
  { name: StepName.COUNTRY },
  { name: StepName.PERIOD },
  { name: StepName.SUMMARY },
  { name: StepName.RECEIPT },
];

const getButtonText = (name: string) => {
  switch (name) {
    case StepName.INTRODUCTION:
      return "Fortsett til søknaden";
    case StepName.SUMMARY:
      return "Send søknaden";
    default:
      return "Neste";
  }
};

const showButton = (name: string) => {
  switch (name) {
    case StepName.RECEIPT:
      return false;
    default:
      return true;
  }
};

const Utland = (): JSX.Element => {
  const {stepList, currentStepIndex, goToNamedStep, goToNextStep, goToPreviousStep, nextStep, currentStep} = useSteps(initStepList);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { state, dispatch } = useSoknadContext(SøknadType.UTLAND);

  const { getText } = useTexts("utland");
  const { handleNotificationModal } = useContext(ModalContext);

  const SoknadUtlandSchemas = getUtlandSchemas(getText);
  const currentSchema = SoknadUtlandSchemas[currentStepIndex];
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
  const onSubmitClick = async (data: SoknadUtland) => {
    if (currentStepNameIs(StepName.SUMMARY)) {
      setIsLoading(true);
      const postResponse = await fetchPOST("/aap/soknad-api/innsending/utland", {
        land: state?.søknad?.country,
        periode: {
          fom: formatDate(state?.søknad?.fromDate, "yyyy-MM-dd"),
          tom: formatDate(state?.søknad?.toDate, "yyyy-MM-dd"),
        },
      });
      setIsLoading(false);
      if (postResponse.ok) {
        goToNextStep();
      } else {
        // TODO frontend-error error
        handleNotificationModal({
          heading: "En feil har oppstått!",
          text: "Vi beklager. Venligst send inn søknaden på nytt, eller prøv igjen senere",
          type: "error",
        });
      }
    } else {
      goToNextStep();
    }
    dispatch({type: SoknadActionKeys.SET_CURRENT_STEP, payload: nextStep?.name})
    dispatch({type: SoknadActionKeys.SET_SOKNAD, payload: data});
  };
  const currentStepNameIs = (name: StepName) =>
    name === currentStep.name;

  return (
    <SoknadWizard
      title={getText('pageTitle')}
      stepList={stepList}
      currentStepIndex={currentStepIndex}
    >
      <>
        <Step renderWhen={currentStepNameIs(StepName.INTRODUCTION)}>
          <StepIntroduction getText={getText} />
        </Step>
        <form
          onSubmit={handleSubmit(async (data) => onSubmitClick(data))}
          className="soknad-utland-form"
        >
          <Step renderWhen={currentStepNameIs(StepName.COUNTRY)}>
            <StepSelectCountry
              getText={getText}
              control={control}
              errors={errors}
              countries={countryList}
            />
          </Step>

          <Step renderWhen={currentStepNameIs(StepName.PERIOD)}>
            <StepSelectTravelPeriod
              getText={getText}
              control={control}
              errors={errors}
              getValues={getValues}
            />
          </Step>

          <Step renderWhen={currentStepNameIs(StepName.SUMMARY)}>
            <StepSummary
              getText={getText}
              control={control}
              errors={errors}
              data={state?.søknad}
            />
          </Step>

          <FormErrorSummary errors={errors} />

          {showButton(currentStep?.name) && (
            <Button variant="primary" type="submit" disabled={isLoading}>
              {getButtonText(currentStep?.name)}
              {isLoading && <Loader />}
            </Button>
          )}
        </form>
        <Step renderWhen={currentStepNameIs(StepName.RECEIPT)}>
          <StepKvittering getText={getText} />
        </Step>
        <Button variant="tertiary" onClick={goToPreviousStep}>
          Tilbake
        </Button>
      </>
    </SoknadWizard>
  );
};

export default Utland;
