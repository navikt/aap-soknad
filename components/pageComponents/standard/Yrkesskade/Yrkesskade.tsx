import React, { useEffect, useState } from 'react';
import {
  Alert,
  BodyLong,
  BodyShort,
  Heading,
  Link,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react';
import { Soknad } from 'types/Soknad';
import { JaEllerNei } from 'types/Generic';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';
import { setFocusOnErrorSummary } from '../../../schema/FormErrorSummary';
import { validate } from '../../../../lib/utils/validationUtils';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';

interface Props {
  onBackClick: () => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export const getYrkesskadeSchema = (formatMessage: (id: string) => string) =>
  yup.object().shape({
    yrkesskade: yup
      .string()
      .required(formatMessage('søknad.yrkesskade.harDuYrkesskade.validation.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });

export const Yrkesskade = ({ onBackClick, defaultValues }: Props) => {
  const { formatMessage, FormatElement } = useFeatureToggleIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.yrkesskade]);

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  return (
    <SoknadFormWrapperNew
      onNext={async (data) => {
        const errors = await validate(getYrkesskadeSchema(formatMessage), søknadState.søknad);
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
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.yrkesskade.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyLong>{formatMessage('søknad.yrkesskade.guide.text')}</BodyLong>
      </LucaGuidePanel>
      <RadioGroup
        name={'yrkesskade'}
        legend={formatMessage(`søknad.yrkesskade.harDuYrkesskade.label`)}
        value={defaultValues?.søknad?.yrkesskade || ''}
        onChange={(value) => {
          setErrors(undefined);
          updateSøknadData(søknadDispatch, { yrkesskade: value });
        }}
        error={errors?.find((error) => error.path === 'yrkesskade')?.message}
      >
        <ReadMore
          header={formatMessage('søknad.yrkesskade.harDuYrkesskade.readMore.title')}
          type={'button'}
        >
          <div>
            <BodyShort spacing>
              {formatMessage('søknad.yrkesskade.harDuYrkesskade.readMore.text1')}
            </BodyShort>
            <BodyShort spacing>
              <FormatElement
                id={'søknad.yrkesskade.harDuYrkesskade.readMore.text2'}
                values={{
                  a: (chunks: string[]) => (
                    <Link
                      target="_blank"
                      href={formatMessage('applinks.forskriftOmYrkessykdommer')}
                    >
                      {chunks}
                    </Link>
                  ),
                }}
              />
            </BodyShort>
          </div>
        </ReadMore>
        <Radio value={JaEllerNei.JA}>
          <BodyShort>{JaEllerNei.JA}</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>{JaEllerNei.NEI}</BodyShort>
        </Radio>
      </RadioGroup>
      {søknadState.søknad?.yrkesskade === JaEllerNei.JA && (
        <Alert variant={'info'}>
          {formatMessage('søknad.yrkesskade.alert.navVilSjekke')}
          <ul>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointGodkjent')}</li>
            <li>{formatMessage('søknad.yrkesskade.alert.bulletPointArbeidsevne')}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
