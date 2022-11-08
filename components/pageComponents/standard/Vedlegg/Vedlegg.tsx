import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import React, { useEffect, useRef, useState } from 'react';
import { BodyShort, Heading, Label, ReadMore } from '@navikt/ds-react';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { AttachmentType } from '../AndreUtbetalinger/AndreUtbetalinger';
import { AVBRUTT_STUDIE_VEDLEGG } from '../Student/Student';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { Relasjon } from '../Barnetillegg/AddBarnModal';
import { MANUELLE_BARN } from '../Barnetillegg/Barnetillegg';
import FieldArrayFileInput from 'components/input/FileInput/FieldArrayFileInput';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { scrollRefIntoView } from 'utils/dom';
import { ScanningGuide, LucaGuidePanel } from '@navikt/aap-felles-innbygger-react';
import { useIntl } from 'react-intl';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
const VEDLEGG = 'vedlegg';
const VEDLEGG_LØNN = `${VEDLEGG}.${AttachmentType.LØNN_OG_ANDRE_GODER}`;
const VEDLEGG_OMSORGSSTØNAD = `${VEDLEGG}.${AttachmentType.OMSORGSSTØNAD}`;
const VEDLEGG_UTLANDSSTØNAD = `${VEDLEGG}.${AttachmentType.UTLANDSSTØNAD}`;
const VEDLEGG_SYKESTIPEND = `${VEDLEGG}.${AttachmentType.SYKESTIPEND}`;
const VEDLEGG_LÅN = `${VEDLEGG}.${AttachmentType.LÅN}`;
const VEDLEGG_ANNET = `${VEDLEGG}.annet`;

const Vedlegg = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);
  const schema = yup.object().shape({});
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const { locale } = useIntl();
  const {
    clearErrors,
    setError,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [VEDLEGG]: defaultValues?.søknad?.vedlegg,
      [MANUELLE_BARN]: defaultValues?.søknad?.manuelleBarn,
    },
  });

  useEffect(() => {
    if (scanningGuideOpen) {
      if (scanningGuideElement?.current != null) scrollRefIntoView(scanningGuideElement);
    }
  }, [scanningGuideOpen]);

  const scanningGuideOnClick = () => {
    setScanningGuideOpen(!scanningGuideOpen);
  };
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
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
        {søknadState?.requiredVedlegg?.length > 0 ? (
          <>
            <Label>{formatMessage('søknad.vedlegg.harVedlegg.title')}</Label>
            <ul>
              {søknadState?.requiredVedlegg?.map((vedlegg, index) => (
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
        <ScanningGuide locale={locale} />
      </ReadMore>
      {søknadState?.requiredVedlegg?.find((e) => e.type === AVBRUTT_STUDIE_VEDLEGG) && (
        <FieldArrayFileInput
          control={control}
          name={`${VEDLEGG}.${AVBRUTT_STUDIE_VEDLEGG}`}
          type={AttachmentType.AVBRUTT_STUDIE}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.student.vedlegg.name')}
          ingress={formatMessage('søknad.student.vedlegg.description')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_LØNN}
          type={AttachmentType.LØNN_OG_ANDRE_GODER}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={'Lønn og andre goder'}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.andreGoder')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.OMSORGSSTØNAD) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_OMSORGSSTØNAD}
          type={AttachmentType.OMSORGSSTØNAD}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.omsorgsstønad')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.omsorgsstønad')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_UTLANDSSTØNAD}
          type={AttachmentType.UTLANDSSTØNAD}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.utland')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.utlandsStønad')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LÅN) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_LÅN}
          type={AttachmentType.LÅN}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.lån')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.lån')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.SYKESTIPEND) && (
        <FieldArrayFileInput
          control={control}
          name={VEDLEGG_SYKESTIPEND}
          type={AttachmentType.SYKESTIPEND}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.stipend')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.sykeStipend')}
        />
      )}
      {søknadState?.søknad?.manuelleBarn?.map((barn, index) => {
        console.log('barn', barn);
        const requiredVedlegg = søknadState?.requiredVedlegg.find(
          (e) => e?.type === `barn-${barn.internId}`
        );
        return (
          <FieldArrayFileInput
            key={barn.internId}
            control={control}
            name={`${MANUELLE_BARN}.${index}.vedlegg`}
            type={`barn-${barn.internId}`}
            errors={errors}
            setError={setError}
            clearErrors={clearErrors}
            heading={formatMessage(
              `søknad.vedlegg.andreBarn.title.${requiredVedlegg?.filterType}`,
              {
                navn: `${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
              }
            )}
            ingress={requiredVedlegg?.description}
          />
        );
      })}
      <FieldArrayFileInput
        name={VEDLEGG_ANNET}
        type={AttachmentType.ANNET}
        control={control}
        errors={errors}
        setError={setError}
        clearErrors={clearErrors}
        heading={'Annen dokumentasjon'}
        ingress={'Hvis du har noe annet du ønsker å legge ved kan du laste det opp her'}
      />
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
