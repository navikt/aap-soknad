import {Alert, BodyShort, GuidePanel, Heading, Label} from "@navikt/ds-react";
import {utland as Texts} from "../../texts/nb.json";
import {FieldErrors} from "react-hook-form";
import ControlSelect from "../../components/input/ControlSelect";
import ControlDatoVelger from "../../components/input/ControlDatoVelger";
import {vFirstDateIsAfterSecondDate} from "../../utils/formValidation";
import countries from "i18n-iso-countries";
import {format} from "date-fns";
import {nb} from "date-fns/locale";
import ControlConfirmationPanel from "../../components/input/ControlConfirmationPanel";
import React from "react";

export const StepIntroduction = () =>
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
export const StepSelectCountry = ({ countries, control, errors }: SelectCountryProps) =>
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
export const StepSelectTravelPeriod = ({ control, errors, getValues }: SelectTravelPeriodProps) =>
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
export const StepSummary = ({data, control, errors}: SummaryProps) => {
  const getFormInputLabel = (key: string) => {
    // @ts-ignore
    return Texts?.form?.[key]?.label
  };
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
export interface KvitteringProps {
  success?: boolean;
}
export const StepKvittering = ({ success }: KvitteringProps) =>
  (<>
    {success
      ? <GuidePanel>
        {Texts?.steps?.kvittering?.guideText}
      </GuidePanel>
      : <Alert variant="error" >
        {Texts?.steps?.kvittering?.error}
      </Alert>}
  </>);
