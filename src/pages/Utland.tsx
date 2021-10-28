import React, { useState, useEffect } from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {
  ErrorSummary,
  ErrorSummaryItem,
  GuidePanel,
  Button,
  Label,
  BodyShort,
  Heading,
  Alert,
} from "@navikt/ds-react";
import { useForm, FieldErrors } from "react-hook-form";
import SoknadWizard from "../layouts/SoknadWizard";
import { utland as Texts } from "../texts/nb.json";
import { vFirstDateIsAfterSecondDate } from "../utils/formValidation";
import {format} from "date-fns";
import {nb} from "date-fns/locale";
import ControlConfirmationPanel from "../components/input/ControlConfirmationPanel";
import ControlDatoVelger from "../components/input/ControlDatoVelger";
import ControlSelect from "../components/input/ControlSelect";

// Support norwegian & english languages.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/nb.json"));

type FormValues = {
  country: string;
  fromDate: string;
  toDate: string;
  confirmationPanel: boolean;
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
const getButtonText = (index: number) => {
  switch(index) {
  case 0:
    return 'Fortsett til søknaden';
  case 3:
    return 'Send søknaden';
  default:
    return 'Neste'
  }
}

const getFormInputLabel = (key: string) => {
  // @ts-ignore
  return Texts?.form?.[key]?.label
}
const lastStepIndex = 3;

const StepIntroduction = () =>
  (<>
    <GuidePanel poster>
      {Texts?.steps?.introduction?.guideText}
    </GuidePanel>
  </>)

interface SelectCountryProps {
  control: any;
  errors: FieldErrors;
  countries: string[][];
}
const StepSelectCountry = ({ countries, control, errors }: SelectCountryProps) =>
  (<>
    <GuidePanel poster>
      {Texts?.steps?.country?.guideText}
    </GuidePanel>
    <ControlSelect
      name="country"
      control={control}
      error={errors.country?.message}
      required={Texts?.form?.country?.required}
      validate={(value) => value !== "none" || Texts?.form?.country?.required}
    >
      { countries.map(([key, val]) => <option key={key} value={key}>{val}</option>) }
    </ControlSelect>
  </>)

interface SelectTravelPeriodProps {
  control: any;
  errors: FieldErrors;
  getValues: (payload?: any) => any
}
const StepSelectTravelPeriod = ({ control, errors, getValues }: SelectTravelPeriodProps) =>
  (<>
    <ControlDatoVelger
      name="fromDate"
      control={control}
      error={errors.fromDate?.message}
      required={Texts?.form?.fromDate?.required}
    />
    <ControlDatoVelger
      name="toDate"
      control={control}
      error={errors.toDate?.message}
      required={Texts?.form?.toDate?.required}
      validate={() =>
        vFirstDateIsAfterSecondDate(
          getValues('toDate'),
          getValues('fromDate')
        )}
    />
  </>)

interface SummaryProps {
  control: any;
  errors: FieldErrors;
  data: any
}
const StepSummary = ({data, control, errors}: SummaryProps) => {
  const getFormValueReadable = (key: string, val: any) => {
    switch (key) {
    case 'country':
      return countries.getName(`${val}`, 'nb', {select: 'official'});
    case 'fromDate':
    case 'toDate':
      return format(val, 'dd.MM.yyyy', { locale: nb });
    default:
      return val;
    }
  }

  return (<>
    <Heading size="medium" level="2">
      {Texts?.summary}
    </Heading>
    {Object.entries(data).filter(([key, val]) => !!val).map(([key, val]) => <div key={key}>
      <Label>{getFormInputLabel(key)}</Label>
      <BodyShort>{getFormValueReadable(key, val)}</BodyShort>
    </div>)}
    <ControlConfirmationPanel control={control} error={errors.confirmationPanel?.message} />
  </>)
}
interface KvitteringProps {
  success?: boolean;
}
const StepKvittering = ({ success }: KvitteringProps) =>
  (<>
    {success
      ? <GuidePanel>
        {Texts?.steps?.kvittering?.guideText}
      </GuidePanel>
      : <Alert variant="error" >
        {Texts?.steps?.kvittering?.error}
      </Alert>}
  </>);

const Utland = (): JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [soknadData, setSoknadData] = useState<FormValues>({
    country: "none",
    fromDate: "",
    toDate: "",
    confirmationPanel: false,
  });
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
  } = useForm<FormValues>({
    defaultValues: {
      country: "none",
      fromDate: undefined,
      toDate: undefined,
      confirmationPanel: false,
    },
  });
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


  return (
    <SoknadWizard
      title={Texts?.pageTitle}
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
            {getButtonText(currentStepIndex)}
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
