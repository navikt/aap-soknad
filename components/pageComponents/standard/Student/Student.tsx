import { Soknad } from 'types/Soknad';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { BodyShort, Heading, Radio, Alert } from '@navikt/ds-react';
import { JaNeiVetIkke } from 'types/Generic';
import React, { useEffect, useMemo } from 'react';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  slettLagretSoknadState,
  updateSøknadData,
} from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';

export const AVBRUTT_STUDIE_VEDLEGG = 'avbruttStudie';
export const STUDENT = 'student';
export const ER_STUDENT = 'erStudent';
export const KOMME_TILBAKE = 'kommeTilbake';

enum JaNeiAvbrutt {
  JA = 'Ja',
  NEI = 'Nei',
  AVBRUTT = 'Avbrutt',
}
export const jaNeiAvbruttToTekstnøkkel = (jaNeiAvbrutt: JaNeiAvbrutt) => {
  switch (jaNeiAvbrutt) {
    case JaNeiAvbrutt.JA:
      return 'søknad.student.erStudent.ja';
    case JaNeiAvbrutt.AVBRUTT:
      return 'søknad.student.erStudent.avbrutt';
    case JaNeiAvbrutt.NEI:
      return 'søknad.student.erStudent.nei';
  }
};
interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const Student = ({ onBackClick, onNext, defaultValues }: Props) => {
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
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [STUDENT]: defaultValues?.søknad?.student,
    },
  });

  const erStudent = useWatch({ control, name: `${STUDENT}.${ER_STUDENT}` });
  const kommeTilbake = useWatch({ control, name: `${STUDENT}.${KOMME_TILBAKE}` });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const ErStudentAlternativer = useMemo(
    () => ({
      [JaNeiAvbrutt.JA]: formatMessage(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.JA)),
      [JaNeiAvbrutt.NEI]: formatMessage(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.NEI)),
      [JaNeiAvbrutt.AVBRUTT]: formatMessage(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.AVBRUTT)),
    }),
    [formatMessage]
  );

  useEffect(() => {
    clearErrors();
    if (erStudent !== JaNeiAvbrutt.AVBRUTT) {
      setValue(`${STUDENT}.${KOMME_TILBAKE}`, undefined);
    }
  }, [erStudent]);

  useEffect(() => {
    if (kommeTilbake === JaNeiVetIkke.JA) {
      addRequiredVedlegg(
        [
          {
            type: AVBRUTT_STUDIE_VEDLEGG,
            description: formatMessage('søknad.student.vedlegg.description'),
          },
        ],
        søknadDispatch
      );
    } else {
      removeRequiredVedlegg(AVBRUTT_STUDIE_VEDLEGG, søknadDispatch);
    }
  }, [kommeTilbake]);

  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onNext(data);
      })}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
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
      </LucaGuidePanel>
      <RadioGroupWrapper
        name={`${STUDENT}.${ER_STUDENT}`}
        legend={formatMessage(`søknad.${STUDENT}.${ER_STUDENT}.legend`)}
        description={formatMessage(`søknad.${STUDENT}.${ER_STUDENT}.description`)}
        control={control}
        error={errors?.[STUDENT]?.[ER_STUDENT]?.message}
      >
        <Radio value={JaNeiAvbrutt.JA}>
          <BodyShort>{ErStudentAlternativer?.[JaNeiAvbrutt.JA]}</BodyShort>
        </Radio>
        <Radio value={JaNeiAvbrutt.AVBRUTT}>
          <BodyShort>{ErStudentAlternativer?.[JaNeiAvbrutt.AVBRUTT]}</BodyShort>
        </Radio>
        <Radio value={JaNeiAvbrutt.NEI}>
          <BodyShort>{ErStudentAlternativer?.[JaNeiAvbrutt.NEI]}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {erStudent === JaNeiAvbrutt.AVBRUTT && (
        <ColorPanel color={'grey'}>
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
      {kommeTilbake === JaNeiVetIkke.JA && (
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
