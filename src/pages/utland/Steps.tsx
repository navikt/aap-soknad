import { BodyShort, GuidePanel, Heading, Label } from '@navikt/ds-react';
import { FieldErrors } from 'react-hook-form';
import SelectWrapper from '../../components/input/SelectWrapper';
import DatoVelgerWrapper from '../../components/input/DatoVelgerWrapper';
import countries from 'i18n-iso-countries';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import React from 'react';
import { formatDate } from '../../utils/date';
import { GetText } from '../../hooks/useTexts';
import { parseISO, isDate } from 'date-fns';

interface IntroductionProps {
  getText: GetText;
}
export const StepIntroduction = ({ getText }: IntroductionProps) => (
  <>
    <GuidePanel poster>{getText('steps.introduction.guidetext')}</GuidePanel>
  </>
);

interface SelectCountryProps {
  getText: GetText;
  control: any;
  errors: FieldErrors;
  countries: string[][];
}
export const StepSelectCountry = ({ getText, countries, control, errors }: SelectCountryProps) => (
  <>
    <GuidePanel poster>{getText('steps.country.guidetext')}</GuidePanel>
    <SelectWrapper
      name="country"
      label={getText('form.country.label')}
      control={control}
      error={errors.country?.message}
    >
      {[
        <option key="none" value="none">
          Velg land
        </option>,
        ...countries.map(([key, val]) => (
          <option key={key} value={key}>
            {val}
          </option>
        )),
      ]}
    </SelectWrapper>
  </>
);

interface SelectTravelPeriodProps {
  getText: GetText;
  control: any;
  errors: FieldErrors;
  getValues: (payload?: any) => any;
}
export const StepSelectTravelPeriod = ({ getText, control, errors }: SelectTravelPeriodProps) => (
  <>
    <DatoVelgerWrapper
      name="fromDate"
      label={getText('form.fromdate.label')}
      control={control}
      error={errors.fromDate?.message}
    />
    <DatoVelgerWrapper
      name="toDate"
      label={getText('form.todate.label')}
      control={control}
      error={errors.toDate?.message}
    />
  </>
);

interface SummaryProps {
  getText: GetText;
  control: any;
  errors: FieldErrors;
  data: any;
}
export const StepSummary = ({ getText, data, control, errors }: SummaryProps) => {
  const getFormInputLabel = (key: string) => getText(`form.${key}.label`);
  const getFormValueReadable = (key: string, val: any) => {
    switch (key) {
      case 'country':
        return countries.getName(`${val}`, 'nb', { select: 'official' });
      case 'fromDate':
      case 'toDate': {
        const date = isDate(val) ? val : parseISO(val);
        return formatDate(date, 'dd.MM.yyyy');
      }
      default:
        return val;
    }
  };

  return (
    <>
      <Heading size="medium" level="2">
        {getText('summary')}
      </Heading>
      {Object.entries(data)
        .filter(([key, val]) => !!val)
        .map(([key, val]) => (
          <div key={key}>
            <Label>{getFormInputLabel(key)}</Label>
            <BodyShort>{getFormValueReadable(key, val)}</BodyShort>
          </div>
        ))}
      <ConfirmationPanelWrapper
        name="confirmationPanel"
        label={getText('form.confirmationpanel.label')}
        control={control}
        error={errors.confirmationPanel?.message}
      />
    </>
  );
};
export const StepKvittering = ({ getText }: any) => (
  <GuidePanel>{getText('steps.kvittering.guidetext')}</GuidePanel>
);
