import { useForm, useWatch } from 'react-hook-form';
import React, { useEffect } from 'react';
import { Alert, BodyLong, BodyShort, Heading, Link, Radio, ReadMore } from '@navikt/ds-react';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { Soknad } from 'types/Soknad';
import { JaEllerNei } from 'types/Generic';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { FormattedMessage, IntlFormatters, useIntl } from 'react-intl';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
const YRKESSKADE = 'yrkesskade';

export const getYrkesskadeSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    [YRKESSKADE]: yup
      .string()
      .required(formatMessage({ id: 'søknad.yrkesskade.harDuYrkesskade.validation.required' }))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });

export const Yrkesskade = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getYrkesskadeSchema(formatMessage)),
    defaultValues: {
      [YRKESSKADE]: defaultValues?.søknad?.yrkesskade,
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const harSkadeEllerSykdom = useWatch({ control, name: `${YRKESSKADE}` });
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onNext(data);
      }, setFocusOnErrorSummary)}
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
        {formatMessage({ id: 'søknad.yrkesskade.title' })}
      </Heading>
      <LucaGuidePanel>
        <BodyLong>{formatMessage({ id: 'søknad.yrkesskade.guide.text' })}</BodyLong>
      </LucaGuidePanel>
      <RadioGroupWrapper
        name={`${YRKESSKADE}`}
        legend={formatMessage({ id: `søknad.yrkesskade.harDuYrkesskade.label` })}
        control={control}
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
      </RadioGroupWrapper>
      {harSkadeEllerSykdom && harSkadeEllerSykdom !== JaEllerNei.NEI && (
        <Alert variant={'info'}>
          {formatMessage({ id: 'søknad.yrkesskade.alert.navVilSjekke' })}
          <ul>
            <li>{formatMessage({ id: 'søknad.yrkesskade.alert.bulletPointGodkjent' })}</li>
            <li>{formatMessage({ id: 'søknad.yrkesskade.alert.bulletPointArbeidsevne' })}</li>
          </ul>
        </Alert>
      )}
    </SoknadFormWrapper>
  );
};
