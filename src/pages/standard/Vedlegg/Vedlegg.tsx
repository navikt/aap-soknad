import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, BodyShort, Heading, Label, ReadMore } from '@navikt/ds-react';
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
import { useDebounceLagreSoknad } from '../../../hooks/useDebounceLagreSoknad';
import { Relasjon } from '../Barnetillegg/AddBarnModal';
import { MANUELLE_BARN } from '../Barnetillegg/Barnetillegg';
import FieldArrayFileInput from '../../../components/input/FileInput/FieldArrayFileInput';

interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}
const VEDLEGG = 'vedlegg';
const VEDLEGG_LØNN = `${VEDLEGG}.${AttachmentType.LØNN_OG_ANDRE_GODER}`;
const VEDLEGG_OMSORGSSTØNAD = `${VEDLEGG}.${AttachmentType.OMSORGSSTØNAD}`;
const VEDLEGG_UTLANDSSTØNAD = `${VEDLEGG}.${AttachmentType.UTLANDSSTØNAD}`;
const VEDLEGG_ANNET = `${VEDLEGG}.annet`;

const Vedlegg = ({ onBackClick }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);
  const schema = yup.object().shape({});
  const { vedleggState } = useVedleggContext();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const {
    watch,
    clearErrors,
    setError,
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
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData<Soknad>(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
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
        <FieldArrayFileInput
          control={control}
          name={`${VEDLEGG}.${AVBRUTT_STUDIE_VEDLEGG}`}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.student.vedlegg.name')}
          ingress={formatMessage('søknad.student.vedlegg.description')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find(
        (e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER
      ) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_LØNN}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={'Lønn og andre goder'}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.andreGoder')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AttachmentType.OMSORGSSTØNAD) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_OMSORGSSTØNAD}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.omsorgsstønad')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.omsorgsstønad')}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_UTLANDSSTØNAD}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.utland')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.utlandsStønad')}
        />
      )}
      {søknadState?.søknad?.manuelleBarn?.map((barn, index) => {
        const requiredVedlegg = vedleggState?.requiredVedlegg.find((e) => e?.type === barn?.fnr);
        return (
          <FieldArrayFileInput
            control={control}
            name={`${MANUELLE_BARN}.${index}.vedlegg`}
            errors={errors}
            setError={setError}
            clearErrors={clearErrors}
            heading={
              requiredVedlegg?.filterType === Relasjon.FORELDER
                ? 'Fødselsattest eller adopsjonsbevis'
                : 'Bostedsbevis'
            }
            ingress={requiredVedlegg?.description}
          />
        );
      })}
      <FieldArrayFileInput
        name={VEDLEGG_ANNET}
        control={control}
        errors={errors}
        setError={setError}
        clearErrors={clearErrors}
        heading={'Annen dokumentasjon'}
        ingress={'Hvis du har noe annet du ønsker å legge ved kan du laste det opp her'}
      />

      <Alert variant={'info'}>{formatMessage('søknad.vedlegg.alert.text')}</Alert>
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
