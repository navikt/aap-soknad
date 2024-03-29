import { Soknad } from 'types/Soknad';
import React, { useEffect } from 'react';
import { Alert, BodyLong, BodyShort, Heading, Label, Textarea } from '@navikt/ds-react';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { setFocusOnErrorSummary } from '../../../schema/FormErrorSummary';
import { ScanningGuide } from './scanningguide/ScanningGuide';
import { addVedlegg, deleteVedlegg, updateSøknadData } from 'context/soknadcontext/actions';
import { useSoknad } from 'hooks/SoknadHook';
import { FileInputWrapper } from 'components/pageComponents/standard/Vedlegg/FileInputWrapper';

interface Props {
  onBackClick: () => void;
}

const Vedlegg = ({ onBackClick }: Props) => {
  const { formatMessage, locale } = useIntl();
  const { søknadState, søknadDispatch } = useSoknad();
  const { stepWizardDispatch, currentStepIndex, stepList } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.vedlegg, søknadState.søknad?.tilleggsopplysninger]);

  const errors: SøknadValidationError[] = Object.entries(søknadState.søknad?.vedlegg || {})
    .flatMap(([key, vedleggArray]) =>
      vedleggArray
        ?.filter((vedlegg) => vedlegg.errorMessage)
        .map((vedlegg) => ({
          message: vedlegg.errorMessage || '',
          path: key,
        })),
    )
    .filter((error): error is SøknadValidationError => error !== undefined);

  const harPåkrevdeVedlegg = søknadState.requiredVedlegg.length > 0;

  const deleteUrl = '/aap/soknad/api/vedlegginnsending/slett/?uuid=';
  const uploadUrl = '/aap/soknad/api/vedlegginnsending/lagre/';

  const readAttachmentUrl = '/aap/soknad/vedlegg/';

  return (
    <SoknadFormWrapperNew
      onNext={() => {
        if (errors.length === 0) {
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
      <ScanningGuide />

      {søknadState?.requiredVedlegg?.find((e) => e.type === 'AVBRUTT_STUDIE') && (
        <FileInputWrapper
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
          deleteUrl={deleteUrl}
          uploadUrl={uploadUrl}
          readAttachmentUrl={readAttachmentUrl}
          files={søknadState.søknad?.vedlegg?.AVBRUTT_STUDIE || []}
          brukFileInputInnsending={true}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === 'OMSORGSSTØNAD') && (
        <FileInputWrapper
          locale={locale}
          id={'OMSORGSSTØNAD'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.omsorgsstønad' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.omsorgsstønad' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'OMSORGSSTØNAD');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'OMSORGSSTØNAD');
          }}
          deleteUrl={deleteUrl}
          uploadUrl={uploadUrl}
          readAttachmentUrl={readAttachmentUrl}
          files={søknadState.søknad?.vedlegg?.OMSORGSSTØNAD || []}
          brukFileInputInnsending={true}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === 'LØNN_OG_ANDRE_GODER') && (
        <FileInputWrapper
          locale={locale}
          id={'LØNN_OG_ANDRE_GODER'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.lønn.title' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.andreGoder' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'LØNN_OG_ANDRE_GODER');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'LØNN_OG_ANDRE_GODER');
          }}
          deleteUrl={deleteUrl}
          uploadUrl={uploadUrl}
          readAttachmentUrl={readAttachmentUrl}
          files={søknadState.søknad?.vedlegg?.LØNN_OG_ANDRE_GODER || []}
          brukFileInputInnsending={true}
        />
      )}

      {søknadState?.requiredVedlegg?.find((e) => e.type === 'UTLANDSSTØNAD') && (
        <FileInputWrapper
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
          deleteUrl={deleteUrl}
          uploadUrl={uploadUrl}
          readAttachmentUrl={readAttachmentUrl}
          files={søknadState.søknad?.vedlegg?.UTLANDSSTØNAD || []}
          brukFileInputInnsending={true}
        />
      )}

      {søknadState.requiredVedlegg?.find((e) => e.type === 'LÅN') && (
        <FileInputWrapper
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
          deleteUrl={deleteUrl}
          uploadUrl={uploadUrl}
          readAttachmentUrl={readAttachmentUrl}
          files={søknadState.søknad?.vedlegg?.LÅN || []}
          brukFileInputInnsending={true}
        />
      )}

      {søknadState.requiredVedlegg?.find((e) => e.type === 'SYKESTIPEND') && (
        <FileInputWrapper
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
          deleteUrl={deleteUrl}
          uploadUrl={uploadUrl}
          readAttachmentUrl={readAttachmentUrl}
          files={søknadState.søknad?.vedlegg?.SYKESTIPEND || []}
          brukFileInputInnsending={true}
        />
      )}

      {søknadState?.søknad?.manuelleBarn?.map((barn) => {
        const requiredVedlegg = søknadState?.requiredVedlegg.find((e) => e?.type === barn.internId);
        return (
          <FileInputWrapper
            locale={locale}
            key={barn.internId}
            id={barn.internId!}
            heading={formatMessage(
              { id: `søknad.vedlegg.andreBarn.title.${requiredVedlegg?.filterType}` },
              {
                navn: `${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
              },
            )}
            ingress={requiredVedlegg?.description}
            onUpload={(vedlegg) => {
              addVedlegg(søknadDispatch, vedlegg, barn.internId);
            }}
            onDelete={(vedlegg) => {
              deleteVedlegg(søknadDispatch, vedlegg, barn.internId);
            }}
            deleteUrl={deleteUrl}
            uploadUrl={uploadUrl}
            readAttachmentUrl={readAttachmentUrl}
            files={søknadState.søknad?.vedlegg?.[barn.internId] || []}
            brukFileInputInnsending={true}
          />
        );
      })}

      <FileInputWrapper
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
        deleteUrl={deleteUrl}
        uploadUrl={uploadUrl}
        readAttachmentUrl={readAttachmentUrl}
        files={søknadState.søknad?.vedlegg?.ANNET || []}
        brukFileInputInnsending={true}
      />

      <Textarea
        value={søknadState.søknad?.tilleggsopplysninger}
        name={`tilleggsopplysninger`}
        onChange={(e) => updateSøknadData(søknadDispatch, { tilleggsopplysninger: e.target.value })}
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
