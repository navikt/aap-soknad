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
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { FormattedMessage, IntlFormatters, useIntl } from 'react-intl';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  onBackClick: () => void;
}

export const getYrkesskadeSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    yrkesskade: yup
      .string()
      .required(formatMessage({ id: 'søknad.yrkesskade.harDuYrkesskade.validation.required' }))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });

export const Yrkesskade = ({ onBackClick }: Props) => {
  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknad();
  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.yrkesskade]);

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  return (
    <SoknadFormWrapperNew
      onNext={async () => {
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
        updateSøknadData(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage({ id: 'søknad.yrkesskade.title' })}
      </Heading>
      <LucaGuidePanel>
        <BodyLong>{formatMessage({ id: 'søknad.yrkesskade.guide.text' })}</BodyLong>
      </LucaGuidePanel>
      <RadioGroup
        name={'yrkesskade'}
        id={'yrkesskade'}
        legend={formatMessage({ id: `søknad.yrkesskade.harDuYrkesskade.label` })}
        value={søknadState?.søknad?.yrkesskade || ''}
        onChange={(value) => {
          setErrors(undefined);
          updateSøknadData(søknadDispatch, { yrkesskade: value });
        }}
        error={errors?.find((error) => error.path === 'yrkesskade')?.message}
      >
        <ReadMore
          header={formatMessage({ id: 'søknad.yrkesskade.harDuYrkesskade.readMore.title' })}
          type={'button'}
        >
          <div>
            <BodyShort spacing>
              {formatMessage({ id: 'søknad.yrkesskade.harDuYrkesskade.readMore.text1' })}
            </BodyShort>
            <BodyShort spacing>
              <FormattedMessage
                id={'søknad.yrkesskade.harDuYrkesskade.readMore.text2'}
                values={{
                  a: (chunks) => (
                    <Link
                      target="_blank"
                      href={formatMessage({ id: 'applinks.forskriftOmYrkessykdommer' })}
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
          {formatMessage({ id: 'søknad.yrkesskade.alert.navVilSjekke' })}
          <ul>
            <li>{formatMessage({ id: 'søknad.yrkesskade.alert.bulletPointGodkjent' })}</li>
            <li>{formatMessage({ id: 'søknad.yrkesskade.alert.bulletPointArbeidsevne' })}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
