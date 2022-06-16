import { BodyShort, Button, GuidePanel, Heading, Label } from '@navikt/ds-react';
import { FieldValues, useForm } from 'react-hook-form';
import DatoVelgerWrapper from '../../components/input/DatoVelgerWrapper';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import React, { useEffect } from 'react';
import { formatDate } from '../../utils/date';
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
import { useIntl } from 'react-intl';

interface IntroductionProps {
  onSubmit: () => void;
}
export const StepIntroduction = ({ onSubmit }: IntroductionProps) => {
  const intl = useIntl();
  return (
    <>
      <GuidePanel poster>{intl.formatMessage({ id: 'utland.veiledning.guide.text' })}</GuidePanel>
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
  const intl = useIntl();
  const schema = yup.object().shape({
    [LAND]: yup
      .string()
      .required(intl.formatMessage({ id: 'utland.land.select.required' }))
      .notOneOf(['none'], intl.formatMessage({ id: 'utland.land.select.required' })),
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
      <GuidePanel poster>{intl.formatMessage({ id: 'utland.land.guide.text' })}</GuidePanel>
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
          label={intl.formatMessage({ id: 'utland.land.select.label' })}
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
  const intl = useIntl();
  const schema = yup.object().shape({
    [FRA_DATO]: yup.date().required(intl.formatMessage({ id: 'utland.periode.fraDato.label' })),
    [TIL_DATO]: yup
      .date()
      .required(intl.formatMessage({ id: 'utland.periode.tilDato.label' }))
      .when(
        FRA_DATO,
        (fromDate, yup) =>
          fromDate &&
          yup.min(fromDate, intl.formatMessage({ id: 'utland.periode.tilDato.afterfromdate' }))
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
        label={intl.formatMessage({ id: 'utland.periode.fraDato.label' })}
        control={control}
        error={errors?.[FRA_DATO]?.message}
      />
      <DatoVelgerWrapper
        name={TIL_DATO}
        label={intl.formatMessage({ id: 'utland.periode.tilDato.label' })}
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
  const intl = useIntl();
  const BEKREFT = 'bekreftelse';
  const schema = yup.object().shape({
    [BEKREFT]: yup
      .boolean()
      .required(intl.formatMessage({ id: 'utland.oppsummering.bekreftelse.required' }))
      .oneOf([true], intl.formatMessage({ id: 'utland.oppsummering.bekreftelse.required' })),
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

  return (
    <>
      <Heading size="medium" level="2">
        {intl.formatMessage({ id: 'utland.oppsummering.title' })}
      </Heading>
      <Label>{intl.formatMessage({ id: 'utland.land.select.label' })}</Label>
      <BodyShort>{data?.land?.split(':')?.[1]}</BodyShort>
      <Label>{intl.formatMessage({ id: 'utland.periode.fraDato.label' })}</Label>
      <BodyShort>{formatDate(data?.fraDato, 'dd.MM.yyyy')}</BodyShort>
      <Label>{intl.formatMessage({ id: 'utland.periode.tilDato.label' })}</Label>
      <BodyShort>{formatDate(data?.tilDato, 'dd.MM.yyyy')}</BodyShort>
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
          label={intl.formatMessage({ id: 'utland.oppsummering.bekreftelse.label' })}
          control={control}
          error={errors.confirmationPanel?.message}
        />
      </SoknadFormWrapper>
    </>
  );
};
export const StepKvittering = () => {
  const intl = useIntl();
  return <GuidePanel>{intl.formatMessage({ id: 'utland.kvittering.guide.text' })}</GuidePanel>;
};
