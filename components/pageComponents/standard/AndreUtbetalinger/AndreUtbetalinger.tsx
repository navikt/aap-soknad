import {
  Alert,
  BodyShort,
  Cell,
  Checkbox,
  CheckboxGroup,
  Grid,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
  TextField,
} from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { JaEllerNei } from 'types/Generic';
import { Soknad } from 'types/Soknad';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  slettLagretSoknadState,
  updateSøknadData,
} from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { IntlFormatters, useIntl } from 'react-intl';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { validate } from '../../../../lib/utils/validationUtils';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';

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
  LÅN = 'LÅN',
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
  LÅN = 'LÅN',
  NEI = 'NEI',
}

export interface AndreUtbetalingerFormFields {
  lønn?: string;
  stønad?: Array<StønadType>;
  afp?: {
    hvemBetaler?: string;
  };
}

const ANDRE_UTBETALINGER = 'andreUtbetalinger';
const LØNN = 'lønn';
const STØNAD = 'stønad';
const AFP = 'afp';
const HVEMBETALER = 'hvemBetaler';

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
    case StønadType.LÅN:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.lån`;
    case StønadType.NEI:
      return `søknad.${ANDRE_UTBETALINGER}.${STØNAD}.values.nei`;
  }
};
export const getAndreUtbetalingerSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    andreUtbetalinger: yup.object().shape({
      lønn: yup
        .string()
        .required(formatMessage({ id: 'søknad.andreUtbetalinger.lønn.validation.required' }))
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
        .nullable(),
      stønad: yup
        .array()
        .ensure()
        .min(1, formatMessage({ id: 'søknad.andreUtbetalinger.stønad.validation.required' })),
      afp: yup
        .object({
          hvemBetaler: yup.string().nullable(),
        })
        .when('stønad', ([stønad], schema) => {
          if (stønad?.includes(StønadType.AFP)) {
            return yup.object({
              hvemBetaler: yup.string().required(
                formatMessage({
                  id: 'søknad.andreUtbetalinger.hvemBetalerAfp.validation.required',
                })
              ),
            });
          }
          return schema;
        }),
    }),
  });

export const AndreUtbetalinger = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, currentStepIndex, stepWizardDispatch } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  // const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.andreUtbetalinger]);
  // const lønnEtterlønnEllerSluttpakke = useWatch({ control, name: `${ANDRE_UTBETALINGER}.${LØNN}` });
  // const stønadEllerVerv = useWatch({ control, name: `${ANDRE_UTBETALINGER}.${STØNAD}` });
  const StønadAlternativer = useMemo(
    () => ({
      [StønadType.ØKONOMISK_SOSIALHJELP]: formatMessage({
        id: stønadTypeToAlternativNøkkel(StønadType.ØKONOMISK_SOSIALHJELP),
      }),
      [StønadType.OMSORGSSTØNAD]: formatMessage({
        id: stønadTypeToAlternativNøkkel(StønadType.OMSORGSSTØNAD),
      }),
      [StønadType.INTRODUKSJONSSTØNAD]: formatMessage({
        id: stønadTypeToAlternativNøkkel(StønadType.INTRODUKSJONSSTØNAD),
      }),
      [StønadType.KVALIFISERINGSSTØNAD]: formatMessage({
        id: stønadTypeToAlternativNøkkel(StønadType.KVALIFISERINGSSTØNAD),
      }),
      [StønadType.VERV]: formatMessage({ id: stønadTypeToAlternativNøkkel(StønadType.VERV) }),
      [StønadType.UTLAND]: formatMessage({ id: stønadTypeToAlternativNøkkel(StønadType.UTLAND) }),
      [StønadType.AFP]: formatMessage({ id: stønadTypeToAlternativNøkkel(StønadType.AFP) }),
      [StønadType.STIPEND]: formatMessage({ id: stønadTypeToAlternativNøkkel(StønadType.STIPEND) }),
      [StønadType.LÅN]: formatMessage({ id: stønadTypeToAlternativNøkkel(StønadType.LÅN) }),
      [StønadType.NEI]: formatMessage({ id: stønadTypeToAlternativNøkkel(StønadType.NEI) }),
    }),
    [formatMessage]
  );
  const Attachments = useMemo(() => {
    let attachments: Array<{ type: string; description: string }> = [];

    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.OMSORGSSTØNAD)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.OMSORGSSTØNAD,
          description: formatMessage({ id: `søknad.andreUtbetalinger.vedlegg.omsorgsstønad` }),
        },
      ];
    }
    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.UTLAND)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.UTLANDSSTØNAD,
          description: formatMessage({ id: `søknad.andreUtbetalinger.vedlegg.utlandsStønad` }),
        },
      ];
    }
    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.STIPEND)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.SYKESTIPEND,
          description: formatMessage({ id: `søknad.andreUtbetalinger.vedlegg.sykeStipend` }),
        },
      ];
    }
    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.LÅN)) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.LÅN,
          description: formatMessage({ id: `søknad.andreUtbetalinger.vedlegg.lån` }),
        },
      ];
    }
    if (søknadState.søknad?.andreUtbetalinger?.lønn === JaEllerNei.JA) {
      attachments = [
        ...attachments,
        {
          type: AttachmentType.LØNN_OG_ANDRE_GODER,
          description: formatMessage({ id: `søknad.andreUtbetalinger.vedlegg.andreGoder` }),
        },
      ];
    }
    return attachments;
  }, [søknadState.søknad?.andreUtbetalinger?.stønad, søknadState.søknad?.andreUtbetalinger?.lønn]);
  useEffect(() => {
    // håndterer toggling av checkboxer (fjerner valg ved 'nei' og 'nei' ved andre valg)
    const lastChecked = søknadState.søknad?.andreUtbetalinger?.stønad?.slice(-1)?.[0];
    if (lastChecked === StønadType.NEI) {
      if ((søknadState.søknad?.andreUtbetalinger?.stønad?.length ?? 0) > 1) {
        updateSøknadData(søknadDispatch, {
          andreUtbetalinger: {
            ...søknadState.søknad?.andreUtbetalinger,
            stønad: [StønadType.NEI],
          },
        });
        // setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, [StønadType.NEI]);
      }
    } else if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.NEI)) {
      const newList = [...søknadState.søknad?.andreUtbetalinger?.stønad].filter(
        (e) => e !== StønadType.NEI
      );
      updateSøknadData(søknadDispatch, {
        andreUtbetalinger: {
          ...søknadState.søknad?.andreUtbetalinger,
          stønad: newList,
        },
      });
      // setValue(`${ANDRE_UTBETALINGER}.${STØNAD}`, newList);
    }
  }, [søknadState.søknad?.andreUtbetalinger?.stønad]);

  useEffect(() => {
    removeRequiredVedlegg(AttachmentType.OMSORGSSTØNAD, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.UTLANDSSTØNAD, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.SYKESTIPEND, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.LÅN, søknadDispatch);
    removeRequiredVedlegg(AttachmentType.LØNN_OG_ANDRE_GODER, søknadDispatch);
    addRequiredVedlegg(Attachments, søknadDispatch);
  }, [Attachments]);
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  return (
    <SoknadFormWrapperNew
      onNext={async (data) => {
        const errors = await validate(
          getAndreUtbetalingerSchema(formatMessage),
          søknadState.søknad?.andreUtbetalinger
        );
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }
        logSkjemastegFullførtEvent(currentStepIndex ?? 0);
        completeAndGoToNextStep(stepWizardDispatch);
      }}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
      nextButtonText={formatMessage({ id: 'navigation.next' })}
      backButtonText={formatMessage({ id: 'navigation.back' })}
      cancelButtonText={formatMessage({ id: 'navigation.cancel' })}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage({ id: `søknad.andreUtbetalinger.title` })}
      </Heading>
      <LucaGuidePanel>
        {formatMessage({ id: `søknad.andreUtbetalinger.guide.text` })}
      </LucaGuidePanel>
      <RadioGroup
        legend={formatMessage({ id: 'søknad.andreUtbetalinger.lønn.label' })}
        name={`${ANDRE_UTBETALINGER}.${LØNN}`}
        id={`${ANDRE_UTBETALINGER}.${LØNN}`}
        value={defaultValues?.søknad?.andreUtbetalinger?.lønn || ''}
        onChange={(value) => {
          setErrors(errors?.filter((error) => error.path != 'andreUtbetalinger.lønn'));
          updateSøknadData(søknadDispatch, {
            andreUtbetalinger: {
              ...søknadState.søknad?.andreUtbetalinger,
              lønn: value,
            },
          });
        }}
      >
        <ReadMore
          header={formatMessage({ id: 'søknad.andreUtbetalinger.lønn.readMore.title' })}
          type={'button'}
        >
          {formatMessage({ id: 'søknad.andreUtbetalinger.lønn.readMore.text' })}
        </ReadMore>
        <Radio value={JaEllerNei.JA}>
          <BodyShort>
            {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.JA}` })}
          </BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>
            {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.NEI}` })}
          </BodyShort>
        </Radio>
      </RadioGroup>
      <CheckboxGroup
        name={`${ANDRE_UTBETALINGER}.${STØNAD}`}
        id={`${ANDRE_UTBETALINGER}.${STØNAD}`}
        size="medium"
        legend={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.label' })}
        value={defaultValues?.søknad?.andreUtbetalinger?.stønad || []}
        onChange={(value) => {
          setErrors(errors?.filter((error) => error.path != 'andreUtbetalinger.stønad'));
          updateSøknadData(søknadDispatch, {
            andreUtbetalinger: {
              ...søknadState.søknad?.andreUtbetalinger,
              stønad: value,
            },
          });
        }}
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
        {søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.AFP) && (
          <ColorPanel color="grey">
            <Grid>
              <Cell xs={7}>
                <TextField
                  name={`${ANDRE_UTBETALINGER}.${AFP}.${HVEMBETALER}`}
                  label={formatMessage({ id: 'søknad.andreUtbetalinger.hvemBetalerAfp.label' })}
                />
              </Cell>
            </Grid>
          </ColorPanel>
        )}
        <Checkbox value={StønadType.LÅN}>{StønadAlternativer.LÅN}</Checkbox>
        <Checkbox value={StønadType.STIPEND}>{StønadAlternativer.STIPEND}</Checkbox>
        <Checkbox value={StønadType.NEI}>{StønadAlternativer.NEI}</Checkbox>
      </CheckboxGroup>
      {Attachments.length > 0 && (
        <Alert variant={'info'}>
          {formatMessage({ id: 'søknad.andreUtbetalinger.alert.leggeVedTekst' })}
          <ul>
            {Attachments.map((attachment, index) => (
              <li key={index}>{attachment?.description}</li>
            ))}
          </ul>
          {formatMessage({ id: 'søknad.andreUtbetalinger.alert.lasteOppVedleggTekst' })}
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
