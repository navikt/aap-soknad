import React, { useState, useEffect, useContext } from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {
  ErrorSummary,
  ErrorSummaryItem,
  Button, Loader,
} from "@navikt/ds-react";
import { useForm, FieldErrors } from "react-hook-form";
import { ModalContext } from "../../context/modalContext";
import SoknadWizard, {Step} from "../../layouts/SoknadWizard";
import { utland as Texts } from "../../texts/nb.json";
import {
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary
} from "./Steps";
import {fetchPOST} from "../../api/useFetch";
import {formatDate} from "../../utils/date";
import useTexts from "../../hooks/useTexts";
import { yupResolver } from '@hookform/resolvers/yup';
import {getUtlandSchemas} from "../../schemas/utland";


// Support norwegian & english languages.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/nb.json"));

enum StepName {
  INTRODUCTION = 'INTRODUCTION',
  COUNTRY = 'COUNTRY',
  PERIOD = 'PERIOD',
  SUMMARY = 'SUMMARY',
  RECEIPT = 'RECEIPT',
}
// Move inside component in useState if we need dynamic steps
const stepList: Step[] = [
  { name: StepName.INTRODUCTION},
  { name: StepName.COUNTRY},
  { name: StepName.PERIOD},
  { name: StepName.SUMMARY},
  { name: StepName.RECEIPT}
];

type FormValues = {
  country: string;
  fromDate?: string;
  toDate?: string;
  confirmationPanel: boolean;
};
const defaultForm: FormValues = {
  country: "none",
  fromDate: undefined,
  toDate: undefined,
  confirmationPanel: false,
};

const FormErrorSummary = ({ errors }: FieldErrors) => {
  const keyList = Object.keys(errors).filter((e) => e);
  if (keyList.length < 1) return null;
  return (
    <ErrorSummary>
      {keyList.map((key) => (
        <ErrorSummaryItem key={key} href={`#${key}`}>
          {
            // @ts-ignore
            errors[key]?.message
          }
        </ErrorSummaryItem>
      ))}
    </ErrorSummary>
  );
};
const getButtonText = (name: string) => {
  switch(name) {
  case StepName.INTRODUCTION:
    return 'Fortsett til søknaden';
  case StepName.SUMMARY:
    return 'Send søknaden';
  default:
    return 'Neste'
  }
}

const showButton = (name: string) => {
  switch(name) {
  case StepName.RECEIPT:
    return false;
  default:
    return true;
  }
}



const Utland = (): JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [soknadData, setSoknadData] = useState<FormValues>(defaultForm);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { getText} = useTexts('utland');
  const { handleNotificationModal } = useContext(ModalContext);

  const SoknadUtlandSchemas = getUtlandSchemas(getText);
  const currentSchema = SoknadUtlandSchemas[currentStepIndex];

  useEffect(() => {
    const getCountries = () => {
      const list = Object.entries(countries.getNames("nb", {select: "official"}))
      setCountryList(list);
    }
    getCountries();
  }, [setCountryList])
  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(currentSchema), defaultValues: defaultForm});
  const onSubmitClick = async (data: FormValues) => {
    if (currentStepNameIs(StepName.SUMMARY)) {
      setIsLoading(true);
      const postResponse = await fetchPOST('/aap/api/innsending/utland', {
        land: soknadData?.country,
        periode: {
          fom: formatDate(soknadData.fromDate,'yyyy-MM-dd'),
          tom: formatDate(soknadData.toDate, 'yyyy-MM-dd')
        }
      });
      setIsLoading(false);
      if(postResponse.ok) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // TODO frontend-error error
        handleNotificationModal({
          heading: 'En feil har oppstått!',
          text: 'Vi beklager. Venligst send inn søknaden på nytt, eller prøv igjen senere',
          type: 'error'})
      }
    } else {
      console.log(data);
      setSoknadData({...data});
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }
  const onBackButtonClick = () => setCurrentStepIndex(currentStepIndex - 1);
  const getStepName = (index: number) => stepList[index]?.name;
  const currentStepNameIs = (name: StepName) => name === getStepName(currentStepIndex);

  return (
    <SoknadWizard
      title={Texts?.pageTitle}
      stepList={stepList}
      currentStepIndex={currentStepIndex}
    >
      <>
        {currentStepNameIs(StepName.INTRODUCTION) &&
          <StepIntroduction getText={getText} />}
        <form onSubmit={handleSubmit( async data => await onSubmitClick(data))} className="soknad-utland-form">

          {currentStepNameIs(StepName.COUNTRY) &&
          <StepSelectCountry getText={getText} control={control} errors={errors} countries={countryList}/>}

          {currentStepNameIs(StepName.PERIOD) &&
          <StepSelectTravelPeriod getText={getText} control={control} errors={errors} getValues={getValues} />}

          {currentStepNameIs(StepName.SUMMARY) &&
          <StepSummary getText={getText} control={control} errors={errors} data={soknadData} />}

          <FormErrorSummary errors={errors} />

          {showButton(getStepName(currentStepIndex)) &&
          <Button variant="primary" type="submit" disabled={isLoading}>
            {getButtonText(getStepName(currentStepIndex))}
            {isLoading && <Loader />}
          </Button>}
        </form>
        {currentStepNameIs(StepName.RECEIPT) &&
        <StepKvittering getText={getText} />}
        <Button variant="tertiary" onClick={onBackButtonClick}>Tilbake</Button>
      </>
    </SoknadWizard>
  );
};

export default Utland;
