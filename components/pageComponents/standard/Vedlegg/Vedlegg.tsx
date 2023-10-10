import { Soknad } from 'types/Soknad';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, BodyLong, BodyShort, Heading, Label, ReadMore, Textarea } from '@navikt/ds-react';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { deleteVedlegg, updateSøknadData, addVedlegg } from 'context/soknadContextCommon';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { scrollRefIntoView } from 'utils/dom';
import { FileInput, LucaGuidePanel, ScanningGuide } from '@navikt/aap-felles-react';
import { useIntl } from 'react-intl';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';
import { AttachmentType } from '../AndreUtbetalinger/AndreUtbetalinger';
import { AVBRUTT_STUDIE_VEDLEGG } from '../Student/Student';
import { setFocusOnErrorSummary } from '../../../schema/FormErrorSummary';

interface Props {
  onBackClick: () => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const Vedlegg = ({ onBackClick, defaultValues }: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepWizardDispatch, currentStepIndex } = useStepWizard();
  const { stepList } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const { locale } = useIntl();

  const [scanningGuideOpen, setScanningGuideOpen] = useState(false);
  const scanningGuideElement = useRef(null);

  useEffect(() => {
    if (scanningGuideOpen) {
      if (scanningGuideElement?.current != null) scrollRefIntoView(scanningGuideElement);
    }
  }, [scanningGuideOpen]);

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.vedlegg, søknadState.søknad?.tilleggsopplysninger]);

  const errors: SøknadValidationError[] = Object.entries(søknadState.søknad?.vedlegg || {})
    .flatMap(([key, vedleggArray]) =>
      vedleggArray
        ?.filter((vedlegg) => vedlegg.errorMessage !== '')
        .map((vedlegg) => ({
          message: vedlegg.errorMessage || '',
          path: key,
        }))
    )
    .filter((error): error is SøknadValidationError => error !== undefined);

  const harPåkrevdeVedlegg = søknadState.requiredVedlegg.length > 0;

  console.log('requiredVedlegg', søknadState.requiredVedlegg);

  return (
    <SoknadFormWrapperNew
      onNext={() => {
        if (!errors) {
          logSkjemastegFullførtEvent(currentStepIndex ?? 0);
          completeAndGoToNextStep(stepWizardDispatch);
        } else {
          setFocusOnErrorSummary();
        }
      }}
      onBack={() => onBackClick()}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage({ id: 'søknad.vedlegg.title' })}
      </Heading>
      {harPåkrevdeVedlegg ? (
        <>
          <LucaGuidePanel>
            <BodyShort spacing>{formatMessage({ id: 'søknad.vedlegg.guide.text1' })}</BodyShort>
            <BodyShort>{formatMessage({ id: 'søknad.vedlegg.guide.text2' })}</BodyShort>
          </LucaGuidePanel>
          <div>
            <Label as={'p'}>{formatMessage({ id: 'søknad.vedlegg.harVedlegg.title' })}</Label>
            <ul>
              {søknadState?.requiredVedlegg?.map((vedlegg, index) => (
                <li key={index}>{vedlegg?.description}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <Alert variant={'info'}>
          <BodyLong spacing>
            {formatMessage({ id: 'søknad.vedlegg.ingenVedlegg.alert.text1' })}
          </BodyLong>
          <BodyLong spacing>
            {formatMessage({ id: 'søknad.vedlegg.ingenVedlegg.alert.text2' })}
          </BodyLong>
          <BodyLong>{formatMessage({ id: 'søknad.vedlegg.ingenVedlegg.alert.text3' })}</BodyLong>
        </Alert>
      )}
      <div>
        <BodyLong>{formatMessage({ id: 'søknad.vedlegg.vedleggPåPapir.text' })}</BodyLong>
        <ReadMore
          header={formatMessage({ id: 'søknad.vedlegg.vedleggPåPapir.readMore.title' })}
          type={'button'}
          open={scanningGuideOpen}
          onClick={() => setScanningGuideOpen(!scanningGuideOpen)}
          ref={scanningGuideElement}
        >
          <ScanningGuide locale={locale} />
        </ReadMore>
      </div>

      {søknadState?.requiredVedlegg?.find((e) => e.type === AVBRUTT_STUDIE_VEDLEGG) && (
        <FileInput
          locale={locale}
          id={'avbruttStudie'}
          heading={formatMessage({ id: 'søknad.student.vedlegg.name' })}
          ingress={formatMessage({ id: 'søknad.student.vedlegg.description' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'AVBRUTT_STUDIE');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'AVBRUTT_STUDIE');
          }}
          deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
          uploadUrl="/aap/soknad/api/vedlegg/lagre/"
          files={søknadState?.søknad?.vedlegg?.AVBRUTT_STUDIE || []}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER) && (
        <FileInput
          locale={locale}
          id={'LØNN_OG_ANDRE_GODER'}
          heading={'Lønn og andre goder'}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.andreGoder' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'LØNN_OG_ANDRE_GODER');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'LØNN_OG_ANDRE_GODER');
          }}
          deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
          uploadUrl="/aap/soknad/api/vedlegg/lagre/"
          files={søknadState?.søknad?.vedlegg?.LØNN_OG_ANDRE_GODER || []}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <FileInput
          locale={locale}
          id={'UTLANDSSTØNAD'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.utland' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.utlandsStønad' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'UTLANDSSTØNAD');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'UTLANDSSTØNAD');
          }}
          deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
          uploadUrl="/aap/soknad/api/vedlegg/lagre/"
          files={søknadState?.søknad?.vedlegg?.UTLANDSSTØNAD || []}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.LÅN) && (
        <FileInput
          locale={locale}
          id={'LÅN'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.lån' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.lån' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'LÅN');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'LÅN');
          }}
          deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
          uploadUrl="/aap/soknad/api/vedlegg/lagre/"
          files={søknadState?.søknad?.vedlegg?.LÅN || []}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === AttachmentType.SYKESTIPEND) && (
        <FileInput
          locale={locale}
          id={'SYKESTIPEND'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.stipend' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.sykeStipend' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'SYKESTIPEND');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'SYKESTIPEND');
          }}
          deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
          uploadUrl="/aap/soknad/api/vedlegg/lagre/"
          files={søknadState?.søknad?.vedlegg?.SYKESTIPEND || []}
        />
      )}
      {søknadState?.søknad?.manuelleBarn?.map((barn) => {
        const requiredVedlegg = søknadState?.requiredVedlegg.find(
          (e) => e?.type === `barn-${barn.internId}`
        );
        return (
          <FileInput
            locale={locale}
            key={barn.internId}
            id={barn.internId!}
            heading={formatMessage(
              { id: `søknad.vedlegg.andreBarn.title.${requiredVedlegg?.filterType}` },
              {
                navn: `${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
              }
            )}
            ingress={requiredVedlegg?.description}
            onUpload={(vedlegg) => {
              addVedlegg(søknadDispatch, vedlegg, barn.internId);
            }}
            onDelete={(vedlegg) => {
              deleteVedlegg(søknadDispatch, vedlegg, barn.internId);
            }}
            deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
            uploadUrl="/aap/soknad/api/vedlegg/lagre/"
            files={søknadState?.søknad?.vedlegg?.[barn.internId] || []}
          />
        );
      })}
      <FileInput
        locale={locale}
        heading={formatMessage({ id: 'søknad.vedlegg.andreVedlegg.title' })}
        ingress={formatMessage({ id: 'søknad.vedlegg.andreVedlegg.ingress' })}
        id="ANNET"
        onUpload={(vedlegg) => {
          addVedlegg(søknadDispatch, vedlegg, 'ANNET');
        }}
        onDelete={(vedlegg) => {
          deleteVedlegg(søknadDispatch, vedlegg, 'ANNET');
        }}
        deleteUrl="/aap/soknad/api/vedlegg/slett/?uuids="
        uploadUrl="/aap/soknad/api/vedlegg/lagre/"
        files={søknadState?.søknad?.vedlegg?.ANNET || []}
      />
      <Textarea
        value={søknadState.søknad?.tilleggsopplysninger}
        name={`tilleggsopplysninger`}
        onChange={(e) =>
          updateSøknadData<Soknad>(søknadDispatch, { tilleggsopplysninger: e.target.value })
        }
        label={formatMessage({ id: `søknad.tilleggsopplysninger.tilleggsopplysninger.label` })}
        description={formatMessage({
          id: `søknad.tilleggsopplysninger.tilleggsopplysninger.description`,
        })}
        maxLength={4000}
      />
    </SoknadFormWrapperNew>
  );
};
export default Vedlegg;
