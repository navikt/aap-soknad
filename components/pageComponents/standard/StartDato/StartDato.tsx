import { Soknad } from 'types/Soknad';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BodyShort,
  DatePicker,
  Heading,
  Label,
  Radio,
  RadioGroup,
  TextField,
  useDatepicker,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import ColorPanel from 'components/panel/ColorPanel';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';

import { GenericSoknadContextState } from 'types/SoknadContext';
import * as classes from './StartDato.module.css';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { validate } from '../../../../lib/utils/validationUtils';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';
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

const StartDato = ({ onBackClick, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.yrkesskade]);

  const FerieTypeTekster = useMemo(
    () => ({
      [FerieType.PERIODE]: formatMessage(FerieTypeToMessageKey(FerieType.PERIODE)),
      [FerieType.DAGER]: formatMessage(FerieTypeToMessageKey(FerieType.DAGER)),
    }),
    [formatMessage]
  );

  const { datepickerProps: fraDatoProps, inputProps: fraDatoInputProps } = useDatepicker({
    fromDate: new Date(),
    onDateChange: (value) => {
      clearError('ferie.fraDato');
      updateSøknadData(søknadDispatch, {
        ferie: { ...søknadState?.søknad?.ferie, fraDato: value },
      });
    },
    ...(defaultValues?.søknad?.ferie?.fraDato !== undefined && {
      defaultSelected: new Date(defaultValues.søknad.ferie.fraDato),
    }),
  });

  const { datepickerProps: tilDatoProps, inputProps: tilDatoInputProps } = useDatepicker({
    fromDate: new Date(),
    onDateChange: (value) => {
      clearError('ferie.tilDato');
      updateSøknadData(søknadDispatch, {
        ferie: { ...søknadState?.søknad?.ferie, tilDato: value },
      });
    },
    ...(defaultValues?.søknad?.ferie?.tilDato !== undefined && {
      defaultSelected: new Date(defaultValues.søknad.ferie.tilDato),
    }),
  });

  function clearError(path: string) {
    setErrors(errors?.filter((error) => error.path != path));
  }

  function findError(path: string): string | undefined {
    return errors?.find((error) => error.path === path)?.message;
  }

  return (
    <SoknadFormWrapperNew
      onNext={async () => {
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
          clearError('sykepenger');
          updateSøknadData(søknadDispatch, { sykepenger: value });
        }}
        error={findError('sykepenger')}
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
            id={`${FERIE}.${SKALHAFERIE}`}
            value={defaultValues?.søknad?.ferie?.skalHaFerie || ''}
            onChange={(value) => {
              clearError('ferie.skalHaFerie');
              updateSøknadData(søknadDispatch, {
                ferie: { ...søknadState?.søknad?.ferie, skalHaFerie: value },
              });
            }}
            error={findError('ferie.skalHaFerie')}
          >
            <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
            <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
          </RadioGroup>
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.JA && (
            <RadioGroup
              legend={formatMessage('søknad.startDato.ferieType.label')}
              name={`${FERIE}.${FERIETYPE}`}
              id={`${FERIE}.${FERIETYPE}`}
              value={defaultValues?.søknad?.ferie?.ferieType || ''}
              onChange={(value) => {
                clearError('ferie.ferieType');
                updateSøknadData(søknadDispatch, {
                  ferie: { ...søknadState?.søknad?.ferie, ferieType: value },
                });
              }}
              error={findError('ferie.ferieType')}
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
                    id={`${FERIE}.fraDato`}
                    error={findError('ferie.fraDato')}
                  />
                </DatePicker>
                <DatePicker {...tilDatoProps}>
                  <DatePicker.Input
                    {...tilDatoInputProps}
                    label={formatMessage('søknad.startDato.periode.tilDato.label')}
                    name={`${FERIE}.tilDato`}
                    id={`${FERIE}.tilDato`}
                    error={findError('ferie.tilDato')}
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
                id={`${FERIE}.antallDager`}
                label={formatMessage('søknad.startDato.antallDager.label')}
                description={formatMessage('søknad.startDato.antallDager.description')}
                onChange={(value) => {
                  clearError('ferie.antallDager');
                  updateSøknadData(søknadDispatch, {
                    ferie: { ...søknadState?.søknad?.ferie, antallDager: value.target.value },
                  });
                }}
                error={findError('ferie.antallDager')}
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
