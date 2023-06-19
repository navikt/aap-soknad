import { Soknad } from 'types/Soknad';
import { Alert, BodyShort, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { JaNeiVetIkke } from 'types/Generic';
import React, { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { FieldErrors } from 'react-hook-form';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
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
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { validate } from '../../../../lib/utils/validationUtils';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';

export const AVBRUTT_STUDIE_VEDLEGG = 'avbruttStudie';
export const STUDENT = 'student';
export const ER_STUDENT = 'erStudent';
export const KOMME_TILBAKE = 'kommeTilbake';

export enum JaNeiAvbrutt {
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

export const getStudentSchema = (formatMessage: (id: string) => string) =>
  yup.object().shape({
    [ER_STUDENT]: yup
      .string()
      .required(formatMessage('søknad.student.erStudent.required'))
      .oneOf(
        [JaNeiAvbrutt.JA, JaNeiAvbrutt.NEI, JaNeiAvbrutt.AVBRUTT],
        formatMessage('søknad.student.erStudent.required')
      )
      .typeError(formatMessage('søknad.student.erStudent.required')),
    [KOMME_TILBAKE]: yup.string().when(ER_STUDENT, ([erStudent], schema) => {
      if (erStudent === JaNeiAvbrutt.AVBRUTT) {
        return yup
          .string()
          .required(formatMessage('søknad.student.kommeTilbake.required'))
          .oneOf(
            [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
            formatMessage('søknad.student.kommeTilbake.required')
          )
          .typeError(formatMessage('søknad.student.kommeTilbake.required'));
      }
      return schema;
    }),
  });

const Student = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, currentStepIndex, stepWizardDispatch } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.student]);

  const ErStudentAlternativer = useMemo(
    () => ({
      [JaNeiAvbrutt.JA]: formatMessage(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.JA)),
      [JaNeiAvbrutt.NEI]: formatMessage(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.NEI)),
      [JaNeiAvbrutt.AVBRUTT]: formatMessage(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.AVBRUTT)),
    }),
    [formatMessage]
  );

  useEffect(() => {
    if (søknadState.søknad?.student?.kommeTilbake === JaNeiVetIkke.JA) {
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
  }, [søknadState.søknad?.student?.kommeTilbake]);

  const [errors, setErrors] = useState<FieldErrors | undefined>();
  return (
    <SoknadFormWrapper
      onNext={async (data) => {
        const errors = await validate(getStudentSchema(formatMessage), søknadState.søknad?.student);
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
      <RadioGroup
        name={`${ER_STUDENT}`}
        value={defaultValues?.søknad?.student?.erStudent || ''}
        legend={formatMessage(`søknad.${STUDENT}.${ER_STUDENT}.legend`)}
        onChange={(value) => {
          const copy = errors;
          delete copy?.erStudent;
          setErrors(copy);
          updateSøknadData(søknadDispatch, {
            student: {
              ...søknadState.søknad?.student,
              erStudent: value,
            },
          });
        }}
        error={errors?.erStudent?.message as string}
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
      </RadioGroup>
      {søknadState.søknad?.student?.erStudent === JaNeiAvbrutt.AVBRUTT && (
        <ColorPanel color={'grey'}>
          <RadioGroup
            name={`${KOMME_TILBAKE}`}
            value={defaultValues?.søknad?.student?.kommeTilbake || ''}
            legend={formatMessage(`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`)}
            onChange={(value) => {
              const copy = errors;
              delete copy?.kommeTilbake;
              setErrors(copy);
              updateSøknadData(søknadDispatch, {
                student: {
                  ...søknadState.søknad?.student,
                  kommeTilbake: value,
                },
              });
            }}
            error={errors?.kommeTilbake?.message as string}
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
          </RadioGroup>
        </ColorPanel>
      )}
      {søknadState.søknad?.student?.kommeTilbake === JaNeiVetIkke.JA && (
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
