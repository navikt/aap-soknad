import { BodyShort, Button, GuidePanel, Heading, Label } from '@navikt/ds-react';
import { FieldValues, useForm } from 'react-hook-form';
import DatoVelgerWrapper from '../../components/input/DatoVelgerWrapper';
import countries from 'i18n-iso-countries';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import React, { useEffect } from 'react';
import { formatDate } from '../../utils/date';
import { GetText } from '../../hooks/useTexts';
import { isDate, parseISO } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../context/stepWizardContextV2';
import CountrySelector from '../../components/input/CountrySelector';
import SoknadFormWrapper from '../../components/SoknadFormWrapper/SoknadFormWrapper';
import SoknadUtland from '../../types/SoknadUtland';
import * as classes from '../standard/Veiledning/Veiledning.module.css';
import Soknad from '../../types/Soknad';
import { useLagrePartialSoknad } from '../../hooks/useLagreSoknad';

interface IntroductionProps {
  getText: GetText;
  onSubmit: () => void;
}
export const StepIntroduction = ({ getText, onSubmit }: IntroductionProps) => {
  return (
    <>
      <GuidePanel poster>{getText('steps.introduction.guidetext')}</GuidePanel>
      <div className={classes?.buttonWrapper}>
        <Button variant="primary" type="button" onClick={() => onSubmit()}>
          {'Fortsett til søknaden'}
        </Button>
        <Button variant="tertiary" type="button" onClick={() => console.log('TODO')}>
          {'Slett påbegynt søknad'}
        </Button>
      </div>
    </>
  );
};

interface SelectCountryProps {
  getText: GetText;
  onBackClick: () => void;
}
export const StepSelectCountry = ({ getText, onBackClick }: SelectCountryProps) => {
  const LAND = 'country';
  const schema = yup.object().shape({
    country: yup
      .string()
      .required(getText('form.country.required'))
      .notOneOf(['none'], getText('form.country.required')),
  });
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const lagrePartialSøknad = useLagrePartialSoknad();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [LAND]: søknadState?.søknad?.[LAND],
    },
  });
  const allFields = watch();
  useEffect(() => {
    lagrePartialSøknad(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <>
      <GuidePanel poster>{getText('steps.country.guidetext')}</GuidePanel>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        nextButtonText={'Neste steg'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <CountrySelector
          name={LAND}
          label={getText('form.country.label')}
          control={control}
          error={errors.country?.message}
        />
      </SoknadFormWrapper>
    </>
  );
};

interface SelectTravelPeriodProps {
  getText: GetText;
  søknad?: SoknadUtland;
  onBackClick: () => void;
}
export const StepSelectTravelPeriod = ({
  getText,
  søknad,
  onBackClick,
}: SelectTravelPeriodProps) => {
  const FRA_DATO = 'fromDate';
  const TIL_DATO = 'toDate';
  const schema = yup.object().shape({
    [FRA_DATO]: yup.date().required(getText('form.fromdate.required')),
    [TIL_DATO]: yup
      .date()
      .required(getText('form.todate.required'))
      .when(
        'fromDate',
        (fromDate, yup) => fromDate && yup.min(fromDate, getText('form.todate.afterfromdate'))
      ),
  });
  const lagrePartialSøknad = useLagrePartialSoknad();
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [FRA_DATO]: søknad?.[FRA_DATO],
      [TIL_DATO]: søknad?.[TIL_DATO],
    },
  });
  const allFields = watch();
  useEffect(() => {
    lagrePartialSøknad(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <DatoVelgerWrapper
        name={FRA_DATO}
        label={getText('form.fromdate.label')}
        control={control}
        error={errors?.[FRA_DATO]?.message}
      />
      <DatoVelgerWrapper
        name={TIL_DATO}
        label={getText('form.todate.label')}
        control={control}
        error={errors?.[TIL_DATO]?.message}
      />
    </SoknadFormWrapper>
  );
};

interface SummaryProps {
  getText: GetText;
  data: any;
  onBackClick: () => void;
  onSubmitSoknad: (data: Soknad) => void;
}
export const StepSummary = ({ getText, data, onBackClick }: SummaryProps) => {
  const BEKREFT = 'fromDate';
  const schema = yup.object().shape({
    [BEKREFT]: yup
      .boolean()
      .required(getText('form.confirmationPanel.required'))
      .oneOf([true], getText('form.confirmationPanel.required')),
  });
  const lagrePartialSøknad = useLagrePartialSoknad();
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });
  const allFields = watch();
  useEffect(() => {
    lagrePartialSøknad(søknadState, stepList, allFields);
  }, [allFields]);
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
        .filter(([, val]) => !!val)
        .map(([key, val]) => (
          <div key={key}>
            <Label>{getFormInputLabel(key)}</Label>
            <BodyShort>{getFormValueReadable(key, val)}</BodyShort>
          </div>
        ))}
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        nextButtonText={'Send søknad'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <ConfirmationPanelWrapper
          name={BEKREFT}
          label={getText('form.confirmationpanel.label')}
          control={control}
          error={errors.confirmationPanel?.message}
        />
      </SoknadFormWrapper>
    </>
  );
};
export const StepKvittering = ({ getText }: any) => (
  <GuidePanel>{getText('steps.kvittering.guidetext')}</GuidePanel>
);
