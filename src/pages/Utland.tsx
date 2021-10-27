import React, { useState, useEffect } from "react";
import countries from "i18n-iso-countries";
import "./Utland.less";
import {
  Select,
  ConfirmationPanel,
  ErrorSummary,
  ErrorSummaryItem,
  GuidePanel,
  Button,
  Label,
  BodyShort,
  Heading,
} from "@navikt/ds-react";
import { Controller, useForm, FieldErrors, FieldValues, UseControllerProps } from "react-hook-form";
import SoknadWizard from "../layouts/SoknadWizard";
import DatoVelger from "../components/datovelger";
import { utland as Texts } from "../texts/nb.json";
import { vFirstDateIsAfterSecondDate } from "../utils/formValidation";

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
const getFormInputLabel = (key: string) => {
  // @ts-ignore
  return Texts?.form?.[key]?.label
}
const lastStepIndex = 2;

interface SelectCountryProps<T> extends UseControllerProps<T> {
  errors: FieldErrors;
  countries: string[][];
}
const StepSelectCountry = <T extends FieldValues>({ countries, name, control, errors }: SelectCountryProps<T>) =>
  (<>
    <GuidePanel poster>
      {Texts?.guideText}
    </GuidePanel>
    <Controller
      name={name}
      control={control}
      rules={{
        required: Texts?.form?.country?.required,
        validate: (value) => value !== "none" || Texts?.form?.country?.required
      }}
      render={({ field: { name, value, onChange } }) => (
        <Select
          name={name}
          label={Texts?.form?.country?.label}
          value={value}
          onChange={onChange}
          error={errors.country?.message}
        >
          <option key="none" value="none">Velg land</option>
          { countries.map(([key, val]) => <option key={key} value={key}>{val}</option>) }
        </Select>
      )}
    />
  </>)

interface SelectTravelPeriodProps {
  control: any;
  errors: FieldErrors;
  getValues: (payload?: any) => any
}
const StepSelectTravelPeriod = ({ control, errors, getValues }: SelectTravelPeriodProps) =>
  (<>
    <Controller
      name={"fromDate"}
      control={control}
      rules={{
        required: Texts?.form?.fromDate?.required,
      }}
      render={({ field: { name, value, onChange } }) => (
        <DatoVelger
          id={name}
          name={"fromDate"}
          label={Texts?.form?.fromDate?.label}
          value={value}
          onChange={onChange}
          error={errors.fromDate?.message}
        />
      )}
    />
    <Controller
      name="toDate"
      control={control}
      rules={{
        required: Texts?.form?.toDate?.required,
        validate: () =>
          vFirstDateIsAfterSecondDate(
            getValues('toDate'),
            getValues('fromDate')
          ),
      }}
      render={({ field: { name, value, onChange } }) => (
        <DatoVelger
          id={name}
          name={name}
          label={Texts?.form?.fromDate?.label}
          value={value}
          onChange={onChange}
          error={errors.toDate?.message}
        />
      )}
    />
  </>)

interface SummaryProps {
  control: any;
  errors: FieldErrors;
  data: any
}
const StepSummary = ({data, control, errors}: SummaryProps) =>
  (<>
    <Heading size="medium" level="2" >
      {Texts?.summary}
    </Heading>
    {Object.entries(data).filter(([key, val]) => !!val).map(([key, val]) => <>
      <Label>{getFormInputLabel(key)}</Label>
      <BodyShort>{`${val}`}</BodyShort>
    </>)}
    <Controller
      name="confirmationPanel"
      control={control}
      rules={{
        required: "Kryss av for å bekrefte",
      }}
      render={({ field: { name, value, onChange } }) => (
        <ConfirmationPanel
          id={name}
          name={name}
          label={Texts?.form?.confirmationPanel?.label}
          checked={value}
          onChange={onChange}
          error={errors.confirmationPanel?.message}
        />
      )}
    />
  </>)


const Utland = (): JSX.Element => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [soknadData, setSoknadData] = useState<FormValues>({
    country: "none",
    fromDate: "",
    toDate: "",
    confirmationPanel: false,
  });
  const [countryList, setCountryList] = useState<string[][]>([]);
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
  const onSubmitClick = (data: FormValues) => {
    if (currentStepIndex < lastStepIndex) {
      console.log(data);
      setSoknadData({...data});
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // TODO: Post data
      console.log(data);
    }
  }

  return (
    <SoknadWizard
      title={Texts?.pageTitle}
    >
      <form onSubmit={handleSubmit( data => onSubmitClick(data))} className="soknad-utland-form">
        {currentStepIndex === 0 &&
          <StepSelectCountry name="country" control={control} errors={errors} countries={countryList}/>}
        {currentStepIndex === 1 &&
          <StepSelectTravelPeriod control={control} errors={errors} getValues={getValues} />}
        {currentStepIndex === 2 &&
          <StepSummary control={control} errors={errors} data={soknadData} />}
        <FormErrorSummary errors={errors} />
        <Button variant="primary" type="submit">
          Send inn
        </Button>
      </form>
    </SoknadWizard>
  );
};

export default Utland;
