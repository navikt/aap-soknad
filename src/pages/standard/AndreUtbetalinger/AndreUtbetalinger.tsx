import {
  Alert,
  BodyShort,
  Cell,
  Checkbox,
  Grid,
  GuidePanel,
  Heading,
  Radio,
  ReadMore,
} from '@navikt/ds-react';
import React, { useEffect, useMemo } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import CheckboxGroupWrapper from '../../../components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import {
  useVedleggContext,
  addRequiredVedlegg,
  removeRequiredVedlegg,
} from '../../../context/vedleggContext';
import { JaEllerNei } from '../../../types/Generic';
import Soknad from '../../../types/Soknad';
import * as yup from 'yup';
import { setSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
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
      FOSTERHJEMSGODTGJØRELSE: getText(
        `form.${ANDRE_UTBETALINGER}.${STØNAD}.fosterhjemsgodtgjørelse`
      ),
      VERV: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.verv`),
      UTLAND: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.utland`),
      ANNET: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.annet`),
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
          type: 'omsorgsstønad',
          description: getText(`steps.andre_utbetalinger.alertAttachments.omsorgsstønad`),
        },
      ];
    }
    if (stønadEllerVerv?.includes(StønadAlternativer.FOSTERHJEMSGODTGJØRELSE)) {
      attachments = [
        ...attachments,
        {
          type: 'fosterhjemsgodtgjørelse',
          description: getText(`steps.andre_utbetalinger.alertAttachments.fosterhjemsgodtgjørelse`),
        },
      ];
    }
    if (stønadEllerVerv?.includes(StønadAlternativer.UTLAND)) {
      attachments = [
        ...attachments,
        {
          type: 'utlandsStønad',
          description: getText(`steps.andre_utbetalinger.alertAttachments.utlandsStønad`),
        },
      ];
    }
    if (lønnEtterlønnEllerSluttpakke === JaEllerNei.JA) {
      attachments = [
        ...attachments,
        {
          type: 'andreGoder',
          description: getText(`steps.andre_utbetalinger.alertAttachments.andreGoder`),
        },
      ];
    }
    return attachments;
  }, [stønadEllerVerv, lønnEtterlønnEllerSluttpakke]);
  useEffect(() => {
    if (stønadEllerVerv?.length > 1 && stønadEllerVerv?.includes(StønadAlternativer.NEI)) {
      setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, [StønadAlternativer.NEI]);
    }
  }, [stønadEllerVerv]);
  useEffect(() => {
    removeRequiredVedlegg('omsorgsstønad', vedleggDispatch);
    removeRequiredVedlegg('fosterhjemsgodtgjørelse', vedleggDispatch);
    removeRequiredVedlegg('utlandsStønad', vedleggDispatch);
    removeRequiredVedlegg('andreGoder', vedleggDispatch);
    addRequiredVedlegg(Attachments, vedleggDispatch);
  }, [Attachments]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        setSøknadData(søknadDispatch, data);
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
        <Checkbox value={StønadAlternativer.FOSTERHJEMSGODTGJØRELSE}>
          {StønadAlternativer.FOSTERHJEMSGODTGJØRELSE}
        </Checkbox>
        <Checkbox value={StønadAlternativer.VERV}>{StønadAlternativer.VERV}</Checkbox>
        <Checkbox value={StønadAlternativer.UTLAND}>{StønadAlternativer.UTLAND}</Checkbox>
        <Checkbox value={StønadAlternativer.ANNET}>{StønadAlternativer.ANNET}</Checkbox>
        {stønadEllerVerv?.includes(StønadAlternativer.ANNET) && (
          <ColorPanel>
            <Grid>
              <Cell xs={7}>
                <TextFieldWrapper
                  name={`${ANDRE_UTBETALINGER}.annet.utbetalingsNavn`}
                  label={getText('form.andreUtbetalinger.annet.utbetaling.label')}
                  control={control}
                />
              </Cell>
            </Grid>
            <Grid>
              <Cell xs={7}>
                <TextFieldWrapper
                  name={`${ANDRE_UTBETALINGER}.annet.utbetalerNavn`}
                  label={getText('form.andreUtbetalinger.annet.utbetaler.label')}
                  control={control}
                />
              </Cell>
            </Grid>
          </ColorPanel>
        )}
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
