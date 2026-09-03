import { Soknad } from 'types/Soknad';
import { useEffect } from 'react';
import { Alert, BodyLong, BodyShort, Heading, Label, Textarea } from '@navikt/ds-react';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { setFocusOnErrorSummary } from '../../../schema/FormErrorSummary';
import { ScanningGuide } from './scanningguide/ScanningGuide';
import { addVedlegg, deleteVedlegg, updateSøknadData } from 'context/soknadcontext/actions';
import { useSoknad } from 'hooks/SoknadHook';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { FileInputInnsending } from 'components/FileInput/FileInputInnsending';
import { sporHendelse } from 'lib/utils/umami';
import { Events } from '@navikt/analytics-types';

interface Props {
  onBackClick: () => void;
}

const Vedlegg = ({ onBackClick }: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknad();
  const { stepWizardDispatch, stepList } = useStepWizard();
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

  return (
    <SoknadFormWrapperNew
      onNext={() => {
        if (errors.length === 0) {
          if(søknadState.søknad?.tilleggsopplysninger?.length &&
            søknadState.søknad?.tilleggsopplysninger?.length > 0){
            sporHendelse(Events.TEXTAREA_UTFYLT, {feltNavn: 'tilleggsopplysninger'})
          }

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
        <FileInputInnsending
          id={'avbruttStudie'}
          heading={formatMessage({ id: 'søknad.student.vedlegg.name' })}
          ingress={formatMessage({ id: 'søknad.student.vedlegg.description' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'AVBRUTT_STUDIE');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'AVBRUTT_STUDIE');
          }}
          files={søknadState.søknad?.vedlegg?.AVBRUTT_STUDIE || []}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === 'OMSORGSSTØNAD') && (
        <FileInputInnsending
          id={'OMSORGSSTØNAD'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.omsorgsstønad' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.omsorgsstønad' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'OMSORGSSTØNAD');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'OMSORGSSTØNAD');
          }}
          files={søknadState.søknad?.vedlegg?.OMSORGSSTØNAD || []}
        />
      )}
      {søknadState?.requiredVedlegg?.find((e) => e.type === 'LØNN_OG_ANDRE_GODER') && (
        <FileInputInnsending
          id={'LØNN_OG_ANDRE_GODER'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.lønn.title' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.andreGoder' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'LØNN_OG_ANDRE_GODER');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'LØNN_OG_ANDRE_GODER');
          }}
          files={søknadState.søknad?.vedlegg?.LØNN_OG_ANDRE_GODER || []}
        />
      )}

      {søknadState?.requiredVedlegg?.find((e) => e.type === 'UTLANDSSTØNAD') && (
        <FileInputInnsending
          id={'UTLANDSSTØNAD'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.utland' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.utlandsStønad' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'UTLANDSSTØNAD');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'UTLANDSSTØNAD');
          }}
          files={søknadState.søknad?.vedlegg?.UTLANDSSTØNAD || []}
        />
      )}

      {søknadState.requiredVedlegg?.find((e) => e.type === 'LÅN') && (
        <FileInputInnsending
          id={'LÅN'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.lån' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.lån' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'LÅN');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'LÅN');
          }}
          files={søknadState.søknad?.vedlegg?.LÅN || []}
        />
      )}

      {søknadState.requiredVedlegg?.find((e) => e.type === 'SYKESTIPEND') && (
        <FileInputInnsending
          id={'SYKESTIPEND'}
          heading={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.values.stipend' })}
          ingress={formatMessage({ id: 'søknad.andreUtbetalinger.vedlegg.sykeStipend' })}
          onUpload={(vedlegg) => {
            addVedlegg(søknadDispatch, vedlegg, 'SYKESTIPEND');
          }}
          onDelete={(vedlegg) => {
            deleteVedlegg(søknadDispatch, vedlegg, 'SYKESTIPEND');
          }}
          files={søknadState.søknad?.vedlegg?.SYKESTIPEND || []}
        />
      )}

      {søknadState?.søknad?.manuelleBarn?.map((barn) => {
        const requiredVedlegg = søknadState?.requiredVedlegg.find((e) => e?.type === barn.internId);
        return (
          <FileInputInnsending
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
            files={søknadState.søknad?.vedlegg?.[barn.internId] || []}
          />
        );
      })}

      <FileInputInnsending
        heading={formatMessage({ id: 'søknad.vedlegg.andreVedlegg.title' })}
        ingress={formatMessage({ id: 'søknad.vedlegg.andreVedlegg.ingress' })}
        id="ANNET"
        onUpload={(vedlegg) => {
          addVedlegg(søknadDispatch, vedlegg, 'ANNET');
        }}
        onDelete={(vedlegg) => {
          deleteVedlegg(søknadDispatch, vedlegg, 'ANNET');
        }}
        files={søknadState.søknad?.vedlegg?.ANNET || []}
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
