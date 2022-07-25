import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import React, { useEffect, useMemo } from 'react';
import { Alert, BodyShort, Cell, Grid, Heading, Radio, ReadMore } from '@navikt/ds-react';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaNeiVetIkke } from '../../../types/Generic';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { format } from 'date-fns';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';
import { setErrorSummaryFocus } from '../../../utils/dom';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useDebounceLagreSoknad } from '../../../hooks/useDebounceLagreSoknad';
import DatePickerWrapper from '../../../components/input/DatePickerWrapper/DatePickerWrapper';
import { GenericSoknadContextState } from '../../../types/SoknadContext';

const FERIE = 'ferie';
const FERIETYPE = 'ferieType';
const SKALHAFERIE = 'skalHaFerie';
const BEGRUNNELSE = 'begrunnelse';

export const formatDate = (date?: Date) => {
  if (date) {
    return format(date, 'yyyy-MM-dd');
  }
  return undefined;
};

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export const getSchema = (formatMessage: (id: string) => string) => {
  return yup.object().shape({
    [BEGRUNNELSE]: yup.string().nullable(),
    [FERIE]: yup.object().shape({
      [SKALHAFERIE]: yup
        .string()
        .required(formatMessage('søknad.startDato.skalHaFerie.validation.required'))
        .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE])
        .nullable(),
      [FERIETYPE]: yup.string().when([SKALHAFERIE], {
        is: JaNeiVetIkke.JA,
        then: yup
          .string()
          .required(formatMessage('søknad.startDato.ferieType.validation.required')),
      }),

      ['fraDato']: yup.date().when([FERIETYPE], {
        is: 'Ja',
        then: yup
          .date()
          .required(formatMessage('søknad.startDato.periode.fraDato.validation.required')),
      }),
      ['tilDato']: yup.date().when([FERIETYPE], {
        is: 'Ja',
        then: yup
          .date()
          .required(formatMessage('søknad.startDato.periode.tilDato.validation.required'))
          .min(
            yup.ref('fraDato'),
            formatMessage('søknad.startDato.periode.tilDato.validation.fraDatoEtterTilDato')
          ),
      }),

      ['antallDager']: yup.string().when([FERIETYPE], {
        is: 'Nei, men jeg vet antall feriedager',
        then: yup
          .string()
          .required(formatMessage('søknad.startDato.antallDager.validation.required')),
      }),
    }),
  });
};

const StartDato = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  console.log('SØKNADSSTATE', defaultValues);
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(getSchema(formatMessage)),
    defaultValues: {
      begrunnelse: defaultValues?.søknad?.begrunnelse,
      ferie: {
        ...defaultValues?.søknad?.ferie,
        fraDato: formatDate(defaultValues?.søknad?.ferie?.fraDato),
        tilDato: formatDate(defaultValues?.søknad?.ferie?.tilDato),
      },
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const skalHaFerie = watch(`${FERIE}.${SKALHAFERIE}`);
  const ferieType = watch(`${FERIE}.${FERIETYPE}`);
  const FerieType = useMemo(
    () => ({
      PERIODE: formatMessage('søknad.startDato.ferieType.values.periode'),
      DAGER: formatMessage('søknad.startDato.ferieType.values.dager'),
    }),
    [formatMessage]
  );
  useEffect(() => {
    if (ferieType !== søknadState?.søknad?.ferie?.ferieType) {
      setValue(`${FERIE}.fraDato`, undefined);
      setValue(`${FERIE}.tilDato`, undefined);
      setValue(`${FERIE}.antallDager`, undefined);
    }
  }, [ferieType, søknadState]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit(
        (data) => {
          onNext(data);
        },
        () => setErrorSummaryFocus()
      )}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
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
        <BodyShort spacing>{formatMessage('søknad.startDato.guide.text2')}</BodyShort>
      </LucaGuidePanel>
      <RadioGroupWrapper
        legend={formatMessage('søknad.startDato.skalHaFerie.label')}
        description={formatMessage('søknad.startDato.skalHaFerie.description')}
        name={`${FERIE}.${SKALHAFERIE}`}
        control={control}
        error={errors?.[FERIE]?.[SKALHAFERIE]?.message}
      >
        <Radio value={JaNeiVetIkke.JA}>{JaNeiVetIkke.JA}</Radio>
        <Radio value={JaNeiVetIkke.NEI}>{JaNeiVetIkke.NEI}</Radio>
        <Radio value={JaNeiVetIkke.VET_IKKE}>{JaNeiVetIkke.VET_IKKE}</Radio>
      </RadioGroupWrapper>
      {skalHaFerie === JaNeiVetIkke.JA && (
        <ColorPanel>
          <RadioGroupWrapper
            legend={formatMessage('søknad.startDato.ferieType.label')}
            name={`${FERIE}.${FERIETYPE}`}
            control={control}
            error={errors?.[`${FERIE}`]?.ferieType?.message}
          >
            <Radio value={FerieType.PERIODE}>
              <BodyShort>{FerieType.PERIODE}</BodyShort>
            </Radio>
            <Radio value={FerieType.DAGER}>
              <BodyShort>{FerieType.DAGER}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          {ferieType === FerieType.PERIODE ? (
            <Grid>
              <Cell xs={12} lg={5}>
                <DatePickerWrapper
                  name={`${FERIE}.fraDato`}
                  label={formatMessage('søknad.startDato.periode.fraDato.label')}
                  control={control}
                  error={errors?.[`${FERIE}`]?.fraDato?.message}
                />
              </Cell>
              <Cell xs={12} lg={5}>
                <DatePickerWrapper
                  name={`${FERIE}.tilDato`}
                  label={formatMessage('søknad.startDato.periode.tilDato.label')}
                  control={control}
                  error={errors?.[`${FERIE}`]?.tilDato?.message}
                />
              </Cell>
            </Grid>
          ) : (
            <></>
          )}
          {ferieType === FerieType.DAGER ? (
            <TextFieldWrapper
              name={`${FERIE}.antallDager`}
              label={formatMessage('søknad.startDato.antallDager.label')}
              control={control}
              error={errors?.[`${FERIE}`]?.antallDager?.message}
            />
          ) : (
            <></>
          )}
        </ColorPanel>
      )}
      {skalHaFerie === JaNeiVetIkke.VET_IKKE && (
        <Alert variant={'info'}>{formatMessage('søknad.startDato.alert.text')}</Alert>
      )}
      <ReadMore header={formatMessage('søknad.startDato.guide.readMore.title')} type={'button'}>
        <div>
          <TextAreaWrapper
            name={BEGRUNNELSE}
            label={''}
            description={formatMessage('søknad.startDato.begrunnelse.description')}
            control={control}
            error={errors?.begrunnelse?.message}
          />
        </div>
      </ReadMore>
    </SoknadFormWrapper>
  );
};

export default StartDato;
