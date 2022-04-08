import { Alert, BodyLong, BodyShort, Checkbox, GuidePanel, Heading, Radio } from '@navikt/ds-react';
import React, { useEffect, useMemo } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { Control, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form';
import CheckboxGroupWrapper from '../../../components/input/CheckboxGroupWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import SoknadStandard from '../../../types/SoknadStandard';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import ColorPanel from '../../../components/panel/ColorPanel';
import CountrySelector from '../../../components/input/CountrySelector';
import { useVedleggContext, addRequiredVedlegg } from '../../../context/vedleggContext';

interface AndreUtbetalingerProps {
  watch: UseFormWatch<FieldValues>;
  setValue: any;
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
}
const ANDRE_UTBETALINGER = 'andreUtbetalinger';
const LØNN = 'lønn';
const STØNAD = 'stønad';
const STØNAD_SOSIAL = 'sosialStønad';

export const AndreUtbetalinger = ({
  getText,
  errors,
  control,
  setValue,
  watch,
}: AndreUtbetalingerProps) => {
  const { vedleggDispatch } = useVedleggContext();
  const lønnEtterlønnEllerSluttpakke = watch(`${ANDRE_UTBETALINGER}.${LØNN}.value`);
  const stønadEllerVerv = watch(`${ANDRE_UTBETALINGER}.${STØNAD}.value`);
  const LønnsAlternativer = useMemo(
    () => ({
      JA: getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.ja`),
      NEI: getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.nei`),
      VET_IKKE: getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.vetikke`),
    }),
    [getText]
  );
  const SosialStønadAlternativer = useMemo(
    () => ({
      KVALIFISERINGSSTØNAD: getText(
        `form.${ANDRE_UTBETALINGER}.${STØNAD_SOSIAL}.kvalifiseringsstønad`
      ),
      ØKONOMISK_SOSIALHJELP: getText(
        `form.${ANDRE_UTBETALINGER}.${STØNAD_SOSIAL}.økonomiskSosialhjelp`
      ),
      INTRODUKSJONSSTØNAD: getText(
        `form.${ANDRE_UTBETALINGER}.${STØNAD_SOSIAL}.introduksjonsStønad`
      ),
      NEI: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD_SOSIAL}.nei`),
    }),
    [getText]
  );
  const StønadAlternativer = useMemo(
    () => ({
      OMSORGSSTØNAD: getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.omsorgsstønad`),
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
  const UtbetalingsType = useMemo(
    () => ({
      ENGANGSBELØP: getText(`form.${ANDRE_UTBETALINGER}.utbetalingstype.engangsbeløp`),
      LØPENDE: getText(`form.${ANDRE_UTBETALINGER}.utbetalingstype.løpende`),
    }),
    [getText]
  );
  const AlertInfo = useMemo(() => {
    let infoList: Array<string> = [];
    if (stønadEllerVerv?.includes(StønadAlternativer.OMSORGSSTØNAD)) {
      infoList = [...infoList, getText(`steps.andre_utbetalinger.alertInfo.omsorgsstønad`)];
    }
    if (stønadEllerVerv?.includes(StønadAlternativer.VERV)) {
      infoList = [...infoList, getText(`steps.andre_utbetalinger.alertInfo.verv`)];
    }
    return infoList;
  }, [stønadEllerVerv]);
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
    if (lønnEtterlønnEllerSluttpakke === LønnsAlternativer.JA) {
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
    setValue(
      `${ANDRE_UTBETALINGER}.${STØNAD}.label`,
      getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.legend`)
    );
    setValue(
      `${ANDRE_UTBETALINGER}.${LØNN}.label`,
      getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.legend`)
    );
  }, [getText]);
  useEffect(() => {
    addRequiredVedlegg(Attachments, vedleggDispatch);
  }, [Attachments]);
  return (
    <>
      <GuidePanel>
        <BodyLong>{getText(`steps.andre_utbetalinger.guide`)}</BodyLong>
      </GuidePanel>
      <Heading size="large" level="2">
        {getText(`steps.andre_utbetalinger.title`)}
      </Heading>
      <CheckboxGroupWrapper
        name={`${ANDRE_UTBETALINGER}.${STØNAD_SOSIAL}.value`}
        control={control}
        size="medium"
        legend={getText(`form.${ANDRE_UTBETALINGER}.${STØNAD_SOSIAL}.legend`)}
        error={errors?.[ANDRE_UTBETALINGER]?.[STØNAD_SOSIAL]?.message}
      >
        <Checkbox value={SosialStønadAlternativer.KVALIFISERINGSSTØNAD}>
          {SosialStønadAlternativer.KVALIFISERINGSSTØNAD}
        </Checkbox>
        <Checkbox value={SosialStønadAlternativer.ØKONOMISK_SOSIALHJELP}>
          {SosialStønadAlternativer.ØKONOMISK_SOSIALHJELP}
        </Checkbox>
        <Checkbox value={SosialStønadAlternativer.INTRODUKSJONSSTØNAD}>
          {SosialStønadAlternativer.INTRODUKSJONSSTØNAD}
        </Checkbox>
        <Checkbox value={SosialStønadAlternativer.NEI}>{SosialStønadAlternativer.NEI}</Checkbox>
      </CheckboxGroupWrapper>
      <RadioGroupWrapper
        legend={getText(`form.${ANDRE_UTBETALINGER}.${LØNN}.legend`)}
        name={`${ANDRE_UTBETALINGER}.${LØNN}.value`}
        control={control}
        error={errors?.[ANDRE_UTBETALINGER]?.[LØNN]?.message}
      >
        <Radio value={LønnsAlternativer.JA}>
          <BodyShort>{LønnsAlternativer.JA}</BodyShort>
        </Radio>
        <Radio value={LønnsAlternativer.NEI}>
          <BodyShort>{LønnsAlternativer.NEI}</BodyShort>
        </Radio>
        <Radio value={LønnsAlternativer.VET_IKKE}>
          <BodyShort>{LønnsAlternativer.VET_IKKE}</BodyShort>
        </Radio>
      </RadioGroupWrapper>
      {lønnEtterlønnEllerSluttpakke === LønnsAlternativer.JA && (
        <ColorPanel>
          <RadioGroupWrapper
            legend={getText('form.andreUtbetalinger.utbetalingstype.legend')}
            name={`${ANDRE_UTBETALINGER}.utbetaling.utbetalingsType.value`}
            control={control}
            error={errors?.[ANDRE_UTBETALINGER]?.message}
          >
            <Radio value={UtbetalingsType.ENGANGSBELØP}>{UtbetalingsType.ENGANGSBELØP}</Radio>
            <Radio value={UtbetalingsType.LØPENDE}>{UtbetalingsType.LØPENDE}</Radio>
          </RadioGroupWrapper>
        </ColorPanel>
      )}
      <CheckboxGroupWrapper
        name={`${ANDRE_UTBETALINGER}.${STØNAD}.value`}
        control={control}
        size="medium"
        legend={getText(`form.${ANDRE_UTBETALINGER}.${STØNAD}.legend`)}
        error={errors?.[ANDRE_UTBETALINGER]?.[STØNAD]?.message}
      >
        <Checkbox value={StønadAlternativer.OMSORGSSTØNAD}>
          {StønadAlternativer.OMSORGSSTØNAD}
        </Checkbox>
        <Checkbox value={StønadAlternativer.FOSTERHJEMSGODTGJØRELSE}>
          {StønadAlternativer.FOSTERHJEMSGODTGJØRELSE}
        </Checkbox>
        <Checkbox value={StønadAlternativer.VERV}>{StønadAlternativer.VERV}</Checkbox>
        <Checkbox value={StønadAlternativer.UTLAND}>{StønadAlternativer.UTLAND}</Checkbox>
        {stønadEllerVerv?.includes(StønadAlternativer.UTLAND) && (
          <ColorPanel>
            <TextFieldWrapper
              name={`${ANDRE_UTBETALINGER}.utenlandsTrygd.ytelse.value`}
              label={getText('form.andreUtbetalinger.utenlandsTrygd.ytelse.label')}
              control={control}
            />
            <CountrySelector
              name={`${ANDRE_UTBETALINGER}.utenlandsTrygd.land.value`}
              label={getText('form.andreUtbetalinger.utenlandsTrygd.land.label')}
              control={control}
            />
          </ColorPanel>
        )}
        <Checkbox value={StønadAlternativer.ANNET}>{StønadAlternativer.ANNET}</Checkbox>
        {stønadEllerVerv?.includes(StønadAlternativer.ANNET) && (
          <ColorPanel>
            <TextFieldWrapper
              name={`${ANDRE_UTBETALINGER}.annet.utbetalingsNavn.value`}
              label={getText('form.andreUtbetalinger.annet.utbetaling.label')}
              control={control}
            />
            <TextFieldWrapper
              name={`${ANDRE_UTBETALINGER}.annet.utbetalerNavn.value`}
              label={getText('form.andreUtbetalinger.annet.utbetaler.label')}
              control={control}
            />
          </ColorPanel>
        )}
        <Checkbox value={StønadAlternativer.NEI}>{StønadAlternativer.NEI}</Checkbox>
      </CheckboxGroupWrapper>
      {Attachments.length > 0 && AlertInfo.length > 0 && (
        <Alert variant={'info'}>
          <BodyShort>{getText('form.andreUtbetalinger.alertInfo.attachmentTitle')}</BodyShort>
          <ul>
            {Attachments.map((attachment) => (
              <li>{attachment?.description}</li>
            ))}
          </ul>
          {AlertInfo.map((info) => (
            <BodyLong>{info}</BodyLong>
          ))}
        </Alert>
      )}
    </>
  );
};
