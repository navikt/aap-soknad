import { useForm, useWatch } from 'react-hook-form';
import { ManuelleBarn, Soknad, Vedlegg } from 'types/Soknad';
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
import { GenericSoknadContextState } from 'types/SoknadContext';
import { scrollRefIntoView } from 'utils/dom';
import { LucaGuidePanel, ScanningGuide } from '@navikt/aap-felles-innbygger-react';
import { useIntl } from 'react-intl';
import { VedleggFileInput } from '../../../input/FileInput/VedleggFileInput';
import {
  hasVirus,
  isPasswordProtected,
  isUnderTotalFileSize,
  isValidAttachment,
  isValidFileType,
} from '../../../input/FileInput/FileInputValidations';
import { ManuelleBarnFileInput } from '../../../input/FileInput/ManuelleBarnFileInput';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export interface FormFields {
  lønnOgAndreGoder: Vedlegg[];
  omsorgstønad: Vedlegg[];
  utlandsstønad: Vedlegg[];
  avbruttStudie: Vedlegg[];
  sykestipend: Vedlegg[];
  lån: Vedlegg[];
  annet: Vedlegg[];
  manuelleBarn: ManuelleBarn[];
}

const Vedlegg = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const { locale } = useIntl();

  const errorText = (statusCode: number, substatus?: string) => {
    switch (statusCode) {
      case 422:
        return error422Text(substatus);
      case 413:
        return formatMessage('fileInputErrors.fileTooLarge');
      case 415:
        return formatMessage('fileInputErrors.unsupportedMediaType');
      default:
        return formatMessage('fileInputErrors.other');
    }
  };

  const error422Text = (subType?: string) => {
    switch (subType) {
      case 'PASSWORD_PROTECTED':
        return formatMessage('fileInputErrors.passordbeskyttet');
      case 'VIRUS':
        return formatMessage('fileInputErrors.virus');
      case 'SIZE':
        return formatMessage('fileInputErrors.size');
      default:
        return '';
    }
  };

  const getSchemaValidation = () => {
    return yup
      .array()
      .test('unvalidFileType', errorText(415), (value) => {
        return isValidFileType(value);
      })
      .test('filesToLarge', errorText(413), (value) => {
        return isUnderTotalFileSize(value);
      })
      .test('422', error422Text('VIRUS'), (value) => {
        return !hasVirus(value);
      })
      .test('422', error422Text('PASSWORD_PROTECTED'), (value) => {
        return !isPasswordProtected(value);
      })
      .test('unvalidAttachment', errorText(1), (value) => {
        return isValidAttachment(value);
      });
  };

  const schema = yup.object().shape({
    lønnOgAndreGoder: getSchemaValidation(),
    omsorgstønad: getSchemaValidation(),
    utlandsstønad: getSchemaValidation(),
    avbruttStudie: getSchemaValidation(),
    avbruttStipend: getSchemaValidation(),
    sykestipend: getSchemaValidation(),
    lån: getSchemaValidation(),
    annet: getSchemaValidation(),
    manuelleBarn: yup.array().of(yup.object({ vedlegg: getSchemaValidation() })),
  });

  const {
    clearErrors,
    trigger,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      annet: defaultValues?.søknad?.vedlegg?.ANNET,
      lån: defaultValues?.søknad?.vedlegg?.LÅN,
      lønnOgAndreGoder: defaultValues?.søknad?.vedlegg?.LØNN_OG_ANDRE_GODER,
      omsorgstønad: defaultValues?.søknad?.vedlegg?.OMSORGSSTØNAD,
      avbruttStudie: defaultValues?.søknad?.vedlegg?.AVBRUTT_STUDIE,
      sykestipend: defaultValues?.søknad?.vedlegg?.SYKESTIPEND,
      utlandsstønad: defaultValues?.søknad?.vedlegg?.UTLANDSSTØNAD,
      manuelleBarn: defaultValues?.søknad?.manuelleBarn,
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
        const newData = {
          vedlegg: Object.keys(data)
            .filter((key) => key !== 'manuelleBarn')
            .map((field) => data[field as unknown as keyof FormFields])
            .flat(),
          manuelleBarn: data.manuelleBarn,
        };
        onNext(newData);
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
      <div>
        {søknadState?.requiredVedlegg?.length > 0 ? (
          <>
            <Label as={'p'}>{formatMessage('søknad.vedlegg.harVedlegg.title')}</Label>
            <ul>
              {søknadState?.requiredVedlegg?.map((vedlegg, index) => (
                <li key={index}>{vedlegg?.description}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <Label as={'p'}>{formatMessage('søknad.vedlegg.ingenVedlegg.title')}</Label>
            <ReadMore
              header={formatMessage('søknad.vedlegg.ingenVedlegg.readMore.title')}
              type={'button'}
            >
              {formatMessage('søknad.vedlegg.ingenVedlegg.readMore.text')}
            </ReadMore>
          </>
        )}
      </div>
      <div>
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
      </div>
      {søknadState?.requiredVedlegg?.find((e) => e.type === AVBRUTT_STUDIE_VEDLEGG) && (
        <VedleggFileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'avbruttStudie'}
          heading={formatMessage('søknad.student.vedlegg.name')}
          ingress={formatMessage('søknad.student.vedlegg.description')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER) && (
        <VedleggFileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'lønnOgAndreGoder'}
          heading={'Lønn og andre goder'}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.andreGoder')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.OMSORGSSTØNAD) && (
        <VedleggFileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'omsorgstønad'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.omsorgsstønad')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.omsorgsstønad')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <VedleggFileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'utlandsstønad'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.utland')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.utlandsStønad')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LÅN) && (
        <VedleggFileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'lån'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.lån')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.lån')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.SYKESTIPEND) && (
        <VedleggFileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'sykestipend'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.stipend')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.sykeStipend')}
        />
      )}

      <ManuelleBarnFileInput
        name={'manuelleBarn'}
        clearErrors={clearErrors}
        triggerValidation={trigger}
        control={control}
      />

      <VedleggFileInput
        clearErrors={clearErrors}
        triggerValidation={trigger}
        name={'annet'}
        control={control}
        heading={'Annen dokumentasjon'}
        ingress={'Hvis du har noe annet du ønsker å legge ved kan du laste det opp her'}
      />
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
