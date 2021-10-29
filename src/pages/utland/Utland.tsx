import React, { useState, useEffect } from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {
  ErrorSummary,
  ErrorSummaryItem,
  Button,
} from "@navikt/ds-react";
import { useForm, FieldErrors } from "react-hook-form";
import SoknadWizard, {Step} from "../../layouts/SoknadWizard";
import { utland as Texts } from "../../texts/nb.json";
import {
  KvitteringProps,
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary
} from "./Steps";

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


const Utland = (): JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [soknadData, setSoknadData] = useState<FormValues>(defaultForm);
  const [countryList, setCountryList] = useState<string[][]>([]);
  const [soknadKvittering, setSoknadKvittering] = useState<KvitteringProps>({});
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
    if (currentStepIndex < lastStepIndex) {
      console.log(data);
      setSoknadData({...data});
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      const soknadResponse = await fetch('/aap/api/innsending/utland', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(soknadData)
      });
      if(soknadResponse.status === 200) {
        setSoknadKvittering({success: true});
      } else {
        setSoknadKvittering({success: false});
      }
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }
  const onBackButtonClick = () => setCurrentStepIndex(currentStepIndex - 1);
  const getStepName = (index: number) => stepList[index]?.name;

  return (
    <SoknadWizard
      title={Texts?.pageTitle}
      stepList={stepList}
      currentStepIndex={currentStepIndex}
    >
      <>
        {currentStepIndex === 0 &&
          <StepIntroduction />}
        <form onSubmit={handleSubmit( async data => await onSubmitClick(data))} className="soknad-utland-form">
          {currentStepIndex === 1 &&
          <StepSelectCountry control={control} errors={errors} countries={countryList}/>}
          {currentStepIndex === 2 &&
          <StepSelectTravelPeriod control={control} errors={errors} getValues={getValues} />}
          {currentStepIndex === 3 &&
          <StepSummary control={control} errors={errors} data={soknadData} />}
          <FormErrorSummary errors={errors} />
          <Button variant="primary" type="submit">
            {getButtonText(getStepName(currentStepIndex))}
          </Button>
        </form>
        {currentStepIndex === 4 &&
        <StepKvittering success={soknadKvittering.success} />}
        <Button variant="tertiary" onClick={onBackButtonClick}>Tilbake</Button>
      </>
    </SoknadWizard>
  );
};

export default Utland;
