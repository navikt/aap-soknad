'use client';
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
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { useTranslations } from 'next-intl';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';
import { LucaGuidePanel } from 'components/LucaGuidePanel';

interface Props {
  onBackClick: () => void;
}

import { getYrkesskadeSchema } from './yrkesskade.schema';
export { getYrkesskadeSchema } from './yrkesskade.schema';

export const Yrkesskade = ({ onBackClick }: Props) => {
  const t = useTranslations();

  const { søknadState, søknadDispatch } = useSoknad();
  const { stepWizardDispatch, stepList } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.yrkesskade]);

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  return (
    <SoknadFormWrapperNew
      onNext={async () => {
        const errors = await validate(getYrkesskadeSchema(t), søknadState.søknad);
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }

        completeAndGoToNextStep(stepWizardDispatch);
      }}
      onBack={() => {
        updateSøknadData(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
      errors={errors}
    >
      <Heading size="large" level="2">
        {t('søknad.yrkesskade.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyLong>{t('søknad.yrkesskade.guide.text')}</BodyLong>
      </LucaGuidePanel>
      <RadioGroup
        name={'yrkesskade'}
        id={'yrkesskade'}
        legend={t(`søknad.yrkesskade.harDuYrkesskade.label`)}
        value={søknadState?.søknad?.yrkesskade || ''}
        onChange={(value) => {
          setErrors(undefined);
          updateSøknadData(søknadDispatch, { yrkesskade: value });
        }}
        error={errors?.find((error) => error.path === 'yrkesskade')?.message}
      >
        <ReadMore
          header={t('søknad.yrkesskade.harDuYrkesskade.readMore.title')}
          type={'button'}
        >
          <div>
            <BodyShort spacing>
              {t('søknad.yrkesskade.harDuYrkesskade.readMore.text1')}
            </BodyShort>
            <BodyShort spacing>
              {t.rich('søknad.yrkesskade.harDuYrkesskade.readMore.text2', {
                  a: (chunks) => (
                    <Link
                      target="_blank"
                      href={t('applinks.forskriftOmYrkessykdommer')}
                    >
                      {chunks}
                    </Link>
                  ),
                })}
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
          {t('søknad.yrkesskade.alert.navVilSjekke')}
          <ul>
            <li>{t('søknad.yrkesskade.alert.bulletPointGodkjent')}</li>
            <li>{t('søknad.yrkesskade.alert.bulletPointArbeidsevne')}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapperNew>
  );
};
