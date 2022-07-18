import { BodyShort, Button, GuidePanel, Heading, Label } from '@navikt/ds-react';
import { FieldValues, useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import React, { useEffect } from 'react';
import { formatDate } from '../../utils/date';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from '../../context/stepWizardContextV2';
import CountrySelector from '../../components/input/CountrySelector';
import SoknadFormWrapper from '../../components/SoknadFormWrapper/SoknadFormWrapper';
import SoknadUtland from '../../types/SoknadUtland';
import * as classes from '../standard/Veiledning/Veiledning.module.css';
import Soknad from '../../types/Soknad';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';
import { updateSøknadData, slettLagretSoknadState } from '../../context/soknadContextCommon';
import { useSoknadContextUtland } from '../../context/soknadContextUtland';
import { useDebounceLagreSoknad } from '../../hooks/useDebounceLagreSoknad';
import DatePickerWrapper from '../../components/input/DatePickerWrapper/DatePickerWrapper';

interface IntroductionProps {
  onSubmit: () => void;
}
export const StepIntroduction = ({ onSubmit }: IntroductionProps) => {
  const { formatMessage } = useFeatureToggleIntl();
  return (
    <>
      <GuidePanel poster>{formatMessage('utland.veiledning.guide.text')}</GuidePanel>
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
  onBackClick: () => void;
}
export const StepSelectCountry = ({ onBackClick }: SelectCountryProps) => {
  const LAND = 'land';
  const { formatMessage } = useFeatureToggleIntl();
  const schema = yup.object().shape({
    [LAND]: yup
      .string()
      .required(formatMessage('utland.land.select.required'))
      .notOneOf(['none'], formatMessage('utland.land.select.required')),
  });
  const { søknadState, søknadDispatch } = useSoknadContextUtland();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<SoknadUtland>();
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
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <>
      <GuidePanel poster>{formatMessage('utland.land.guide.text')}</GuidePanel>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        onDelete={() => slettLagretSoknadState(søknadDispatch, søknadState)}
        nextButtonText={'Neste steg'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <CountrySelector
          name={LAND}
          label={formatMessage('utland.land.select.label')}
          control={control}
          error={errors.country?.message}
        />
      </SoknadFormWrapper>
    </>
  );
};

interface SelectTravelPeriodProps {
  søknad?: SoknadUtland;
  onBackClick: () => void;
}
export const StepSelectTravelPeriod = ({ søknad, onBackClick }: SelectTravelPeriodProps) => {
  const FRA_DATO = 'fraDato';
  const TIL_DATO = 'tilDato';
  const { formatMessage } = useFeatureToggleIntl();
  const schema = yup.object().shape({
    [FRA_DATO]: yup.date().required(formatMessage('utland.periode.fraDato.label')),
    [TIL_DATO]: yup
      .date()
      .required(formatMessage('utland.periode.tilDato.label'))
      .when(
        FRA_DATO,
        (fromDate, yup) =>
          fromDate && yup.min(fromDate, formatMessage('utland.periode.tilDato.afterfromdate'))
      ),
  });
  const debouncedLagre = useDebounceLagreSoknad<SoknadUtland>();
  const { søknadState, søknadDispatch } = useSoknadContextUtland();
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
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onDelete={() => slettLagretSoknadState(søknadDispatch, søknadState)}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <DatePickerWrapper
        name={FRA_DATO}
        label={formatMessage('utland.periode.fraDato.label')}
        control={control}
        error={errors?.[FRA_DATO]?.message}
      />
      <DatePickerWrapper
        name={TIL_DATO}
        label={formatMessage('utland.periode.tilDato.label')}
        control={control}
        error={errors?.[TIL_DATO]?.message}
      />
    </SoknadFormWrapper>
  );
};

interface SummaryProps {
  data: any;
  onBackClick: () => void;
  onSubmitSoknad: (data: Soknad) => void;
}
export const StepSummary = ({ data, onBackClick }: SummaryProps) => {
  const { formatMessage } = useFeatureToggleIntl();
  const BEKREFT = 'bekreftelse';
  const schema = yup.object().shape({
    [BEKREFT]: yup
      .boolean()
      .required(formatMessage('utland.oppsummering.bekreftelse.required'))
      .oneOf([true], formatMessage('utland.oppsummering.bekreftelse.required')),
  });
  const debouncedLagre = useDebounceLagreSoknad<SoknadUtland>();
  const { søknadState, søknadDispatch } = useSoknadContextUtland();
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
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);

  return (
    <>
      <Heading size="medium" level="2">
        {formatMessage('utland.oppsummering.title')}
      </Heading>
      <Label>{formatMessage('utland.land.select.label')}</Label>
      <BodyShort>{data?.land?.split(':')?.[1]}</BodyShort>
      <Label>{formatMessage('utland.periode.fraDato.label')}</Label>
      <BodyShort>{formatDate(data?.fraDato, 'dd.MM.yyyy')}</BodyShort>
      <Label>{formatMessage('utland.periode.tilDato.label')}</Label>
      <BodyShort>{formatDate(data?.tilDato, 'dd.MM.yyyy')}</BodyShort>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        onDelete={() => slettLagretSoknadState(søknadDispatch, søknadState)}
        nextButtonText={'Send søknad'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <ConfirmationPanelWrapper
          name={BEKREFT}
          label={formatMessage('utland.oppsummering.bekreftelse.label')}
          control={control}
          error={errors.confirmationPanel?.message}
        />
      </SoknadFormWrapper>
    </>
  );
};
export const StepKvittering = () => {
  const { formatMessage } = useFeatureToggleIntl();
  return <GuidePanel>{formatMessage('utland.kvittering.guide.text')}</GuidePanel>;
};
