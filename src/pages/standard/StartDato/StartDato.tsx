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
import { isBefore, isPast } from 'date-fns';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';

const STARTDATO = 'startDato';
const FERIE = 'ferie';
const SKALHAFERIE = 'skalHaFerie';
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
      .typeError(getText('form.startDato.required')),

    ['hvorfor']: yup.string().when([STARTDATO], {
      is: (startDato: string) => startDato && isPast(new Date(startDato)),
      then: yup
        .string()
        .required('Påkrevd')
        .oneOf(['Sykdom', 'Manglende informasjon'], 'Påkrevd')
        .typeError('Påkrevd type'),
    }),
    ['begrunnelse']: yup.string().when([STARTDATO], {
      is: (startDato: string) => startDato && isPast(new Date(startDato)),
      then: yup.string().required('Påkrevd'),
    }),

    [FERIE]: yup.object().shape({
      [SKALHAFERIE]: yup
        .string()
        .required(getText('form.ferie.skalHaFerie.required'))
        .oneOf(
          [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
          getText('form.ferie.skalHaFerie.required')
        )
        .typeError(getText('form.ferie.skalHaFerie.required')),
      ['type']: yup.string().when([SKALHAFERIE], {
        is: JaNeiVetIkke.JA,
        then: yup.string().required('Påkrevd'),
      }),

      ['fraDato']: yup.date().when(['type'], {
        is: 'Ja',
        then: yup.date().required('Påkrevd'),
      }),
      ['tilDato']: yup.date().when(['type'], {
        is: 'Ja',
        then: yup
          .date()
          .required('Påkrevd')
          .min(yup.ref('fraDato'), 'Fra dato kan ikke være nyere enn til dato'),
      }),

      ['antallDager']: yup.string().when(['type'], {
        is: 'Nei, men jeg vet antall feriedager',
        then: yup.string().required('Påkrevd'),
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
      startDatoTilbakeITid: søknad?.startDatoTilbakeITid,
      ferie: søknad?.ferie,
    },
  });

  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();

  const startDato = watch(STARTDATO);
  const skalHaFerie = watch(`${FERIE}.skalHaFerie`);
  const ferieType = watch(`${FERIE}.type`);
  const FerieType = useMemo(
    () => ({
      PERIODE: getText(`form.${FERIE}.ferieType.periode`),
      DAGER: getText(`form.${FERIE}.ferieType.dager`),
    }),
    [getText]
  );

  useEffect(() => {
    setValue(`${FERIE}.type`, undefined);
  }, [skalHaFerie]);
  useEffect(() => {
    setValue(`${FERIE}.fraDato`, undefined);
    setValue(`${FERIE}.tilDato`, undefined);
    setValue(`${FERIE}.antallDager`, '');
  }, [ferieType]);
  useEffect(() => {
    const currentDate = new Date();
    setStartDatoEldreEnnDagensDato(isBefore(new Date(startDato), currentDate));
  }, [startDato]);

  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        console.log('data', data);
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
        <ReadMore header={getText('steps.startDato.guideReadMore.heading')} type={'button'}>
          <BodyLong>{getText('steps.startDato.guideReadMore.text')}</BodyLong>
        </ReadMore>
      </GuidePanel>
      <DatoVelgerWrapper
        name={`${STARTDATO}`}
        label={getText(`form.${STARTDATO}.label`)}
        control={control}
        error={errors.startDato?.message}
      />
      {startDatoEldreEnnDagensDato && (
        <>
          <Alert variant="info">Du kan kun søke 3 år tilbake i tid</Alert>
          <RadioGroupWrapper
            legend="Hvorfor søker du tilbake i tid?"
            name={'hvorfor'}
            control={control}
            error={errors?.hvorfor?.message}
          >
            <Radio value="Sykdom">Helsemessige grunner gjorde at jeg ikke kunne søke før</Radio>
            <Radio value="Manglende informasjon">
              Feilinformasjon fra NAV gjorde at jeg ikke søkte før
            </Radio>
          </RadioGroupWrapper>
          <TextAreaWrapper
            name={'begrunnelse'}
            label={'Kan du beskrive nærmere hva som har skjedd?'}
            control={control}
            error={errors?.begrunnelse?.message}
          />
        </>
      )}
      <RadioGroupWrapper
        legend={getText('form.ferie.skalHaFerie.legend')}
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
            name={`${FERIE}.type`}
            control={control}
            error={errors?.[`${FERIE}`]?.type?.message}
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
    </SoknadFormWrapper>
  );
};
export default StartDato;
