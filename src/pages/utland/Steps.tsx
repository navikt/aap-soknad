import { BodyShort, GuidePanel, Heading, Label} from "@navikt/ds-react";
import {FieldErrors} from "react-hook-form";
import ControlSelect from "../../components/input/ControlSelect";
import ControlDatoVelger from "../../components/input/ControlDatoVelger";
import {vFirstDateIsAfterSecondDate} from "../../utils/formValidation";
import countries from "i18n-iso-countries";
import ControlConfirmationPanel from "../../components/input/ControlConfirmationPanel";
import React from "react";
import {formatDate} from "../../utils/date";
import {utland as Texts} from "../../texts/nb.json";

interface IntroductionProps {
  texts: any;
}
export const StepIntroduction = ({texts}: IntroductionProps) =>
  (<>
    <GuidePanel poster>
      {texts('steps.introduction.guideText')}
    </GuidePanel>
  </>)

interface SelectCountryProps {
  texts: any;
  control: any;
  errors: FieldErrors;
  countries: string[][];
}
export const StepSelectCountry = ({ texts, countries, control, errors }: SelectCountryProps) =>
  (<>
    <GuidePanel poster>
      {texts('steps.country.guideText')}
    </GuidePanel>
    <ControlSelect
      name="country"
      label={Texts?.form?.country?.label}
      control={control}
      error={errors.country?.message}
      required={texts('form.country.required')}
      validate={(value) => value !== "none" || texts('form.country.required')}
    >
      { countries.map(([key, val]) => <option key={key} value={key}>{val}</option>) }
    </ControlSelect>
  </>)

interface SelectTravelPeriodProps {
  texts: any;
  control: any;
  errors: FieldErrors;
  getValues: (payload?: any) => any
}
export const StepSelectTravelPeriod = ({ texts, control, errors, getValues }: SelectTravelPeriodProps) =>
  (<>
    <ControlDatoVelger
      name="fromDate"
      label={Texts?.form?.fromDate?.label}
      control={control}
      error={errors.fromDate?.message}
      required={texts('form.fromDate.required')}
    />
    <ControlDatoVelger
      name="toDate"
      label={Texts?.form?.toDate?.label}
      control={control}
      error={errors.toDate?.message}
      required={texts('form.toDate.required')}
      validate={() =>
        vFirstDateIsAfterSecondDate(
          getValues('toDate'),
          getValues('fromDate')
        )}
    />
  </>)

interface SummaryProps {
  texts: any;
  control: any;
  errors: FieldErrors;
  data: any
}
export const StepSummary = ({texts, data, control, errors}: SummaryProps) => {
  const getFormInputLabel = (key: string) =>
    texts(`form.${key}.label`);
  const getFormValueReadable = (key: string, val: any) => {
    switch (key) {
    case 'country':
      return countries.getName(`${val}`, 'nb', {select: 'official'});
    case 'fromDate':
    case 'toDate':
      return formatDate(val, 'dd.MM.yyyy');
    default:
      return val;
    }
  }

  return (<>
    <Heading size="medium" level="2">
      {texts('summary')}
    </Heading>
    {Object.entries(data).filter(([key, val]) => !!val).map(([key, val]) => <div key={key}>
      <Label>{getFormInputLabel(key)}</Label>
      <BodyShort>{getFormValueReadable(key, val)}</BodyShort>
    </div>)}
    <ControlConfirmationPanel label={Texts?.form?.confirmationPanel?.label} control={control} error={errors.confirmationPanel?.message} />
  </>)
}
export const StepKvittering = ({texts}: any) =>
  <GuidePanel>
    {texts('steps.kvittering.guideText')}
  </GuidePanel>;
