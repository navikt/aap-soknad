import { useForm, useWatch } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Label,
  Alert,
  BodyShort,
  Heading,
  Radio,
  RadioGroup,
  DatePicker,
  TextField,
  useDatepicker,
} from '@navikt/ds-react';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from 'types/Generic';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import ColorPanel from 'components/panel/ColorPanel';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';

import { GenericSoknadContextState, SøknadType } from 'types/SoknadContext';
import * as classes from './StartDato.module.css';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { DatePickerWrapper } from '../../../input/DatePickerWrapper/DatePickerWrapper';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { validate } from '../../../../lib/utils/validationUtils';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';
import { getYrkesskadeSchema } from '../Yrkesskade/Yrkesskade';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
export enum FerieType {
  DAGER = 'DAGER',
  PERIODE = 'PERIODE',
}

const FERIE = 'ferie';
export const SYKEPENGER = 'sykepenger';
const FERIETYPE = 'ferieType';
const SKALHAFERIE = 'skalHaFerie';

export const FerieTypeToMessageKey = (ferieType: FerieType) => {
  switch (ferieType) {
    case FerieType.PERIODE:
      return 'søknad.startDato.ferieType.values.periode';
    case FerieType.DAGER:
      return 'søknad.startDato.ferieType.values.dager';
  }
};

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export const getStartDatoSchema = (formatMessage: (id: string) => string) => {
  return yup.object().shape({
    [SYKEPENGER]: yup
      .string()
      .required(formatMessage('søknad.startDato.sykepenger.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
    [FERIE]: yup
      .object({
        [SKALHAFERIE]: yup.string().nullable(),
        [FERIETYPE]: yup.string().nullable(),
        fraDato: yup.date().nullable(),
        tilDato: yup.date().nullable(),
        antallDager: yup.string().nullable(),
      })
      .when(SYKEPENGER, ([sykepenger], schema) => {
        if (sykepenger === JaEllerNei.JA) {
          return yup.object({
            [SKALHAFERIE]: yup
              .string()
              .required(formatMessage('søknad.startDato.skalHaFerie.validation.required')),
            [FERIETYPE]: yup.string().when(SKALHAFERIE, ([skalHaFerie], schema) => {
              if (skalHaFerie === JaEllerNei.JA) {
                return yup
                  .string()
                  .required(formatMessage('søknad.startDato.ferieType.validation.required'))
                  .nullable();
              }
              return schema;
            }),

            fraDato: yup.date().when(FERIETYPE, ([ferieType], schema) => {
              if (ferieType === FerieType.PERIODE) {
                return yup
                  .date()
                  .required(formatMessage('søknad.startDato.periode.fraDato.validation.required'))
                  .typeError(
                    formatMessage('søknad.startDato.periode.fraDato.validation.typeError')
                  );
              }
              return schema;
            }),

            tilDato: yup.date().when(FERIETYPE, ([ferieType], schema) => {
              if (ferieType === FerieType.PERIODE) {
                return yup
                  .date()
                  .required(formatMessage('søknad.startDato.periode.tilDato.validation.required'))
                  .typeError(formatMessage('søknad.startDato.periode.tilDato.validation.typeError'))
                  .min(
                    yup.ref('fraDato'),
                    formatMessage('søknad.startDato.periode.tilDato.validation.fraDatoEtterTilDato')
                  );
              }
              return schema;
            }),

            antallDager: yup.string().when(FERIETYPE, ([ferieType], schema) => {
              if (ferieType === FerieType.DAGER) {
                return yup
                  .string()
                  .required(formatMessage('søknad.startDato.antallDager.validation.required'));
              }
              return schema;
            }),
          });
        }
        return schema;
      }),
  });
};

const StartDato = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  // const { stepList } = useStepWizard();
  /*const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getStartDatoSchema(formatMessage)),
    defaultValues: {
      [SYKEPENGER]: defaultValues?.søknad?.[SYKEPENGER],
      ferie: {
        ...defaultValues?.søknad?.ferie,
        fraDato: defaultValues?.søknad?.ferie?.fraDato,
        tilDato: defaultValues?.søknad?.ferie?.tilDato,
      },
    },
  });*/
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  //const allFields = useWatch({ control });
  //const memoFields = useMemo(() => allFields, [allFields]);
  /*useEffect(() => {
    debouncedLagre(søknadState, stepList, memoFields);
  }, [memoFields]);
  const erPåSykepenger = useWatch({ control, name: `${SYKEPENGER}` });
  const skalHaFerie = useWatch({ control, name: `${FERIE}.${SKALHAFERIE}` });
  const ferieType = useWatch({ control, name: `${FERIE}.${FERIETYPE}` });*/
  const FerieTypeTekster = useMemo(
    () => ({
      [FerieType.PERIODE]: formatMessage(FerieTypeToMessageKey(FerieType.PERIODE)),
      [FerieType.DAGER]: formatMessage(FerieTypeToMessageKey(FerieType.DAGER)),
    }),
    [formatMessage]
  );

  /*useEffect(() => {
    if (erPåSykepenger !== JaEllerNei.JA) {
      setValue(`${FERIE}.${SKALHAFERIE}`, '');
    }
    clearErrors();
  }, [erPåSykepenger]);
  useEffect(() => {
    if (skalHaFerie !== JaEllerNei.JA) {
      // @ts-ignore // TODO: Finne ut av hvorfor state blir riktig med '' og ikke undefined
      setValue(`${FERIE}.${FERIETYPE}`, '');
    }
    clearErrors();
  }, [skalHaFerie]);

  useEffect(() => {
    if (ferieType !== søknadState?.søknad?.ferie?.ferieType) {
      setValue(`${FERIE}.fraDato`, undefined);
      setValue(`${FERIE}.tilDato`, undefined);
      setValue(`${FERIE}.antallDager`, '');
    }
    clearErrors();
  }, [ferieType, søknadState]);*/
  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();
  const { datepickerProps: fraDatoProps, inputProps: fraDatoInputProps } = useDatepicker({
    fromDate: new Date(),
    onDateChange: (value) =>
      updateSøknadData(søknadDispatch, {
        ferie: { ...søknadState?.søknad?.ferie, fraDato: value },
      }),
    ...(defaultValues?.søknad?.ferie?.fraDato !== undefined && {
      defaultSelected: new Date(defaultValues.søknad.ferie.fraDato),
    }),
  });
  const { datepickerProps: tilDatoProps, inputProps: tilDatoInputProps } = useDatepicker({
    fromDate: new Date(),
    onDateChange: (value) =>
      updateSøknadData(søknadDispatch, {
        ferie: { ...søknadState?.søknad?.ferie, tilDato: value },
      }),
    ...(defaultValues?.søknad?.ferie?.tilDato !== undefined && {
      defaultSelected: new Date(defaultValues.søknad.ferie.tilDato),
    }),
  });
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  return (
    <SoknadFormWrapperNew
      onNext={async (data) => {
        const errors = await validate(getStartDatoSchema(formatMessage), søknadState.søknad);
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }

        logSkjemastegFullførtEvent(currentStepIndex ?? 0);
        completeAndGoToNextStep(stepWizardDispatch);
      }}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.startDato.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{formatMessage('søknad.startDato.guide.text1')}</BodyShort>
      </LucaGuidePanel>
      <RadioGroup
        legend={formatMessage('søknad.startDato.sykepenger.legend')}
        description={formatMessage('søknad.startDato.sykepenger.description')}
        name={`${SYKEPENGER}`}
        value={defaultValues?.søknad?.sykepenger || ''}
        onChange={(value) => {
          setErrors(errors?.filter((error) => error.path != 'sykepenger'));
          updateSøknadData(søknadDispatch, { sykepenger: value });
        }}
        error={errors?.find((error) => error.path === 'sykepenger')?.message}
        id={'sykepenger'}
      >
        <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
        <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
      </RadioGroup>
      {søknadState?.søknad?.sykepenger === JaEllerNei.JA && (
        <ColorPanel color={'grey'}>
          <RadioGroup
            legend={formatMessage('søknad.startDato.skalHaFerie.label')}
            description={formatMessage('søknad.startDato.skalHaFerie.description')}
            name={`${FERIE}.${SKALHAFERIE}`}
            value={defaultValues?.søknad?.ferie?.skalHaFerie || ''}
            onChange={(value) => {
              updateSøknadData(søknadDispatch, {
                ferie: { ...søknadState?.søknad?.ferie, skalHaFerie: value },
              });
            }}
            error={errors?.find((error) => error.path === 'ferie.skalHaFerie')?.message}
            id={'ferie.skalHaFerie'}
          >
            <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
            <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
          </RadioGroup>
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.JA && (
            <RadioGroup
              legend={formatMessage('søknad.startDato.ferieType.label')}
              name={`${FERIE}.${FERIETYPE}`}
              value={defaultValues?.søknad?.ferie?.ferieType || ''}
              onChange={(value) => {
                updateSøknadData(søknadDispatch, {
                  ferie: { ...søknadState?.søknad?.ferie, ferieType: value },
                });
              }}
            >
              <Radio value={FerieType.PERIODE}>
                <BodyShort>{FerieTypeTekster.PERIODE}</BodyShort>
              </Radio>
              <Radio value={FerieType.DAGER}>
                <BodyShort>{FerieTypeTekster.DAGER}</BodyShort>
              </Radio>
            </RadioGroup>
          )}
          {søknadState?.søknad?.ferie?.ferieType === FerieType.PERIODE && (
            <div className={classes?.periodeContainer}>
              <Label>{formatMessage('søknad.startDato.periode.label')}</Label>
              <div className={classes?.datoContainer}>
                <DatePicker {...fraDatoProps}>
                  <DatePicker.Input
                    {...fraDatoInputProps}
                    label={formatMessage('søknad.startDato.periode.fraDato.label')}
                    name={`${FERIE}.fraDato`}
                  />
                </DatePicker>
                <DatePicker {...tilDatoProps}>
                  <DatePicker.Input
                    {...tilDatoInputProps}
                    label={formatMessage('søknad.startDato.periode.tilDato.label')}
                    name={`${FERIE}.tilDato`}
                  />
                </DatePicker>
              </div>
            </div>
          )}
          {søknadState?.søknad?.ferie?.ferieType === FerieType.DAGER && (
            <div className={classes?.antallDagerContainer}>
              <TextField
                className={classes?.antallDagerTekst}
                name={`${FERIE}.antallDager`}
                label={formatMessage('søknad.startDato.antallDager.label')}
                description={formatMessage('søknad.startDato.antallDager.description')}
                onChange={(value) => {
                  updateSøknadData(søknadDispatch, {
                    ferie: { ...søknadState?.søknad?.ferie, antallDager: value.target.value },
                  });
                }}
              />
            </div>
          )}
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.NEI && (
            <Alert variant={'info'}>{formatMessage('søknad.startDato.alert.text')}</Alert>
          )}
        </ColorPanel>
      )}
    </SoknadFormWrapperNew>
  );
};

export default StartDato;
