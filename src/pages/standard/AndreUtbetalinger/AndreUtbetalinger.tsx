import { Alert, BodyShort, Cell, Checkbox, Grid, Heading, Radio, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useMemo } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import CheckboxGroupWrapper from '../../../components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
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
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';

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

export enum StønadType {
  ØKONOMISK_SOSIALHJELP = 'ØKONOMISK_SOSIALHJELP',
  OMSORGSSTØNAD = 'OMSORGSSTØNAD',
  INTRODUKSJONSSTØNAD = 'INTRODUKSJONSSTØNAD',
  KVALIFISERINGSSTØNAD = 'KVALIFISERINGSSTØNAD',
  VERV = 'VERV',
  UTLAND = 'UTLAND',
  AFP = 'AFP',
  STIPEND = 'STIPEND',
  NEI = 'NEI',
}

const ANDRE_UTBETALINGER = 'andreUtbetalinger';
const LØNN = 'lønn';
const STØNAD = 'stønad';

export const AndreUtbetalinger = ({ getText, onBackClick, søknad }: Props) => {
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
      AFP: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.afp`),
      STIPEND: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.stipend`),
      NEI: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.nei`),
    }),
    [getText]
  );
  const Attachments = useMemo(() => {
    let attachments: Array<{ type: string; description: string }> = [];

    if (stønadEllerVerv?.includes(StønadType.OMSORGSSTØNAD)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.OMSORGSSTØNAD,
          description: getText(`steps.andre_utbetalinger.alertAttachments.omsorgsstønad`),
        },
      ];
    }
    if (stønadEllerVerv?.includes(StønadType.UTLAND)) {
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
    if (lastChecked === StønadType.NEI) {
      if (stønadEllerVerv?.length > 1)
        setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, [StønadType.NEI]);
    } else if (stønadEllerVerv?.includes(StønadType.NEI)) {
      const newList = [...stønadEllerVerv].filter((e) => e !== StønadType.NEI);
      setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, newList);
    }
  }, [stønadEllerVerv]);

  useEffect(() => {
    removeRequiredVedlegg(AttachmentType.OMSORGSSTØNAD, vedleggDispatch);
    removeRequiredVedlegg(AttachmentType.UTLANDSSTØNAD, vedleggDispatch);
    removeRequiredVedlegg(AttachmentType.LØNN_OG_ANDRE_GODER, vedleggDispatch);
    addRequiredVedlegg(Attachments, vedleggDispatch);
  }, [Attachments]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {getText(`steps.andre_utbetalinger.title`)}
      </Heading>
      <LucaGuidePanel>{getText(`steps.andre_utbetalinger.guide`)}</LucaGuidePanel>
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
        <Checkbox value={StønadType.VERV}>{StønadAlternativer.VERV}</Checkbox>
        <Checkbox value={StønadType.ØKONOMISK_SOSIALHJELP}>
          {StønadAlternativer.ØKONOMISK_SOSIALHJELP}
        </Checkbox>
        <Checkbox value={StønadType.OMSORGSSTØNAD}>{StønadAlternativer.OMSORGSSTØNAD}</Checkbox>
        <Checkbox value={StønadType.INTRODUKSJONSSTØNAD}>
          {StønadAlternativer.INTRODUKSJONSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadType.KVALIFISERINGSSTØNAD}>
          {StønadAlternativer.KVALIFISERINGSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadType.UTLAND}>{StønadAlternativer.UTLAND}</Checkbox>
        <Checkbox value={StønadType.AFP}>{StønadAlternativer.AFP}</Checkbox>
        {stønadEllerVerv?.includes(StønadType.AFP) && (
          <ColorPanel>
            <Grid>
              <Cell xs={7}>
                <TextFieldWrapper
                  name={`${ANDRE_UTBETALINGER}.afp.hvemBetaler`}
                  label={getText('form.andreUtbetalinger.afp.legend')}
                  control={control}
                />
              </Cell>
            </Grid>
          </ColorPanel>
        )}
        <Checkbox value={StønadType.STIPEND}>{StønadAlternativer.STIPEND}</Checkbox>
        <Checkbox value={StønadType.NEI}>{StønadAlternativer.NEI}</Checkbox>
      </CheckboxGroupWrapper>
      {Attachments.length > 0 && (
        <Alert variant={'info'}>
          {getText('steps.andre_utbetalinger.alertAttachments.title')}
          <ul>
            {Attachments.map((attachment, index) => (
              <li key={index}>{attachment?.description}</li>
            ))}
          </ul>
          {getText('steps.andre_utbetalinger.alertAttachments.uploadInfo')}
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
