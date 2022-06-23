import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, BodyShort, Heading, Label, ReadMore } from '@navikt/ds-react';
import FileInput from '../../../components/input/FileInput/FileInput';
import { useVedleggContext } from '../../../context/vedleggContext';
import ScanningGuide from '../../../components/ScanningGuide/ScanningGuide';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { AttachmentType } from '../AndreUtbetalinger/AndreUtbetalinger';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { AVBRUTT_STUDIE_VEDLEGG } from '../Student/Student';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';

interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}
const VEDLEGG = 'vedlegg';
const VEDLEGG_LØNN = `${VEDLEGG}.${AttachmentType.LØNN_OG_ANDRE_GODER}`;
const VEDLEGG_OMSORGSSTØNAD = `${VEDLEGG}.${AttachmentType.OMSORGSSTØNAD}`;
const VEDLEGG_UTLANDSSTØNAD = `${VEDLEGG}.${AttachmentType.UTLANDSSTØNAD}`;
const VEDLEGG_BARN = `${VEDLEGG}.barn`;
const VEDLEGG_ANNET = `${VEDLEGG}.annet`;

const Vedlegg = ({ onBackClick }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);
  const schema = yup.object().shape({});

  const { vedleggState } = useVedleggContext();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [VEDLEGG]: søknadState?.søknad?.vedlegg,
    },
  });
  useEffect(() => {
    if (scanningGuideOpen) {
      if (scanningGuideElement?.current != null)
        (scanningGuideElement?.current as HTMLElement)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanningGuideOpen]);
  const scanningGuideOnClick = () => {
    setScanningGuideOpen(!scanningGuideOpen);
  };
  const fieldArrayAvbruttStudie = useFieldArray({
    name: AVBRUTT_STUDIE_VEDLEGG,
    control,
  });
  const fieldArrayLønn = useFieldArray({
    name: VEDLEGG_LØNN,
    control,
  });
  const fieldArrayOmsorgsstønad = useFieldArray({
    name: VEDLEGG_OMSORGSSTØNAD,
    control,
  });
  const fieldArrayUtlandsstønad = useFieldArray({
    name: VEDLEGG_UTLANDSSTØNAD,
    control,
  });
  const fieldArrayBarn = useFieldArray({
    name: VEDLEGG_BARN,
    control,
  });
  const fieldArrayAnnet = useFieldArray({
    name: VEDLEGG_ANNET,
    control,
  });
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData<Soknad>(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.vedlegg.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{formatMessage('søknad.vedlegg.guide.text1')}</BodyShort>
        <BodyShort>{formatMessage('søknad.vedlegg.guide.text2')}</BodyShort>
      </LucaGuidePanel>
      <BodyShort>
        {vedleggState?.requiredVedlegg?.length > 0 ? (
          <>
            <Label>{formatMessage('søknad.vedlegg.harVedlegg.title')}</Label>
            <ul>
              {vedleggState?.requiredVedlegg?.map((vedlegg, index) => (
                <li key={index}>{vedlegg?.description}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <Label spacing>{formatMessage('søknad.vedlegg.ingenVedlegg.title')}</Label>
            <ReadMore
              header={formatMessage('søknad.vedlegg.ingenVedlegg.readMore.title')}
              type={'button'}
            >
              {formatMessage('søknad.vedlegg.ingenVedlegg.readMore.text')}
            </ReadMore>
          </>
        )}
      </BodyShort>
      <BodyShort>{formatMessage('søknad.vedlegg.vedleggPåPapir.text')}</BodyShort>
      <ReadMore
        header={formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.title')}
        type={'button'}
        open={scanningGuideOpen}
        onClick={scanningGuideOnClick}
        ref={scanningGuideElement}
      >
        <ScanningGuide />
      </ReadMore>
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AVBRUTT_STUDIE_VEDLEGG) && (
        <FileInput
          name={AVBRUTT_STUDIE_VEDLEGG}
          fields={fieldArrayAvbruttStudie.fields}
          append={fieldArrayAvbruttStudie.append}
          remove={fieldArrayAvbruttStudie.remove}
          heading={formatMessage('søknad.student.vedlegg.name')}
          ingress={formatMessage('søknad.student.vedlegg.description')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find(
        (e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER
      ) && (
        <FileInput
          name={VEDLEGG_LØNN}
          fields={fieldArrayLønn.fields}
          append={fieldArrayLønn.append}
          remove={fieldArrayLønn.remove}
          heading={'Lønn og andre goder'}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.andreGoder')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AttachmentType.OMSORGSSTØNAD) && (
        <FileInput
          name={VEDLEGG_OMSORGSSTØNAD}
          fields={fieldArrayOmsorgsstønad.fields}
          append={fieldArrayOmsorgsstønad.append}
          remove={fieldArrayOmsorgsstønad.remove}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.omsorgsstønad')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.omsorgsstønad')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <FileInput
          name={VEDLEGG_UTLANDSSTØNAD}
          fields={fieldArrayUtlandsstønad.fields}
          append={fieldArrayUtlandsstønad.append}
          remove={fieldArrayUtlandsstønad.remove}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.utland')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.utlandsStønad')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e?.type?.split('-')?.[0] === 'barn') && (
        <FileInput
          name={VEDLEGG_BARN}
          fields={fieldArrayBarn.fields}
          append={fieldArrayBarn.append}
          remove={fieldArrayBarn.remove}
          heading={'Barn'}
          ingress={'Fødselsattest eller bostedbevis for barn du har lagt til manuelt.'}
        />
      )}
      <FileInput
        name={VEDLEGG}
        fields={fieldArrayAnnet.fields}
        append={fieldArrayAnnet.append}
        remove={fieldArrayAnnet.remove}
        heading={'Annen dokumentasjon'}
        ingress={'Hvis du har noe annet du ønsker å legge ved kan du laste det opp her'}
      />

      <Alert variant={'info'}>{formatMessage('søknad.vedlegg.alert.text')}</Alert>
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
