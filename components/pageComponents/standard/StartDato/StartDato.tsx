import { Soknad } from 'types/Soknad';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BodyShort, Heading, Label, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import ColorPanel from 'components/panel/ColorPanel';
import * as yup from 'yup';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import * as classes from './StartDato.module.css';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { validate } from 'lib/utils/validationUtils';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { IntlFormatters, useIntl } from 'react-intl';
import TilDato from './TilDato';
import FraDato from './FraDato';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';

export enum FerieType {
  DAGER = 'DAGER',
  PERIODE = 'PERIODE',
}

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
}

export const getStartDatoSchema = (formatMessage: IntlFormatters['formatMessage']) => {
  return yup.object().shape({
    sykepenger: yup
      .string()
      .required(formatMessage({ id: 'søknad.startDato.sykepenger.required' }))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
    ferie: yup
      .object({
        skalHaFerie: yup.string().nullable(),
        ferieType: yup.string().nullable(),
        fraDato: yup.date().nullable(),
        tilDato: yup.date().nullable(),
        antallDager: yup.string().nullable(),
      })
      .when('sykepenger', ([sykepenger], schema) => {
        if (sykepenger === JaEllerNei.JA) {
          return yup.object({
            skalHaFerie: yup
              .string()
              .required(formatMessage({ id: 'søknad.startDato.skalHaFerie.validation.required' })),
            ferieType: yup.string().when('skalHaFerie', ([skalHaFerie], schema) => {
              if (skalHaFerie === JaEllerNei.JA) {
                return yup
                  .string()
                  .required(formatMessage({ id: 'søknad.startDato.ferieType.validation.required' }))
                  .nullable();
              }
              return schema;
            }),

            fraDato: yup.date().when('ferieType', ([ferieType], schema) => {
              if (ferieType === FerieType.PERIODE) {
                return yup
                  .date()
                  .required(
                    formatMessage({ id: 'søknad.startDato.periode.fraDato.validation.required' }),
                  )
                  .typeError(
                    formatMessage({ id: 'søknad.startDato.periode.fraDato.validation.typeError' }),
                  );
              }
              return schema;
            }),

            tilDato: yup.date().when('ferieType', ([ferieType], schema) => {
              if (ferieType === FerieType.PERIODE) {
                return yup
                  .date()
                  .required(
                    formatMessage({ id: 'søknad.startDato.periode.tilDato.validation.required' }),
                  )
                  .typeError(
                    formatMessage({ id: 'søknad.startDato.periode.tilDato.validation.typeError' }),
                  )
                  .min(
                    yup.ref('fraDato'),
                    formatMessage({
                      id: 'søknad.startDato.periode.tilDato.validation.fraDatoEtterTilDato',
                    }),
                  );
              }
              return schema;
            }),

            antallDager: yup.string().when('ferieType', ([ferieType], schema) => {
              if (ferieType === FerieType.DAGER) {
                return yup
                  .string()
                  .required(
                    formatMessage({ id: 'søknad.startDato.antallDager.validation.required' }),
                  );
              }
              return schema;
            }),
          });
        }
        return schema;
      }),
  });
};

const StartDato = ({ onBackClick }: Props) => {
  const { formatMessage } = useIntl();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const { søknadState, søknadDispatch } = useSoknad();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.sykepenger, søknadState.søknad?.ferie]);

  const FerieTypeTekster = useMemo(
    () => ({
      [FerieType.PERIODE]: formatMessage({ id: FerieTypeToMessageKey(FerieType.PERIODE) }),
      [FerieType.DAGER]: formatMessage({ id: FerieTypeToMessageKey(FerieType.DAGER) }),
    }),
    [formatMessage],
  );

  function clearErrors() {
    setErrors(undefined);
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
        onBackClick();
      }}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage({ id: 'søknad.startDato.title' })}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{formatMessage({ id: 'søknad.startDato.guide.text1' })}</BodyShort>
      </LucaGuidePanel>
      <RadioGroup
        legend={formatMessage({ id: 'søknad.startDato.sykepenger.legend' })}
        description={formatMessage({ id: 'søknad.startDato.sykepenger.description' })}
        name={'sykepenger'}
        id={'sykepenger'}
        value={søknadState?.søknad?.sykepenger || ''}
        onChange={(value) => {
          clearErrors();
          updateSøknadData(søknadDispatch, { sykepenger: value, ferie: undefined });
        }}
        error={findError('sykepenger')}
      >
        <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
        <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
      </RadioGroup>
      {søknadState?.søknad?.sykepenger === JaEllerNei.JA && (
        <ColorPanel color={'grey'}>
          <RadioGroup
            legend={formatMessage({ id: 'søknad.startDato.skalHaFerie.label' })}
            description={formatMessage({ id: 'søknad.startDato.skalHaFerie.description' })}
            name={'ferie.skalHaFerie'}
            id={'ferie.skalHaFerie'}
            value={søknadState?.søknad?.ferie?.skalHaFerie || ''}
            onChange={(value) => {
              clearErrors();
              updateSøknadData(søknadDispatch, {
                ferie: { skalHaFerie: value },
              });
            }}
            error={findError('ferie.skalHaFerie')}
          >
            <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
            <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
          </RadioGroup>
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.JA && (
            <RadioGroup
              legend={formatMessage({ id: 'søknad.startDato.ferieType.label' })}
              name={'ferie.ferieType'}
              id={'ferie.ferieType'}
              value={søknadState?.søknad?.ferie?.ferieType || ''}
              onChange={(value) => {
                clearErrors();
                updateSøknadData(søknadDispatch, {
                  ferie: {
                    skalHaFerie: søknadState?.søknad?.ferie?.skalHaFerie,
                    ferieType: value,
                  },
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
              <Label>{formatMessage({ id: 'søknad.startDato.periode.label' })}</Label>
              <div className={classes?.datoContainer}>
                <FraDato
                  clearErrors={clearErrors}
                  errorMessage={findError('ferie.fraDato')}
                  defaultValues={søknadState}
                />
                <TilDato
                  clearErrors={clearErrors}
                  errorMessage={findError('ferie.tilDato')}
                  defaultValues={søknadState}
                />
              </div>
            </div>
          )}
          {søknadState?.søknad?.ferie?.ferieType === FerieType.DAGER && (
            <div className={classes?.antallDagerContainer}>
              <TextField
                className={classes?.antallDagerTekst}
                name={'ferie.antallDager'}
                id={'ferie.antallDager'}
                value={søknadState?.søknad?.ferie?.antallDager || ''}
                label={formatMessage({ id: 'søknad.startDato.antallDager.label' })}
                description={formatMessage({ id: 'søknad.startDato.antallDager.description' })}
                onChange={(value) => {
                  clearErrors();
                  updateSøknadData(søknadDispatch, {
                    ferie: {
                      skalHaFerie: søknadState?.søknad?.ferie?.skalHaFerie,
                      ferieType: søknadState?.søknad?.ferie?.ferieType,
                      antallDager: value.target.value,
                    },
                  });
                }}
                error={findError('ferie.antallDager')}
              />
            </div>
          )}
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.NEI && (
            <Alert variant={'info'}>{formatMessage({ id: 'søknad.startDato.alert.text' })}</Alert>
          )}
        </ColorPanel>
      )}
    </SoknadFormWrapperNew>
  );
};

export default StartDato;
