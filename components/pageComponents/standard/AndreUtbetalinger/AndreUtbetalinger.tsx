import {
  Alert,
  BodyShort,
  Checkbox,
  CheckboxGroup,
  HGrid,
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
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import ColorPanel from 'components/panel/ColorPanel';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { IntlFormatters, useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { AttachmentType } from 'types/SoknadContext';

import {
  addRequiredVedlegg,
  removeRequiredVedlegg,
  updateSøknadData,
} from 'context/soknadcontext/actions';
import { useSoknad } from 'hooks/SoknadHook';
import { useStepWizard } from 'hooks/StepWizardHook';
import { LucaGuidePanel } from 'components/LucaGuidePanel';

interface Props {
  onBackClick: () => void;
}

type StønadAlternativer = {
  [key in StønadType]: string;
};

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

export const stønadTypeToAlternativNøkkel = (stønadType: StønadType) => {
  switch (stønadType) {
    case StønadType.ØKONOMISK_SOSIALHJELP:
      return 'søknad.andreUtbetalinger.stønad.values.økonomiskSosialhjelp';
    case StønadType.OMSORGSSTØNAD:
      return 'søknad.andreUtbetalinger.stønad.values.omsorgsstønad';
    case StønadType.INTRODUKSJONSSTØNAD:
      return 'søknad.andreUtbetalinger.stønad.values.introduksjonsStønad';
    case StønadType.KVALIFISERINGSSTØNAD:
      return 'søknad.andreUtbetalinger.stønad.values.kvalifiseringsstønad';
    case StønadType.VERV:
      return 'søknad.andreUtbetalinger.stønad.values.verv';
    case StønadType.UTLAND:
      return 'søknad.andreUtbetalinger.stønad.values.utland';
    case StønadType.AFP:
      return 'søknad.andreUtbetalinger.stønad.values.afp';
    case StønadType.STIPEND:
      return 'søknad.andreUtbetalinger.stønad.values.stipend';
    case StønadType.LÅN:
      return 'søknad.andreUtbetalinger.stønad.values.lån';
    case StønadType.NEI:
      return 'søknad.andreUtbetalinger.stønad.values.nei';
  }
};
export const getAndreUtbetalingerSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
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
              }),
            ),
          });
        }
        return schema;
      }),
  });

export const AndreUtbetalinger = ({ onBackClick }: Props) => {
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const { søknadState, søknadDispatch } = useSoknad();
  const { stepList, currentStepIndex, stepWizardDispatch } = useStepWizard();
  const { formatMessage } = useIntl();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.andreUtbetalinger]);

  const StønadAlternativer = useMemo(() => {
    const stønadTypes: StønadType[] = Object.keys(StønadType) as StønadType[];
    return stønadTypes.reduce((acc, stønadType) => {
      acc[stønadType] = formatMessage({
        id: stønadTypeToAlternativNøkkel(stønadType),
      });
      return acc;
    }, {} as StønadAlternativer);
  }, [formatMessage]);

  const attachments = useMemo(() => {
    function addAttachment(type: AttachmentType, id: string) {
      attachments.push({
        type,
        description: formatMessage({ id }),
      });
    }

    let attachments: Array<{ type: AttachmentType; description: string }> = [];

    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.OMSORGSSTØNAD)) {
      addAttachment('OMSORGSSTØNAD', 'søknad.andreUtbetalinger.vedlegg.omsorgsstønad');
    }
    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.UTLAND)) {
      addAttachment('UTLANDSSTØNAD', 'søknad.andreUtbetalinger.vedlegg.utlandsStønad');
    }
    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.STIPEND)) {
      addAttachment('SYKESTIPEND', 'søknad.andreUtbetalinger.vedlegg.sykeStipend');
    }
    if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.LÅN)) {
      addAttachment('LÅN', 'søknad.andreUtbetalinger.vedlegg.lån');
    }
    if (søknadState.søknad?.andreUtbetalinger?.lønn === JaEllerNei.JA) {
      addAttachment('LØNN_OG_ANDRE_GODER', 'søknad.andreUtbetalinger.vedlegg.andreGoder');
    }
    return attachments;
  }, [søknadState.søknad?.andreUtbetalinger?.stønad, søknadState.søknad?.andreUtbetalinger?.lønn]);

  useEffect(() => {
    const lastChecked = søknadState.søknad?.andreUtbetalinger?.stønad?.slice(-1)?.[0];
    if (lastChecked === StønadType.NEI) {
      if ((søknadState.søknad?.andreUtbetalinger?.stønad?.length ?? 0) > 1) {
        updateSøknadData(søknadDispatch, {
          andreUtbetalinger: {
            ...søknadState.søknad?.andreUtbetalinger,
            stønad: [StønadType.NEI],
          },
        });
      }
    } else if (søknadState.søknad?.andreUtbetalinger?.stønad?.includes(StønadType.NEI)) {
      const newList = [...søknadState.søknad?.andreUtbetalinger?.stønad].filter(
        (e) => e !== StønadType.NEI,
      );
      updateSøknadData(søknadDispatch, {
        andreUtbetalinger: {
          ...søknadState.søknad?.andreUtbetalinger,
          stønad: newList,
        },
      });
    }
  }, [søknadState.søknad?.andreUtbetalinger?.stønad]);

  useEffect(() => {
    removeRequiredVedlegg('OMSORGSSTØNAD', søknadDispatch);
    removeRequiredVedlegg('UTLANDSSTØNAD', søknadDispatch);
    removeRequiredVedlegg('SYKESTIPEND', søknadDispatch);
    removeRequiredVedlegg('LÅN', søknadDispatch);
    removeRequiredVedlegg('LØNN_OG_ANDRE_GODER', søknadDispatch);
    addRequiredVedlegg(attachments, søknadDispatch);
  }, [attachments]);

  return (
    <SoknadFormWrapperNew
      onNext={async () => {
        const errors = await validate(
          getAndreUtbetalingerSchema(formatMessage),
          søknadState.søknad?.andreUtbetalinger,
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
        onBackClick();
      }}
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
        name={'lønn'}
        id={'lønn'}
        value={søknadState?.søknad?.andreUtbetalinger?.lønn || ''}
        onChange={(value) => {
          setErrors(errors?.filter((error) => error.path != 'lønn'));
          updateSøknadData(søknadDispatch, {
            andreUtbetalinger: {
              ...søknadState.søknad?.andreUtbetalinger,
              lønn: value,
            },
          });
        }}
        error={errors?.find((e) => e.path === 'lønn')?.message}
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
        name={'stønad'}
        id={'stønad'}
        size="medium"
        legend={formatMessage({ id: 'søknad.andreUtbetalinger.stønad.label' })}
        value={søknadState?.søknad?.andreUtbetalinger?.stønad || []}
        onChange={(value) => {
          setErrors(errors?.filter((error) => error.path != 'stønad'));
          const afpErValgt = value.includes(StønadType.AFP);
          updateSøknadData(søknadDispatch, {
            andreUtbetalinger: {
              ...søknadState.søknad?.andreUtbetalinger,
              stønad: value,
              afp: {
                hvemBetaler: afpErValgt
                  ? søknadState.søknad?.andreUtbetalinger?.afp?.hvemBetaler
                  : undefined,
              },
            },
          });
        }}
        error={errors?.find((e) => e.path === 'stønad')?.message}
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
            <HGrid columns={{ xs: 1, md: 2 }}>
              <TextField
                name={'afp.hvemBetaler'}
                id={'afp.hvemBetaler'}
                onChange={(e) =>
                  updateSøknadData(søknadDispatch, {
                    andreUtbetalinger: {
                      ...søknadState.søknad?.andreUtbetalinger,
                      afp: {
                        hvemBetaler: e.target.value,
                      },
                    },
                  })
                }
                label={formatMessage({ id: 'søknad.andreUtbetalinger.hvemBetalerAfp.label' })}
                error={errors?.find((e) => e.path === 'afp.hvemBetaler')?.message}
              />
            </HGrid>
          </ColorPanel>
        )}
        <Checkbox value={StønadType.LÅN}>{StønadAlternativer.LÅN}</Checkbox>
        <Checkbox value={StønadType.STIPEND}>{StønadAlternativer.STIPEND}</Checkbox>
        <Checkbox value={StønadType.NEI}>{StønadAlternativer.NEI}</Checkbox>
      </CheckboxGroup>
      {attachments.length > 0 && (
        <Alert variant={'info'}>
          {formatMessage({ id: 'søknad.andreUtbetalinger.alert.leggeVedTekst' })}
          <ul>
            {attachments.map((attachment, index) => (
              <li key={index}>{attachment?.description}</li>
            ))}
          </ul>
          {formatMessage({ id: 'søknad.andreUtbetalinger.alert.lasteOppVedleggTekst' })}
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
