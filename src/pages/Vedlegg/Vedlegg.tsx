import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import Soknad from '../../types/Soknad';
import { GetText } from '../../hooks/useTexts';
import React from 'react';
import { Alert, BodyShort, GuidePanel, Heading, Label, ReadMore } from '@navikt/ds-react';
import FileInput from '../../components/input/FileInput/FileInput';
import { useVedleggContext } from '../../context/vedleggContext';
import ScanningGuide from '../../components/ScanningGuide/ScanningGuide';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../components/SoknadFormWrapper/SoknadFormWrapper';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const VEDLEGG = 'vedlegg';

const Vedlegg = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({});
  const { vedleggState } = useVedleggContext();
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [VEDLEGG]: søknad?.vedlegg,
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: VEDLEGG,
    control,
  });
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
        {getText('steps.vedlegg.title')}
      </Heading>
      <GuidePanel>
        <BodyShort>{getText(`steps.vedlegg.guide`)}</BodyShort>
      </GuidePanel>
      <BodyShort>
        {vedleggState?.requiredVedlegg?.length > 0 ? (
          <Label>{getText('steps.vedlegg.attachmentListDescription')}</Label>
        ) : (
          <Label>Ut fra dine svar har vi ikke registrert noen vedlegg som må lastes opp</Label>
        )}
        <ReadMore header={'Kan jeg laste opp andre vedlegg?'} type={'button'}>
          {'Hvis du har noe annet du også ønsker å legge ved, kan du også laste opp dette her.'}
        </ReadMore>
        <ul>
          {vedleggState?.requiredVedlegg?.map((vedlegg, index) => (
            <li key={index}>{vedlegg?.description}</li>
          ))}
        </ul>
      </BodyShort>
      <BodyShort>{getText('steps.vedlegg.taBildeInfo')}</BodyShort>
      <ReadMore header={getText('steps.vedlegg.taBildeReadMore')} type={'button'}>
        <ScanningGuide getText={getText} />
      </ReadMore>
      <FileInput name={VEDLEGG} fields={fields} append={append} remove={remove} />
      <Alert variant={'info'}>{getText('steps.vedlegg.alertInfo')}</Alert>
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
