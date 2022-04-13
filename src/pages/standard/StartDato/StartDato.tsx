import { FieldValues, useForm } from 'react-hook-form';
import Soknad, { Ferie, StartDato } from '../../../types/Soknad';
import { getParagraphs, GetText } from '../../../hooks/useTexts';
import React, { useEffect, useMemo } from 'react';
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
import SoknadFormWrapper from '../../../components/SoknadFormWrapper';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';

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
    [FERIE]: yup.object().shape({
      [SKALHAFERIE]: yup
        .string()
        .required(getText('form.ferie.skalHaFerie.required'))
        .oneOf(
          [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
          getText('form.ferie.skalHaFerie.required')
        )
        .typeError(getText('form.ferie.skalHaFerie.required')),
    }),
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: { startDato: søknad?.startDato, ferie: søknad?.ferie },
  });
  const { stepWizardDispatch } = useStepWizard();
  const skalHaFerie = watch(`${FERIE}.skalHaFerie`);
  const ferieType = watch(`${FERIE}.type`);
  const antallDager = watch(`${FERIE}.antallDager`);
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
    setValue(`${FERIE}.periode.fraDato`, undefined);
    setValue(`${FERIE}.periode.tilDato`, undefined);
    setValue(`${FERIE}.antallDager`, '');
  }, [ferieType]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit(() => completeAndGoToNextStep(stepWizardDispatch))}
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
                  name={`${FERIE}.periode.fraDato`}
                  label={getText('form.ferie.fraDato.label')}
                  control={control}
                />
              </Cell>
              <Cell xs={5}>
                <DatoVelgerWrapper
                  name={`${FERIE}.periode.tilDato`}
                  label={getText('form.ferie.tilDato.label')}
                  control={control}
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
