import { Alert, BodyShort, Checkbox, GuidePanel, Heading, Radio, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useMemo } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import CheckboxGroupWrapper from '../../../components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import {
  useVedleggContext,
  addRequiredVedlegg,
  removeRequiredVedlegg,
} from '../../../context/vedleggContext';
import { JaEllerNei } from '../../../types/Generic';
import Soknad from '../../../types/Soknad';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
export enum AttachmentType {
  LØNN_OG_ANDRE_GODER = 'LØNN_OG_ANDRE_GODER',
  OMSORGSSTØNAD = 'OMSORGSSTØNAD',
  UTLANDSSTØNAD = 'UTLANDSSTØNAD',
}
const ANDRE_UTBETALINGER = 'andreUtbetalinger';
const LØNN = 'lønn';
const STØNAD = 'stønad';

export const AndreUtbetalinger = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [ANDRE_UTBETALINGER]: yup.object().shape({
      [LØNN]: yup
        .string()
        .required(getText('form.andreUtbetalinger.lønn.required'))
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI], getText('form.andreUtbetalinger.lønn.required'))
        .typeError(getText('form.andreUtbetalinger.lønn.required')),
      [STØNAD]: yup.array().min(1, getText('form.andreUtbetalinger.stønad.required')),
    }),
  });
  const { vedleggDispatch } = useVedleggContext();
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [ANDRE_UTBETALINGER]: søknad?.andreUtbetalinger,
    },
  });

  const lønnEtterlønnEllerSluttpakke = watch(`${ANDRE_UTBETALINGER}.${LØNN}`);
  const stønadEllerVerv = watch(`${ANDRE_UTBETALINGER}.${STØNAD}`);
  const StønadAlternativer = useMemo(
    () => ({
      ØKONOMISK_SOSIALHJELP: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.økonomiskSosialhjelp`),
      OMSORGSSTØNAD: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.omsorgsstønad`),
      INTRODUKSJONSSTØNAD: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.introduksjonsStønad`),
      KVALIFISERINGSSTØNAD: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.kvalifiseringsstønad`),
      VERV: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.verv`),
      UTLAND: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.utland`),
      PENSJON: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.pensjon`),
      STIPEND: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.stipend`),
      NEI: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.nei`),
    }),
    [getText]
  );
  const Attachments = useMemo(() => {
    let attachments: Array<{ type: string; description: string }> = [];

    if (stønadEllerVerv?.includes(StønadAlternativer.OMSORGSSTØNAD)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.OMSORGSSTØNAD,
          description: getText(`steps.andre_utbetalinger.alertAttachments.omsorgsstønad`),
        },
      ];
    }
    if (stønadEllerVerv?.includes(StønadAlternativer.UTLAND)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.UTLANDSSTØNAD,
          description: getText(`steps.andre_utbetalinger.alertAttachments.utlandsStønad`),
        },
      ];
    }
    if (lønnEtterlønnEllerSluttpakke === JaEllerNei.JA) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.LØNN_OG_ANDRE_GODER,
          description: getText(`steps.andre_utbetalinger.alertAttachments.andreGoder`),
        },
      ];
    }
    return attachments;
  }, [stønadEllerVerv, lønnEtterlønnEllerSluttpakke]);
  useEffect(() => {
    const lastChecked = stønadEllerVerv?.slice(-1)?.[0];
    if (lastChecked === StønadAlternativer.NEI) {
      if (stønadEllerVerv?.length > 1)
        setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, [StønadAlternativer.NEI]);
    } else if (stønadEllerVerv?.includes(StønadAlternativer.NEI)) {
      const newList = [...stønadEllerVerv].filter((e) => e !== StønadAlternativer.NEI);
      setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, newList);
    }
  }, [stønadEllerVerv]);

  useEffect(() => {
    removeRequiredVedlegg('omsorgsstønad', vedleggDispatch);
    removeRequiredVedlegg('utlandsStønad', vedleggDispatch);
    removeRequiredVedlegg('andreGoder', vedleggDispatch);
    addRequiredVedlegg(Attachments, vedleggDispatch);
  }, [Attachments]);
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
        {getText(`steps.andre_utbetalinger.title`)}
      </Heading>
      <GuidePanel>{getText(`steps.andre_utbetalinger.guide`)}</GuidePanel>
      <RadioGroupWrapper
        legend={getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.legend`)}
        name={`${ANDRE_UTBETALINGER}.${LØNN}`}
        control={control}
        error={errors?.[ANDRE_UTBETALINGER]?.[LØNN]?.message}
      >
        <ReadMore
          header={getText('steps.andre_utbetalinger.ekstraUtbetalingerReadMore.title')}
          type={'button'}
        >
          {getText('steps.andre_utbetalinger.ekstraUtbetalingerReadMore.text')}
        </ReadMore>
        <Radio value={JaEllerNei.JA}>
          <BodyShort>{JaEllerNei.JA}</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>{JaEllerNei.NEI}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      <CheckboxGroupWrapper
        name={`${ANDRE_UTBETALINGER}.${STØNAD}`}
        control={control}
        size="medium"
        legend={getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.legend`)}
        error={errors?.[ANDRE_UTBETALINGER]?.[STØNAD]?.message}
      >
        <Checkbox value={StønadAlternativer.VERV}>{StønadAlternativer.VERV}</Checkbox>
        <Checkbox value={StønadAlternativer.ØKONOMISK_SOSIALHJELP}>
          {StønadAlternativer.ØKONOMISK_SOSIALHJELP}
        </Checkbox>
        <Checkbox value={StønadAlternativer.OMSORGSSTØNAD}>
          {StønadAlternativer.OMSORGSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadAlternativer.INTRODUKSJONSSTØNAD}>
          {StønadAlternativer.INTRODUKSJONSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadAlternativer.KVALIFISERINGSSTØNAD}>
          {StønadAlternativer.KVALIFISERINGSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadAlternativer.UTLAND}>{StønadAlternativer.UTLAND}</Checkbox>
        <Checkbox value={StønadAlternativer.PENSJON}>{StønadAlternativer.PENSJON}</Checkbox>
        <Checkbox value={StønadAlternativer.STIPEND}>{StønadAlternativer.STIPEND}</Checkbox>
        <Checkbox value={StønadAlternativer.NEI}>{StønadAlternativer.NEI}</Checkbox>
      </CheckboxGroupWrapper>
      {Attachments.length > 0 && (
        <Alert variant={'info'}>
          {getText('steps.andre_utbetalinger.alertAttachments.title')}
          <ul>
            {Attachments.map((attachment) => (
              <li>{attachment?.description}</li>
            ))}
          </ul>
          {getText('steps.andre_utbetalinger.alertAttachments.uploadInfo')}
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
