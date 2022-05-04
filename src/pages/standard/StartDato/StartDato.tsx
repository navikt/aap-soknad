import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import { getParagraphs, GetText } from '../../../hooks/useTexts';
import React, { useEffect, useMemo, useState } from 'react';
import DatoVelgerWrapper from '../../../components/input/DatoVelgerWrapper';
import {
  Alert,
  BodyLong,
  BodyShort,
  Cell,
  Grid,
  GuidePanel,
  Heading,
  Radio,
  ReadMore,
} from '@navikt/ds-react';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import { JaNeiVetIkke } from '../../../types/Generic';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { isBefore, isPast, isToday, subYears } from 'date-fns';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';

const STARTDATO = 'startDato';
const FERIE = 'ferie';
const FERIETYPE = 'ferieType';
const SKALHAFERIE = 'skalHaFerie';
const HVORFOR = 'hvorfor';
const BEGRUNNELSE = 'begrunnelse';

const validateStartDate = (startDate: Date) => {
  const val = !isToday(startDate) && isPast(startDate);
  console.log('validate', { startDate, val });
  return val;
};

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}

const StartDato = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [STARTDATO]: yup
      .date()
      .required(getText('form.startDato.required'))
      .min(subYears(new Date(), 3), 'form.startDato.eldreEnnTreÅr')
      .typeError(getText('form.startDato.required')),

    [HVORFOR]: yup.string().when([STARTDATO], {
      is: validateStartDate,
      then: yup
        .string()
        .required(getText('form.startDatoFørDagensDato.hvorfor.required'))
        .oneOf(
          ['Sykdom', 'Manglende informasjon'],
          getText('form.startDatoFørDagensDato.hvorfor.required')
        )
        .typeError(getText('form.startDatoFørDagensDato.hvorfor.required')),
    }),
    [BEGRUNNELSE]: yup.string().when([STARTDATO], {
      is: validateStartDate,
      then: yup.string().nullable(),
    }),

    [FERIE]: yup.object().when([STARTDATO], {
      is: (val: Date) => val === undefined || !validateStartDate(val),
      then: yup.object().shape({
        [SKALHAFERIE]: yup
          .string()
          .required(getText('form.ferie.skalHaFerie.required'))
          .oneOf(
            [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
            getText('form.ferie.skalHaFerie.required')
          )
          .typeError(getText('form.ferie.skalHaFerie.required')),
        [FERIETYPE]: yup.string().when([SKALHAFERIE], {
          is: JaNeiVetIkke.JA,
          then: yup.string().required(getText('form.ferie.ferieType.required')),
        }),

        ['fraDato']: yup.date().when([FERIETYPE], {
          is: 'Ja',
          then: yup.date().required(getText('form.ferie.fraDato.required')),
        }),
        ['tilDato']: yup.date().when([FERIETYPE], {
          is: 'Ja',
          then: yup
            .date()
            .required(getText('form.ferie.tilDato.required'))
            .min(yup.ref('fraDato'), getText('form.ferie.tilDato.fraDatoEtterTilDato')),
        }),

        ['antallDager']: yup.string().when([FERIETYPE], {
          is: 'Nei, men jeg vet antall feriedager',
          then: yup.string().required(getText('form.ferie.antallDager.required')),
        }),
      }),
    }),
  });

  const [startDatoEldreEnnDagensDato, setStartDatoEldreEnnDagensDato] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDato: søknad?.startDato,
      hvorfor: søknad?.hvorfor,
      begrunnelse: søknad?.begrunnelse,
      ferie: søknad?.ferie,
    },
  });

  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();

  const startDato = watch(STARTDATO);
  const skalHaFerie = watch(`${FERIE}.${SKALHAFERIE}`);
  const ferieType = watch(`${FERIE}.${FERIETYPE}`);

  const FerieType = useMemo(
    () => ({
      PERIODE: getText(`form.${FERIE}.ferieType.periode`),
      DAGER: getText(`form.${FERIE}.ferieType.dager`),
    }),
    [getText]
  );

  useEffect(() => {
    setValue(`${FERIE}.${FERIETYPE}`, undefined);
  }, [skalHaFerie]);
  useEffect(() => {
    setValue(`${FERIE}.fraDato`, undefined);
    setValue(`${FERIE}.tilDato`, undefined);
    setValue(`${FERIE}.antallDager`, '');
  }, [ferieType]);
  useEffect(() => {
    const startDateIsInPast = validateStartDate(new Date(startDato));
    if (!startDateIsInPast) {
      setValue(HVORFOR, undefined);
      setValue(BEGRUNNELSE, undefined);
    } else {
      setValue(`${FERIE}.${FERIETYPE}`, undefined);
      setValue(`${FERIE}.${SKALHAFERIE}`, undefined);
      setValue(`${FERIE}.fraDato`, undefined);
      setValue(`${FERIE}.tilDato`, undefined);
      setValue(`${FERIE}.antallDager`, '');
    }
    setStartDatoEldreEnnDagensDato(startDateIsInPast);
  }, [startDato]);

  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onCancel={() => onCancelClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {getText('steps.startDato.title')}
      </Heading>
      <GuidePanel>
        {getParagraphs('steps.startDato.guide.paragraphs', getText).map(
          (e: string, index: number) => (
            <BodyLong key={`${index}`}>{e}</BodyLong>
          )
        )}
      </GuidePanel>
      <DatoVelgerWrapper
        name={`${STARTDATO}`}
        /*description={
          <ReadMore header={getText('steps.startDato.guideReadMore.heading')} type={'button'}>
            <BodyLong>{getText('steps.startDato.guideReadMore.text')}</BodyLong>
          </ReadMore>
        }*/
        label={getText(`form.${STARTDATO}.label`)}
        control={control}
        error={errors.startDato?.message}
      />

      {startDatoEldreEnnDagensDato && (
        <>
          <RadioGroupWrapper
            legend={getText('form.startDatoFørDagensDato.hvorfor.label')}
            name={HVORFOR}
            control={control}
            error={errors?.hvorfor?.message}
          >
            <Radio value="Sykdom">{getText('form.startDatoFørDagensDato.hvorfor.helse')}</Radio>
            <Radio value="Manglende informasjon">
              {getText('form.startDatoFørDagensDato.hvorfor.feilinformasjon')}
            </Radio>
          </RadioGroupWrapper>
          <TextAreaWrapper
            name={BEGRUNNELSE}
            label={getText('form.startDatoFørDagensDato.begrunnelse.label')}
            control={control}
            error={errors?.begrunnelse?.message}
          />
        </>
      )}

      {!startDatoEldreEnnDagensDato && (
        <>
          <RadioGroupWrapper
            legend={getText('form.ferie.skalHaFerie.legend')}
            description={getText('form.ferie.skalHaFerie.description')}
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
                legend={getText('form.ferie.ferieType.legend')}
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
                      label={getText('form.ferie.fraDato.label')}
                      control={control}
                      error={errors?.[`${FERIE}`]?.fraDato?.message}
                    />
                  </Cell>
                  <Cell xs={5}>
                    <DatoVelgerWrapper
                      name={`${FERIE}.tilDato`}
                      label={getText('form.ferie.tilDato.label')}
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
                  label={getText('form.ferie.antallDager.label')}
                  control={control}
                  error={errors?.[`${FERIE}`]?.antallDager?.message}
                />
              ) : (
                <></>
              )}
            </ColorPanel>
          )}
          {skalHaFerie === JaNeiVetIkke.VET_IKKE && (
            <Alert variant={'info'}>{getText('steps.startDato.alertInfo')}</Alert>
          )}
        </>
      )}
    </SoknadFormWrapper>
  );
};
export default StartDato;
