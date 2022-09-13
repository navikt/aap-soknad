import { Alert, BodyShort, Cell, Checkbox, Grid, Heading, Radio, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useMemo } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import CheckboxGroupWrapper from 'components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from 'types/Generic';
import { Soknad } from 'types/Soknad';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  slettLagretSoknadState,
  updateSøknadData,
} from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
export enum AttachmentType {
  LØNN_OG_ANDRE_GODER = 'LØNN_OG_ANDRE_GODER',
  OMSORGSSTØNAD = 'OMSORGSSTØNAD',
  UTLANDSSTØNAD = 'UTLANDSSTØNAD',
  AVBRUTT_STUDIE = 'avbruttStudie',
  SYKESTIPEND = 'SYKESTIPEND',
  ANNET = 'ANNET',
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

export const stønadTypeToAlternativNøkkel = (stønadType: StønadType) => {
  switch (stønadType) {
    case StønadType.ØKONOMISK_SOSIALHJELP:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.økonomiskSosialhjelp`;
    case StønadType.OMSORGSSTØNAD:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.omsorgsstønad`;
    case StønadType.INTRODUKSJONSSTØNAD:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.introduksjonsStønad`;
    case StønadType.KVALIFISERINGSSTØNAD:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.kvalifiseringsstønad`;
    case StønadType.VERV:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.verv`;
    case StønadType.UTLAND:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.utland`;
    case StønadType.AFP:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.afp`;
    case StønadType.STIPEND:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.stipend`;
    case StønadType.NEI:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.nei`;
  }
};
export const AndreUtbetalinger = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    [ANDRE_UTBETALINGER]: yup.object().shape({
      [LØNN]: yup
        .string()
        .required(formatMessage('søknad.andreUtbetalinger.lønn.validation.required'))
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
        .nullable(),
      [STØNAD]: yup
        .array()
        .min(1, formatMessage('søknad.andreUtbetalinger.stønad.validation.required')),
    }),
  });
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [ANDRE_UTBETALINGER]: defaultValues?.søknad?.andreUtbetalinger,
    },
  });

  const debouncedLagre = useDebounceLagreSoknad<Soknad>(søknadDispatch);
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const lønnEtterlønnEllerSluttpakke = watch(`${ANDRE_UTBETALINGER}.${LØNN}`);
  const stønadEllerVerv = watch(`${ANDRE_UTBETALINGER}.${STØNAD}`);
  const StønadAlternativer = useMemo(
    () => ({
      [StønadType.ØKONOMISK_SOSIALHJELP]: formatMessage(
        stønadTypeToAlternativNøkkel(StønadType.ØKONOMISK_SOSIALHJELP)
      ),
      [StønadType.OMSORGSSTØNAD]: formatMessage(
        stønadTypeToAlternativNøkkel(StønadType.OMSORGSSTØNAD)
      ),
      [StønadType.INTRODUKSJONSSTØNAD]: formatMessage(
        stønadTypeToAlternativNøkkel(StønadType.INTRODUKSJONSSTØNAD)
      ),
      [StønadType.KVALIFISERINGSSTØNAD]: formatMessage(
        stønadTypeToAlternativNøkkel(StønadType.KVALIFISERINGSSTØNAD)
      ),
      [StønadType.VERV]: formatMessage(stønadTypeToAlternativNøkkel(StønadType.VERV)),
      [StønadType.UTLAND]: formatMessage(stønadTypeToAlternativNøkkel(StønadType.UTLAND)),
      [StønadType.AFP]: formatMessage(stønadTypeToAlternativNøkkel(StønadType.AFP)),
      [StønadType.STIPEND]: formatMessage(stønadTypeToAlternativNøkkel(StønadType.STIPEND)),
      [StønadType.NEI]: formatMessage(stønadTypeToAlternativNøkkel(StønadType.NEI)),
    }),
    [formatMessage]
  );
  const Attachments = useMemo(() => {
    let attachments: Array<{ type: string; description: string }> = [];

    if (stønadEllerVerv?.includes(StønadType.OMSORGSSTØNAD)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.OMSORGSSTØNAD,
          description: formatMessage(`søknad.andreUtbetalinger.vedlegg.omsorgsstønad`),
        },
      ];
    }
    if (stønadEllerVerv?.includes(StønadType.UTLAND)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.UTLANDSSTØNAD,
          description: formatMessage(`søknad.andreUtbetalinger.vedlegg.utlandsStønad`),
        },
      ];
    }
    if (stønadEllerVerv?.includes(StønadType.STIPEND)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.SYKESTIPEND,
          description: formatMessage(`søknad.andreUtbetalinger.vedlegg.sykeStipend`),
        },
      ];
    }
    if (lønnEtterlønnEllerSluttpakke === JaEllerNei.JA) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.LØNN_OG_ANDRE_GODER,
          description: formatMessage(`søknad.andreUtbetalinger.vedlegg.andreGoder`),
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
    removeRequiredVedlegg(AttachmentType.OMSORGSSTØNAD, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.UTLANDSSTØNAD, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.SYKESTIPEND, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.LØNN_OG_ANDRE_GODER, søknadDispatch);
    addRequiredVedlegg(Attachments, søknadDispatch);
  }, [Attachments]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
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
        {formatMessage(`søknad.andreUtbetalinger.title`)}
      </Heading>
      <LucaGuidePanel>{formatMessage(`søknad.andreUtbetalinger.guide.text`)}</LucaGuidePanel>
      <RadioGroupWrapper
        legend={formatMessage('søknad.andreUtbetalinger.lønn.label')}
        name={`${ANDRE_UTBETALINGER}.${LØNN}`}
        control={control}
        error={errors?.[ANDRE_UTBETALINGER]?.[LØNN]?.message}
      >
        <ReadMore
          header={formatMessage('søknad.andreUtbetalinger.lønn.readMore.title')}
          type={'button'}
        >
          {formatMessage('søknad.andreUtbetalinger.lønn.readMore.text')}
        </ReadMore>
        <Radio value={JaEllerNei.JA}>
          <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.JA}`)}</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.NEI}`)}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      <CheckboxGroupWrapper
        name={`${ANDRE_UTBETALINGER}.${STØNAD}`}
        control={control}
        size="medium"
        legend={formatMessage('søknad.andreUtbetalinger.stønad.label')}
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
                  label={formatMessage('søknad.andreUtbetalinger.hvemBetalerAfp.label')}
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
          {formatMessage('søknad.andreUtbetalinger.alert.leggeVedTekst')}
          <ul>
            {Attachments.map((attachment, index) => (
              <li key={index}>{attachment?.description}</li>
            ))}
          </ul>
          {formatMessage('søknad.andreUtbetalinger.alert.lasteOppVedleggTekst')}
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
