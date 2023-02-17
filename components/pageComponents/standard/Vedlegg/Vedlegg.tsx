import { useForm, useWatch } from 'react-hook-form';
import { Soknad, SoknadVedlegg } from 'types/Soknad';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, BodyLong, BodyShort, Heading, Label, ReadMore, Textarea } from '@navikt/ds-react';
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
import FieldArrayFileInput from 'components/input/FileInput/FieldArrayFileInput';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { scrollRefIntoView } from 'utils/dom';
import { LucaGuidePanel, ScanningGuide } from '@navikt/aap-felles-innbygger-react';
import { useIntl } from 'react-intl';
import TextAreaWrapper from '../../../input/TextAreaWrapper';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const Vedlegg = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);
  const [papirGuideOpen, setPapirGuideOpen] = useState(false);
  const papirGuideElement = useRef(null);
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
  } = useForm<SoknadVedlegg>({
    resolver: yupResolver(schema),
    defaultValues: { ...defaultValues?.søknad?.vedlegg },
  });

  const onTilleggsopplysningerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    updateSøknadData<Soknad>(søknadDispatch, { tilleggsopplysninger: e.target.value });
  };

  useEffect(() => {
    if (scanningGuideOpen) {
      if (scanningGuideElement?.current != null) scrollRefIntoView(scanningGuideElement);
    }
  }, [scanningGuideOpen]);

  const scanningGuideOnClick = () => {
    setScanningGuideOpen(!scanningGuideOpen);
  };
  const papirGuideOnClick = () => {
    setPapirGuideOpen(!papirGuideOpen);
  };
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onNext({ vedlegg: data });
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
      {søknadState.requiredVedlegg.length > 0 && (
        <LucaGuidePanel>
          <BodyShort spacing>{formatMessage('søknad.vedlegg.guide.text1')}</BodyShort>
          <BodyShort>{formatMessage('søknad.vedlegg.guide.text2')}</BodyShort>
        </LucaGuidePanel>
      )}
      {søknadState.requiredVedlegg.length > 0 ? (
        <div>
          <Label as={'p'}>{formatMessage('søknad.vedlegg.harVedlegg.title')}</Label>
          <ul>
            {søknadState?.requiredVedlegg?.map((vedlegg, index) => (
              <li key={index}>{vedlegg?.description}</li>
            ))}
          </ul>
        </div>
      ) : (
        <Alert variant={'info'}>
          <BodyLong spacing>{formatMessage('søknad.vedlegg.ingenVedlegg.alert.text1')}</BodyLong>
          <BodyLong spacing>{formatMessage('søknad.vedlegg.ingenVedlegg.alert.text2')}</BodyLong>
          <BodyLong>{formatMessage('søknad.vedlegg.ingenVedlegg.alert.text3')}</BodyLong>
        </Alert>
      )}
      <>
        <div>
          <BodyLong>{formatMessage('søknad.vedlegg.vedleggPåPapir.text')}</BodyLong>
          <ReadMore
            header={formatMessage('søknad.vedlegg.vedleggPåPapir.readMore.title')}
            type={'button'}
            open={scanningGuideOpen}
            onClick={scanningGuideOnClick}
            ref={scanningGuideElement}
          >
            <ScanningGuide locale={locale} />
          </ReadMore>
        </div>
      </>

      {søknadState?.requiredVedlegg?.find((e) => e.type === AVBRUTT_STUDIE_VEDLEGG) && (
        <FieldArrayFileInput
          control={control}
          name={'avbruttStudie'}
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
          name={'LØNN_OG_ANDRE_GODER'}
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
          name={'OMSORGSSTØNAD'}
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
          name={'UTLANDSSTØNAD'}
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
          name={'LÅN'}
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
          name={'SYKESTIPEND'}
          type={AttachmentType.SYKESTIPEND}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.stipend')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.sykeStipend')}
        />
      )}
      {søknadState?.søknad?.manuelleBarn?.map((barn, index) => {
        const requiredVedlegg = søknadState?.requiredVedlegg.find(
          (e) => e?.type === `barn-${barn.internId}`
        );
        return (
          <FieldArrayFileInput
            key={barn.internId}
            control={control}
            name={`${barn.internId}`}
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
        name={'ANNET'}
        type={AttachmentType.ANNET}
        control={control}
        errors={errors}
        setError={setError}
        clearErrors={clearErrors}
        heading={'Annen dokumentasjon'}
        ingress={
          'Hvis du har noe annet du ønsker å legge ved kan du laste det opp her (valgfritt).'
        }
      />
      <Textarea
        value={søknadState.søknad?.tilleggsopplysninger}
        name={`tilleggsopplysninger`}
        onChange={onTilleggsopplysningerChange}
        label={formatMessage(`søknad.tilleggsopplysninger.tilleggsopplysninger.label`)}
        description={formatMessage(`søknad.tilleggsopplysninger.tilleggsopplysninger.description`)}
        maxLength={4000}
      />
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
