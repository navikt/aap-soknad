import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import { GetText } from '../../../hooks/useTexts';
import React from 'react';
import { Alert, BodyShort, GuidePanel, Heading, Label, ReadMore } from '@navikt/ds-react';
import FileInput from '../../../components/input/FileInput/FileInput';
import { useVedleggContext } from '../../../context/vedleggContext';
import ScanningGuide from '../../../components/ScanningGuide/ScanningGuide';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { AttachmentType } from '../AndreUtbetalinger/AndreUtbetalinger';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const VEDLEGG = 'vedlegg';
const VEDLEGG_LØNN = `${VEDLEGG}.${AttachmentType.LØNN_OG_ANDRE_GODER}`;
const VEDLEGG_FOSTERHJEMSGODTGJØRELSE = `${VEDLEGG}.${AttachmentType.FOSTERHJEMSGODTGJØRELSE}`;
const VEDLEGG_OMSORGSSTØNAD = `${VEDLEGG}.${AttachmentType.OMSORGSSTØNAD}`;
const VEDLEGG_UTLANDSSTØNAD = `${VEDLEGG}.${AttachmentType.UTLANDSSTØNAD}`;
const VEDLEGG_BARN = `${VEDLEGG}.barn`;
const VEDLEGG_ANNET = `${VEDLEGG}.annet`;

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
  const fieldArrayLønn = useFieldArray({
    name: VEDLEGG_LØNN,
    control,
  });
  const fieldArrayFosterhjemsgodtgjørelse = useFieldArray({
    name: VEDLEGG_FOSTERHJEMSGODTGJØRELSE,
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
        <BodyShort spacing>{getText(`steps.vedlegg.guide`)}</BodyShort>
        <BodyShort>{getText(`steps.vedlegg.guide2`)}</BodyShort>
      </GuidePanel>
      <BodyShort>
        {vedleggState?.requiredVedlegg?.length > 0 ? (
          <>
            <Label>{getText('steps.vedlegg.attachmentListDescription')}</Label>
            <ul>
              {vedleggState?.requiredVedlegg?.map((vedlegg, index) => (
                <li key={index}>{vedlegg?.description}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <Label spacing>
              Ut fra dine svar har vi ikke registrert noen vedlegg som må lastes opp.
            </Label>
            <ReadMore header={getText('steps.vedlegg.readMore.heading')} type={'button'}>
              {getText('steps.vedlegg.readMore.text')}
            </ReadMore>
          </>
        )}
      </BodyShort>
      <BodyShort>{getText('steps.vedlegg.taBildeInfo')}</BodyShort>
      <ReadMore header={getText('steps.vedlegg.taBildeReadMore')} type={'button'}>
        <ScanningGuide getText={getText} />
      </ReadMore>
      {vedleggState?.requiredVedlegg?.find(
        (e) => e.type === AttachmentType.LØNN_OG_ANDRE_GODER
      ) && (
        <FileInput
          name={VEDLEGG_LØNN}
          fields={fieldArrayLønn.fields}
          append={fieldArrayLønn.append}
          remove={fieldArrayLønn.remove}
          heading={getText('form.vedlegg.lønnOgAndreGoder.heading')}
          ingress={getText(`steps.andre_utbetalinger.alertAttachments.andreGoder`)}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AttachmentType.OMSORGSSTØNAD) && (
        <FileInput
          name={VEDLEGG_OMSORGSSTØNAD}
          fields={fieldArrayOmsorgsstønad.fields}
          append={fieldArrayOmsorgsstønad.append}
          remove={fieldArrayOmsorgsstønad.remove}
          heading={getText('form.vedlegg.omsorgsstønad.heading')}
          ingress={getText(`steps.andre_utbetalinger.alertAttachments.omsorgsstønad`)}
        />
      )}
      {vedleggState?.requiredVedlegg?.find(
        (e) => e.type === AttachmentType.FOSTERHJEMSGODTGJØRELSE
      ) && (
        <FileInput
          name={VEDLEGG_FOSTERHJEMSGODTGJØRELSE}
          fields={fieldArrayFosterhjemsgodtgjørelse.fields}
          append={fieldArrayFosterhjemsgodtgjørelse.append}
          remove={fieldArrayFosterhjemsgodtgjørelse.remove}
          heading={getText('form.vedlegg.fosterhjemsgodtgjørelse.heading')}
          ingress={getText(`steps.andre_utbetalinger.alertAttachments.fosterhjemsgodtgjørelse`)}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e.type === AttachmentType.UTLANDSSTØNAD) && (
        <FileInput
          name={VEDLEGG_UTLANDSSTØNAD}
          fields={fieldArrayUtlandsstønad.fields}
          append={fieldArrayUtlandsstønad.append}
          remove={fieldArrayUtlandsstønad.remove}
          heading={getText('form.vedlegg.utlandsstønad.heading')}
          ingress={getText(`steps.andre_utbetalinger.alertAttachments.utlandsStønad`)}
        />
      )}
      {vedleggState?.requiredVedlegg?.find((e) => e?.type?.split('-')?.[0] === 'barn') && (
        <FileInput
          name={VEDLEGG_BARN}
          fields={fieldArrayBarn.fields}
          append={fieldArrayBarn.append}
          remove={fieldArrayBarn.remove}
          heading={getText('form.vedlegg.barn.heading')}
          ingress={getText('form.barnetillegg.add.alertBullet')}
        />
      )}
      <FileInput
        name={VEDLEGG}
        fields={fieldArrayAnnet.fields}
        append={fieldArrayAnnet.append}
        remove={fieldArrayAnnet.remove}
        heading={getText('form.vedlegg.annet.heading')}
        ingress={getText('form.vedlegg.annet.ingress')}
      />

      <Alert variant={'info'}>{getText('steps.vedlegg.alertInfo')}</Alert>
    </SoknadFormWrapper>
  );
};
export default Vedlegg;
