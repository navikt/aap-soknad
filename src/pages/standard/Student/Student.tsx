import Soknad from '../../../types/Soknad';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { BodyShort, Heading, Radio, Alert } from '@navikt/ds-react';
import { JaNeiVetIkke } from '../../../types/Generic';
import React, { useEffect } from 'react';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  useVedleggContext,
} from '../../../context/vedleggContext';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
export const AVBRUTT_STUDIE_VEDLEGG = 'avbruttStudie';

const STUDENT = 'student';
const ER_STUDENT = 'erStudent';
const KOMME_TILBAKE = 'kommeTilbake';

enum JaNeiAvbrutt {
  JA = 'Ja',
  NEI = 'Nei',
  AVBRUTT = 'Avbrutt',
}
interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}

const Student = ({ onBackClick }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const schema = yup.object().shape({
    [STUDENT]: yup.object().shape({
      [ER_STUDENT]: yup
        .string()
        .required(formatMessage('søknad.student.erStudent.required'))
        .oneOf(
          [JaNeiAvbrutt.JA, JaNeiAvbrutt.NEI, JaNeiAvbrutt.AVBRUTT],
          formatMessage('søknad.student.erStudent.required')
        )
        .typeError(formatMessage('søknad.student.erStudent.required')),
      [KOMME_TILBAKE]: yup.string().when([ER_STUDENT], {
        is: JaNeiAvbrutt.AVBRUTT,
        then: yup
          .string()
          .required(formatMessage('søknad.student.kommeTilbake.required'))
          .oneOf(
            [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
            formatMessage('søknad.student.kommeTilbake.required')
          )
          .typeError(formatMessage('søknad.student.kommeTilbake.required')),
      }),
    }),
  });
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepWizardDispatch } = useStepWizard();
  const { vedleggDispatch } = useVedleggContext();
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [STUDENT]: søknadState?.søknad?.student,
    },
  });

  const erStudent = watch(`${STUDENT}.${ER_STUDENT}`);

  useEffect(() => {
    setValue(`${STUDENT}.${KOMME_TILBAKE}`, undefined);
    clearErrors();
    if (erStudent === JaNeiAvbrutt.AVBRUTT) {
      addRequiredVedlegg(
        [
          {
            type: AVBRUTT_STUDIE_VEDLEGG,
            description: formatMessage('søknad.student.vedlegg.description'),
          },
        ],
        vedleggDispatch
      );
    } else {
      removeRequiredVedlegg(AVBRUTT_STUDIE_VEDLEGG, vedleggDispatch);
    }
  }, [erStudent]);

  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData<Soknad>(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.student.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{formatMessage('søknad.student.guide.guide1')}</BodyShort>
        <BodyShort>{formatMessage('søknad.student.guide.guide2')}</BodyShort>
      </LucaGuidePanel>
      <RadioGroupWrapper
        name={`${STUDENT}.${ER_STUDENT}`}
        legend={formatMessage(`søknad.${STUDENT}.${ER_STUDENT}.legend`)}
        description={formatMessage(`søknad.${STUDENT}.${ER_STUDENT}.description`)}
        control={control}
        error={errors?.[STUDENT]?.[ER_STUDENT]?.message}
      >
        <Radio value={JaNeiAvbrutt.JA}>
          <BodyShort>{formatMessage('søknad.student.erStudent.ja')}</BodyShort>
        </Radio>
        <Radio value={JaNeiAvbrutt.AVBRUTT}>
          <BodyShort>{formatMessage('søknad.student.erStudent.avbrutt')}</BodyShort>
        </Radio>
        <Radio value={JaNeiAvbrutt.NEI}>
          <BodyShort>{JaNeiAvbrutt.NEI}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {erStudent === JaNeiAvbrutt.AVBRUTT && (
        <ColorPanel>
          <RadioGroupWrapper
            name={`${STUDENT}.${KOMME_TILBAKE}`}
            legend={formatMessage(`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`)}
            control={control}
            error={errors?.[STUDENT]?.[KOMME_TILBAKE]?.message}
          >
            <Radio value={JaNeiVetIkke.JA}>
              <BodyShort>{JaNeiVetIkke.JA}</BodyShort>
            </Radio>
            <Radio value={JaNeiVetIkke.NEI}>
              <BodyShort>{JaNeiVetIkke.NEI}</BodyShort>
            </Radio>
            <Radio value={JaNeiVetIkke.VET_IKKE}>
              <BodyShort>{JaNeiVetIkke.VET_IKKE}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
        </ColorPanel>
      )}
      {erStudent === JaNeiAvbrutt.AVBRUTT && (
        <Alert variant="info">
          <BodyShort>{formatMessage('søknad.student.vedlegg.title')}</BodyShort>
          <ul>
            <li>{formatMessage('søknad.student.vedlegg.description')}</li>
          </ul>
          <BodyShort>{formatMessage('søknad.student.vedlegg.lastOppSenere')}</BodyShort>
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
export default Student;
