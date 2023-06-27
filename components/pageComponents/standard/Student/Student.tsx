import { Soknad } from 'types/Soknad';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { Alert, BodyShort, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { JaNeiVetIkke } from 'types/Generic';
import React, { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
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
import { IntlFormatters, useIntl } from 'react-intl';
import { validate } from '../../../../lib/utils/validationUtils';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';

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

export const getStudentSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    [ER_STUDENT]: yup
      .string()
      .required(formatMessage({ id: 'søknad.student.erStudent.required' }))
      .oneOf(
        [JaNeiAvbrutt.JA, JaNeiAvbrutt.NEI, JaNeiAvbrutt.AVBRUTT],
        formatMessage({ id: 'søknad.student.erStudent.required' })
      )
      .typeError(formatMessage({ id: 'søknad.student.erStudent.required' })),
    [KOMME_TILBAKE]: yup.string().when(ER_STUDENT, ([erStudent], schema) => {
      if (erStudent === JaNeiAvbrutt.AVBRUTT) {
        return yup
          .string()
          .required(formatMessage({ id: 'søknad.student.kommeTilbake.required' }))
          .oneOf(
            [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
            formatMessage({ id: 'søknad.student.kommeTilbake.required' })
          )
          .typeError(formatMessage({ id: 'søknad.student.kommeTilbake.required' }));
      }
      return schema;
    }),
  });

const Student = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, currentStepIndex, stepWizardDispatch } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.student]);

  const ErStudentAlternativer = useMemo(
    () => ({
      [JaNeiAvbrutt.JA]: formatMessage({ id: jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.JA) }),
      [JaNeiAvbrutt.NEI]: formatMessage({ id: jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.NEI) }),
      [JaNeiAvbrutt.AVBRUTT]: formatMessage({
        id: jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.AVBRUTT),
      }),
    }),
    [formatMessage]
  );

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  return (
    <SoknadFormWrapperNew
      onNext={async (data) => {
        const errors = await validate(getStudentSchema(formatMessage), søknadState.søknad?.student);
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }

        if (søknadState.søknad?.student?.kommeTilbake === JaNeiVetIkke.JA) {
          addRequiredVedlegg(
            [
              {
                type: AVBRUTT_STUDIE_VEDLEGG,
                description: formatMessage({ id: 'søknad.student.vedlegg.description' }),
              },
            ],
            søknadDispatch
          );
        } else {
          removeRequiredVedlegg(AVBRUTT_STUDIE_VEDLEGG, søknadDispatch);
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
        {formatMessage({ id: 'søknad.student.title' })}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{formatMessage({ id: 'søknad.student.guide.guide1' })}</BodyShort>
      </LucaGuidePanel>
      <RadioGroup
        name={`${ER_STUDENT}`}
        id={`${ER_STUDENT}`}
        value={defaultValues?.søknad?.student?.erStudent || ''}
        legend={formatMessage({ id: `søknad.${STUDENT}.${ER_STUDENT}.legend` })}
        onChange={(value) => {
          setErrors(errors?.filter((error) => error.path != 'erStudent'));
          updateSøknadData(søknadDispatch, {
            student: {
              ...søknadState.søknad?.student,
              erStudent: value,
            },
          });
        }}
        error={errors?.find((error) => error.path === 'erStudent')?.message}
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
            id={`${KOMME_TILBAKE}`}
            value={defaultValues?.søknad?.student?.kommeTilbake || ''}
            legend={formatMessage({ id: `søknad.${STUDENT}.${KOMME_TILBAKE}.legend` })}
            onChange={(value) => {
              setErrors(errors?.filter((error) => error.path != 'kommeTilbake'));
              updateSøknadData(søknadDispatch, {
                student: {
                  ...søknadState.søknad?.student,
                  kommeTilbake: value,
                },
              });
            }}
            error={errors?.find((error) => error.path === 'kommeTilbake')?.message}
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
          <BodyShort>{formatMessage({ id: 'søknad.student.vedlegg.title' })}</BodyShort>
          <ul>
            <li>{formatMessage({ id: 'søknad.student.vedlegg.description' })}</li>
          </ul>
          <BodyShort>{formatMessage({ id: 'søknad.student.vedlegg.lastOppSenere' })}</BodyShort>
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
export default Student;
