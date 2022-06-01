import Soknad from '../../../types/Soknad';
import { GetText } from '../../../hooks/useTexts';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { BodyShort, GuidePanel, Heading, Radio, Alert } from '@navikt/ds-react';
import { JaNeiVetIkke } from '../../../types/Generic';
import React, { useEffect } from 'react';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';

const STUDENT = 'student';
const ER_STUDENT = 'erStudent';
const KOMME_TILBAKE = 'kommeTilbake';

enum JaNeiAvbrutt {
  JA = 'Ja',
  NEI = 'Nei',
  AVBRUTT = 'Avbrutt',
}
interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}

const Student = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [STUDENT]: yup.object().shape({
      [ER_STUDENT]: yup
        .string()
        .required(getText('form.student.required'))
        .oneOf(
          [JaNeiAvbrutt.JA, JaNeiAvbrutt.NEI, JaNeiAvbrutt.AVBRUTT],
          getText('form.student.required')
        )
        .typeError(getText('form.student.required')),
      [KOMME_TILBAKE]: yup.string().when([ER_STUDENT], {
        is: JaNeiAvbrutt.AVBRUTT,
        then: yup
          .string()
          .required(getText('form.student.kommeTilbake.required'))
          .oneOf(
            [JaNeiVetIkke.JA, JaNeiVetIkke.NEI, JaNeiVetIkke.VET_IKKE],
            getText('form.student.kommeTilbake.required')
          )
          .typeError(getText('form.student.kommeTilbake.required')),
      }),
    }),
  });
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
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
      [STUDENT]: søknad?.student,
    },
  });

  const erStudent = watch(`${STUDENT}.${ER_STUDENT}`);
  const tilbakeTilStudie = watch(`${STUDENT}.${KOMME_TILBAKE}`);

  useEffect(() => {
    setValue(`${STUDENT}.${KOMME_TILBAKE}`, undefined);
    clearErrors();
  }, [erStudent]);

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
        {getText('steps.student.title')}
      </Heading>
      <GuidePanel>
        <BodyShort spacing>{getText('steps.student.guide1')}</BodyShort>
        <BodyShort>
          Du regnes som student hvis du tar et studie som gir rett til lån fra Statens lånekasse for
          utdanning. Du trenger ikke å ha mottatt lån/stipend.
        </BodyShort>
      </GuidePanel>
      <RadioGroupWrapper
        name={`${STUDENT}.${ER_STUDENT}`}
        legend={getText(`form.${STUDENT}.legend`)}
        description={getText(`form.${STUDENT}.description`)}
        control={control}
        error={errors?.[STUDENT]?.[ER_STUDENT]?.message}
      >
        <Radio value={JaNeiAvbrutt.JA}>
          <BodyShort>Ja, helt eller delvis</BodyShort>
        </Radio>
        <Radio value={JaNeiAvbrutt.AVBRUTT}>
          <BodyShort>Ja, men har avbrutt studiet helt på grunn av sykdom</BodyShort>
        </Radio>
        <Radio value={JaNeiAvbrutt.NEI}>
          <BodyShort>{JaNeiAvbrutt.NEI}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {erStudent === JaNeiAvbrutt.AVBRUTT && (
        <ColorPanel>
          <RadioGroupWrapper
            name={`${STUDENT}.${KOMME_TILBAKE}`}
            legend={getText(`form.${STUDENT}.${KOMME_TILBAKE}.legend`)}
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
      {tilbakeTilStudie && (
        <Alert variant="info">
          <BodyShort>Du må legge ved:</BodyShort>
          <ul>
            <li>Bekreftelse fra studiested på hvilken dato studiet ble avbrutt fra.</li>
          </ul>
          <BodyShort>
            Dokumentene laster du opp senere i søknaden. Du kan også ettersende vedlegg.
          </BodyShort>
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
export default Student;
