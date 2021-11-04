import React, { useState, useEffect, useContext } from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {
  ErrorSummary,
  ErrorSummaryItem,
  Button,
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
const lastStepIndex = stepList.length - 1;

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
  const { handleNotificationModal } = useContext(ModalContext);
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
  } = useForm<FormValues>({ defaultValues: defaultForm});
  const onSubmitClick = async (data: FormValues) => {
    console.log(currentStepIndex, lastStepIndex)
    if (currentStepNameIs(StepName.SUMMARY)) {
      const postResponse = await fetchPOST('/aap/api/innsending/utland', {
        land: soknadData?.country,
        periode: {
          fom: formatDate(soknadData.fromDate,'yyyy-MM-dd'),
          tom: formatDate(soknadData.toDate, 'yyyy-MM-dd')
        }
      });
      console.log('postresponse', postResponse);
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
          <StepIntroduction />}
        <form onSubmit={handleSubmit( async data => await onSubmitClick(data))} className="soknad-utland-form">

          {currentStepNameIs(StepName.COUNTRY) &&
          <StepSelectCountry control={control} errors={errors} countries={countryList}/>}

          {currentStepNameIs(StepName.PERIOD) &&
          <StepSelectTravelPeriod control={control} errors={errors} getValues={getValues} />}

          {currentStepNameIs(StepName.SUMMARY) &&
          <StepSummary control={control} errors={errors} data={soknadData} />}

          <FormErrorSummary errors={errors} />

          {showButton(getStepName(currentStepIndex)) &&
          <Button variant="primary" type="submit">
            {getButtonText(getStepName(currentStepIndex))}
          </Button>}
        </form>
        {currentStepNameIs(StepName.RECEIPT) &&
        <StepKvittering />}
        <Button variant="tertiary" onClick={onBackButtonClick}>Tilbake</Button>
      </>
    </SoknadWizard>
  );
};

export default Utland;
