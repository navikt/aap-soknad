import { useForm, useWatch } from 'react-hook-form';
import { Soknad, Vedlegg } from 'types/Soknad';
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
import { FileInput } from '../../../input/FileInput/FileInput';
import {
  isUnderTotalFileSize,
  isValidAttachment,
  isValidFileType,
} from '../../../input/FileInput/FileInputValidations';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export interface FormFieldVedlegg {
  name: string;
  size: number;
  vedleggId?: string;
  barnId?: string; // Ny
  isValid: boolean; // Ny
  file: File; // Ny
  substatus?: string;
}

export interface FormFields {
  lønnOgAndreGoder: FormFieldVedlegg[];
  omsorgstønad: FormFieldVedlegg[];
  utlandsstønad: FormFieldVedlegg[];
  avbruttStudie: FormFieldVedlegg[];
  sykestipend: FormFieldVedlegg[];
  lån: FormFieldVedlegg[];
  annet: FormFieldVedlegg[];
  manuelleBarn: FormFieldVedlegg[]; //TODO Se nærmere på denne med Tor
}

const Vedlegg = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const { locale } = useIntl();

  const errorText = (statusCode: number) => {
    switch (statusCode) {
      case 413:
        return formatMessage('fileInputErrors.fileTooLarge');
      case 415:
        return formatMessage('fileInputErrors.unsupportedMediaType');
      default:
        return formatMessage('fileInputErrors.other');
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
    manuelleBarn: getSchemaValidation(),
  });

  const {
    clearErrors,
    trigger,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    // defaultValues: {
    //   [VEDLEGG]: defaultValues?.søknad?.vedlegg,
    //   [MANUELLE_BARN]: defaultValues?.søknad?.manuelleBarn,
    // },
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

  function mapToVedlegg(field: FormFieldVedlegg): Vedlegg {
    return {
      name: field.name,
      size: field.size,
      vedleggId: field.vedleggId,
    };
  }
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        const newData = {
          vedlegg: Object.keys(data)
            .filter((key) => key !== 'manuelleBarn')
            .map((field) => data[field as unknown as keyof FormFields])
            .flat()
            .map(mapToVedlegg),
          manuelleBarn: Object.keys(data)
            .filter((key) => key === 'manuelleBarn')
            .map((field) => data[field as unknown as keyof FormFields])
            .flat(),
        };
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
        <FileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'avbruttStudie'}
          heading={formatMessage('søknad.student.vedlegg.name')}
          ingress={formatMessage('søknad.student.vedlegg.description')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER) && (
        <FileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'lønnOgAndreGoder'}
          heading={'Lønn og andre goder'}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.andreGoder')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.OMSORGSSTØNAD) && (
        <FileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'omsorgstønad'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.omsorgsstønad')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.omsorgsstønad')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <FileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'utlandsstønad'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.utland')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.utlandsStønad')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LÅN) && (
        <FileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'lån'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.lån')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.lån')}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.SYKESTIPEND) && (
        <FileInput
          clearErrors={clearErrors}
          triggerValidation={trigger}
          control={control}
          name={'sykestipend'}
          heading={formatMessage('søknad.andreUtbetalinger.stønad.values.stipend')}
          ingress={formatMessage('søknad.andreUtbetalinger.vedlegg.sykeStipend')}
        />
      )}
      {/*{søknadState?.søknad?.manuelleBarn?.map((barn, index) => {*/}
      {/*  const requiredVedlegg = søknadState?.requiredVedlegg.find(*/}
      {/*    (e) => e?.type === `barn-${barn.internId}`*/}
      {/*  );*/}
      {/*  return (*/}
      {/*    <FileInput
      clearErrors={clearErrors}
       triggerValidation={trigger} */}
      {/*      key={barn.internId}*/}
      {/*      control={control}*/}
      {/*      name={`${MANUELLE_BARN}.${index}.vedlegg`}*/}
      {/*      type={`barn-${barn.internId}`}*/}
      {/*      errors={errors}*/}
      {/*      setError={setError}*/}
      {/*      clearErrors={clearErrors}*/}
      {/*      heading={formatMessage(*/}
      {/*        `søknad.vedlegg.andreBarn.title.${requiredVedlegg?.filterType}`,*/}
      {/*        {*/}
      {/*          navn: `${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,*/}
      {/*        }*/}
      {/*      )}*/}
      {/*      ingress={requiredVedlegg?.description}*/}
      {/*    />*/}
      {/*  );*/}
      {/*})}*/}
      <FileInput
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
