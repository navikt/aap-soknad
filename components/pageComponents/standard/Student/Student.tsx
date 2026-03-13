'use client';
import { Soknad } from 'types/Soknad';
import { Alert, BodyShort, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { JaNeiVetIkke } from 'types/Generic';
import React, { useEffect, useMemo, useState } from 'react';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { useTranslations } from 'next-intl';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { useSoknad } from 'hooks/SoknadHook';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  updateSøknadData,
} from 'context/soknadcontext/actions';
import { STUDENT, ER_STUDENT, KOMME_TILBAKE, JaNeiAvbrutt, jaNeiAvbruttToTekstnøkkel, getStudentSchema } from './student.schema';

export { STUDENT, ER_STUDENT, KOMME_TILBAKE, JaNeiAvbrutt, jaNeiAvbruttToTekstnøkkel } from './student.schema';

interface Props {
  onBackClick: () => void;
}

export { getStudentSchema } from './student.schema';

const Student = ({ onBackClick }: Props) => {
  const t = useTranslations();
  const { søknadState, søknadDispatch } = useSoknad();
  const { stepList, stepWizardDispatch } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.student]);

  const ErStudentAlternativer = useMemo(
    () => ({
      [JaNeiAvbrutt.JA]: t(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.JA)),
      [JaNeiAvbrutt.NEI]: t(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.NEI)),
      [JaNeiAvbrutt.AVBRUTT]: t(jaNeiAvbruttToTekstnøkkel(JaNeiAvbrutt.AVBRUTT)),
    }),
    [t],
  );

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  return (
    <SoknadFormWrapperNew
      onNext={async () => {
        const errors = await validate(getStudentSchema(t), søknadState.søknad?.student);
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }

        if (søknadState.søknad?.student?.kommeTilbake === JaNeiVetIkke.JA) {
          addRequiredVedlegg(
            [
              {
                type: 'AVBRUTT_STUDIE',
                description: t('søknad.student.vedlegg.description'),
              },
            ],
            søknadDispatch,
          );
        } else {
          removeRequiredVedlegg('AVBRUTT_STUDIE', søknadDispatch);
        }

        completeAndGoToNextStep(stepWizardDispatch);
      }}
      onBack={() => {
        updateSøknadData(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      errors={errors}
    >
      <Heading size="large" level="2">
        {t('søknad.student.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{t('søknad.student.guide.guide1')}</BodyShort>
      </LucaGuidePanel>
      <RadioGroup
        name={`${ER_STUDENT}`}
        id={`${ER_STUDENT}`}
        value={søknadState?.søknad?.student?.erStudent || ''}
        legend={t(`søknad.${STUDENT}.${ER_STUDENT}.legend`)}
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
            value={søknadState?.søknad?.student?.kommeTilbake || ''}
            legend={t(`søknad.${STUDENT}.${KOMME_TILBAKE}.legend`)}
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
          <BodyShort>{t('søknad.student.vedlegg.title')}</BodyShort>
          <ul>
            <li>{t('søknad.student.vedlegg.description')}</li>
          </ul>
          <BodyShort>{t('søknad.student.vedlegg.lastOppSenere')}</BodyShort>
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
export default Student;
