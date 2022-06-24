import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import React, { useEffect, useMemo, useState } from 'react';
import DatoVelgerWrapper from '../../../components/input/DatoVelgerWrapper';
import { Alert, BodyShort, Cell, Grid, Heading, Radio, ReadMore } from '@navikt/ds-react';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaNeiVetIkke } from '../../../types/Generic';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { isFuture, isPast, isToday, subYears } from 'date-fns';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';
import { setErrorSummaryFocus } from '../../../utils/dom';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useDebounceLagreSoknad } from '../../../hooks/useDebounceLagreSoknad';

const STARTDATO = 'startDato';
const FERIE = 'ferie';
const FERIETYPE = 'ferieType';
const SKALHAFERIE = 'skalHaFerie';
const HVORFOR = 'hvorfor';
const BEGRUNNELSE = 'begrunnelse';

const startDateIsInPast = (startDate: Date) => {
  return !isToday(startDate) && isPast(startDate);
};

const startDateIsInFuture = (startDate: Date) => {
  return !isToday(startDate) && isFuture(startDate);
};

const getStartDatoType = (startDate: Date) => {
  if (startDateIsInPast(startDate)) return 'FORTID';
  if (startDateIsInFuture(startDate)) return 'FREMTID';
  return 'I_DAG';
};

interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}

export const getSchema = (formatMessage: (id: string) => string) => {
  return yup.object().shape({
    [STARTDATO]: yup
      .date()
      .required(formatMessage('søknad.startDato.startDato.validation.required'))
      .min(
        subYears(new Date(), 3),
        formatMessage('søknad.startDato.startDato.validation.eldreEnnTreÅr')
      )
      .nullable(),

    [HVORFOR]: yup.string().when([STARTDATO], {
      is: startDateIsInPast,
      then: yup
        .string()
        .required(formatMessage('søknad.startDato.hvorfor.validation.required'))
        .oneOf(['Sykdom', 'Manglende informasjon'])
        .nullable(),
    }),
    [BEGRUNNELSE]: yup.string().when([STARTDATO], {
      is: startDateIsInPast || startDateIsInFuture,
      then: yup.string().nullable(),
    }),
    [FERIE]: yup.object().when([STARTDATO], {
      is: (val: Date) => val === undefined || !startDateIsInPast(val),
      then: yup.object().shape({
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
    }),
  });
};

const StartDato = ({ onBackClick }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const [tidspunktStartDato, setTidspunktStartDato] = useState<
    'FORTID' | 'I_DAG' | 'FREMTID' | undefined
  >(undefined);
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(getSchema(formatMessage)),
    defaultValues: {
      startDato: søknadState?.søknad?.startDato,
      hvorfor: søknadState?.søknad?.hvorfor,
      begrunnelse: søknadState?.søknad?.begrunnelse,
      ferie: søknadState?.søknad?.ferie,
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const startDato: Date = watch(STARTDATO);
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
    if (skalHaFerie !== søknadState?.søknad?.ferie?.skalHaFerie) {
      setValue(`${FERIE}.${FERIETYPE}`, undefined);
    }
  }, [skalHaFerie, søknadState]);
  useEffect(() => {
    if (ferieType !== søknadState?.søknad?.ferie?.ferieType) {
      setValue(`${FERIE}.fraDato`, undefined);
      setValue(`${FERIE}.tilDato`, undefined);
      setValue(`${FERIE}.antallDager`, undefined);
    }
  }, [ferieType, søknadState]);
  useEffect(() => {
    if (startDato?.toISOString() !== søknadState?.søknad?.startDato?.toISOString()) {
      console.log('not equal, will reset');
      const startDatoType = getStartDatoType(new Date(startDato));
      if (startDatoType !== 'I_DAG') {
        setValue(HVORFOR, undefined);
        setValue(BEGRUNNELSE, undefined);
      } else {
        setValue(`${FERIE}.${FERIETYPE}`, undefined);
        setValue(`${FERIE}.${SKALHAFERIE}`, undefined);
        setValue(`${FERIE}.fraDato`, undefined);
        setValue(`${FERIE}.tilDato`, undefined);
        setValue(`${FERIE}.antallDager`, undefined);
      }
      setTidspunktStartDato(startDatoType);
    }
  }, [startDato, søknadState]);

  return (
    <SoknadFormWrapper
      onNext={handleSubmit(
        (data) => {
          updateSøknadData<Soknad>(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        },
        () => setErrorSummaryFocus()
      )}
      onBack={() => onBackClick()}
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

        <ReadMore header={formatMessage('søknad.startDato.guide.readMore.title')} type={'button'}>
          {formatMessage('søknad.startDato.guide.readMore.text')}
        </ReadMore>
      </LucaGuidePanel>
      <DatoVelgerWrapper
        name={`${STARTDATO}`}
        label={formatMessage('søknad.startDato.startDato.label')}
        control={control}
        error={errors.startDato?.message}
      />

      {tidspunktStartDato === 'FORTID' && (
        <ColorPanel>
          <RadioGroupWrapper
            legend={formatMessage('søknad.startDato.hvorfor.label')}
            name={HVORFOR}
            control={control}
            error={errors?.hvorfor?.message}
          >
            <Radio value="Sykdom">{formatMessage('søknad.startDato.hvorfor.values.sykdom')}</Radio>
            <Radio value="Manglende informasjon">
              {formatMessage('søknad.startDato.hvorfor.values.feilinformasjon')}
            </Radio>
          </RadioGroupWrapper>
          <TextAreaWrapper
            name={BEGRUNNELSE}
            label={formatMessage('søknad.startDato.begrunnelse.label')}
            description={formatMessage('søknad.startDato.begrunnelse.description')}
            control={control}
            error={errors?.begrunnelse?.message}
          />
        </ColorPanel>
      )}

      {tidspunktStartDato === 'FREMTID' && (
        <ColorPanel>
          <TextAreaWrapper
            name={BEGRUNNELSE}
            label={formatMessage('søknad.startDato.begrunnelseFremITid.label')}
            description={formatMessage('søknad.startDato.begrunnelseFremITid.description')}
            control={control}
            error={errors?.begrunnelse?.message}
          />
        </ColorPanel>
      )}

      {tidspunktStartDato !== 'FORTID' && (
        <>
          <RadioGroupWrapper
            legend={formatMessage('søknad.startDato.skalHaFerie.label')}
            description={formatMessage('søknad.startDato.skalHaFerie.label')}
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
                  <Cell xs={5}>
                    <DatoVelgerWrapper
                      name={`${FERIE}.fraDato`}
                      label={formatMessage('søknad.startDato.periode.fraDato.label')}
                      control={control}
                      error={errors?.[`${FERIE}`]?.fraDato?.message}
                    />
                  </Cell>
                  <Cell xs={5}>
                    <DatoVelgerWrapper
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
        </>
      )}
    </SoknadFormWrapper>
  );
};
export default StartDato;
