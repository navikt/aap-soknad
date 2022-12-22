import { useForm, useWatch } from 'react-hook-form';
import { Ferie, Soknad } from 'types/Soknad';
import React, { useEffect, useMemo } from 'react';
import { Alert, BodyShort, Heading, Label, Radio } from '@navikt/ds-react';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from 'types/Generic';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import ColorPanel from 'components/panel/ColorPanel';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { useStepWizard } from 'context/stepWizardContextV2';
import { LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';

import { GenericSoknadContextState } from 'types/SoknadContext';
import * as classes from './StartDato.module.css';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { DatePickerWrapper } from '../../../input/DatePickerWrapper/DatePickerWrapper';

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
    [FERIE]: yup.object().when([SYKEPENGER], {
      is: JaEllerNei.JA,
      then: yup.object({
        [SKALHAFERIE]: yup
          .string()
          .required(formatMessage('søknad.startDato.skalHaFerie.validation.required'))
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI]),
        [FERIETYPE]: yup.string().when([SKALHAFERIE], {
          is: JaEllerNei.JA,
          then: yup
            .string()
            .required(formatMessage('søknad.startDato.ferieType.validation.required'))
            .nullable(),
        }),
        ['fraDato']: yup.date().when([FERIETYPE], {
          is: FerieType.PERIODE,
          then: yup
            .date()
            .required(formatMessage('søknad.startDato.periode.fraDato.validation.required')),
        }),
        ['tilDato']: yup.date().when([FERIETYPE], {
          is: FerieType.PERIODE,
          then: yup
            .date()
            .required(formatMessage('søknad.startDato.periode.tilDato.validation.required'))
            .min(
              yup.ref('fraDato'),
              formatMessage('søknad.startDato.periode.tilDato.validation.fraDatoEtterTilDato')
            ),
        }),
        ['antallDager']: yup.string().when([FERIETYPE], {
          is: FerieType.DAGER,
          then: yup
            .string()
            .required(formatMessage('søknad.startDato.antallDager.validation.required')),
        }),
      }),
    }),
  });
};

interface StartDatoFormFields {
  [SYKEPENGER]: JaEllerNei;
  ferie?: Ferie;
}

const StartDato = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<StartDatoFormFields>({
    resolver: yupResolver(getStartDatoSchema(formatMessage)),
    defaultValues: {
      [SYKEPENGER]: defaultValues?.søknad?.[SYKEPENGER],
      ferie: {
        ...defaultValues?.søknad?.ferie,
        fraDato: defaultValues?.søknad?.ferie?.fraDato,
        tilDato: defaultValues?.søknad?.ferie?.tilDato,
      },
    },
    shouldUnregister: true,
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  const memoFields = useMemo(() => allFields, [allFields]);
  useEffect(() => {
    debouncedLagre(søknadState, stepList, memoFields);
  }, [memoFields]);
  const erPåSykepenger = useWatch({ control, name: `${SYKEPENGER}` });
  const skalHaFerie = useWatch({ control, name: `${FERIE}.${SKALHAFERIE}` });
  const ferieType = useWatch({ control, name: `${FERIE}.${FERIETYPE}` });
  const FerieTypeTekster = useMemo(
    () => ({
      [FerieType.PERIODE]: formatMessage(FerieTypeToMessageKey(FerieType.PERIODE)),
      [FerieType.DAGER]: formatMessage(FerieTypeToMessageKey(FerieType.DAGER)),
    }),
    [formatMessage]
  );

  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onNext(data);
      }, setFocusOnErrorSummary)}
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
      <RadioGroupWrapper
        legend={formatMessage('søknad.startDato.sykepenger.legend')}
        description={formatMessage('søknad.startDato.sykepenger.description')}
        name={`${SYKEPENGER}`}
        control={control}
        error={errors?.[SYKEPENGER]?.message}
      >
        <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
        <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
      </RadioGroupWrapper>
      {erPåSykepenger === JaEllerNei.JA && (
        <ColorPanel color={'grey'}>
          <RadioGroupWrapper
            legend={formatMessage('søknad.startDato.skalHaFerie.label')}
            description={formatMessage('søknad.startDato.skalHaFerie.description')}
            name={`${FERIE}.${SKALHAFERIE}`}
            control={control}
            error={errors?.[FERIE]?.[SKALHAFERIE]?.message}
          >
            <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
            <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
          </RadioGroupWrapper>
          {skalHaFerie === JaEllerNei.JA && (
            <RadioGroupWrapper
              legend={formatMessage('søknad.startDato.ferieType.label')}
              name={`${FERIE}.${FERIETYPE}`}
              control={control}
              error={errors?.[`${FERIE}`]?.ferieType?.message}
            >
              <Radio value={FerieType.PERIODE}>
                <BodyShort>{FerieTypeTekster.PERIODE}</BodyShort>
              </Radio>
              <Radio value={FerieType.DAGER}>
                <BodyShort>{FerieTypeTekster.DAGER}</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          )}
          {ferieType === FerieType.PERIODE && (
            <div className={classes?.periodeContainer}>
              <Label>{formatMessage('søknad.startDato.periode.label')}</Label>
              <div className={classes?.datoContainer}>
                <DatePickerWrapper
                  label={formatMessage('søknad.startDato.periode.fraDato.label')}
                  selectedDate={allFields.ferie?.fraDato}
                  name={`${FERIE}.fraDato`}
                  fromDate={new Date()}
                  control={control}
                />
                <DatePickerWrapper
                  label={formatMessage('søknad.startDato.periode.tilDato.label')}
                  selectedDate={allFields?.ferie?.tilDato}
                  name={`${FERIE}.tilDato`}
                  fromDate={new Date()}
                  control={control}
                />
              </div>
            </div>
          )}
          {ferieType === FerieType.DAGER && (
            <div className={classes?.antallDagerContainer}>
              <TextFieldWrapper
                className={classes?.antallDagerTekst}
                name={`${FERIE}.antallDager`}
                label={formatMessage('søknad.startDato.antallDager.label')}
                description={formatMessage('søknad.startDato.antallDager.description')}
                control={control}
                error={errors?.[`${FERIE}`]?.antallDager?.message}
              />
            </div>
          )}
          {skalHaFerie === JaEllerNei.NEI && (
            <Alert variant={'info'}>{formatMessage('søknad.startDato.alert.text')}</Alert>
          )}
        </ColorPanel>
      )}
    </SoknadFormWrapper>
  );
};

export default StartDato;
