'use client';
import { Soknad } from 'types/Soknad';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BodyShort, Heading, Label, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import { FerieType, FerieTypeToMessageKey, getStartDatoSchema } from './startDato.schema';
import ColorPanel from 'components/panel/ColorPanel';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import * as classes from './StartDato.module.css';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { validate } from 'lib/utils/validationUtils';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { useTranslations } from 'next-intl';
import TilDato from './TilDato';
import FraDato from './FraDato';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';
import { LucaGuidePanel } from 'components/LucaGuidePanel';

export { FerieType, FerieTypeToMessageKey } from './startDato.schema';

interface Props {
  onBackClick: () => void;
}

export { getStartDatoSchema } from './startDato.schema';

const StartDato = ({ onBackClick }: Props) => {
  const t = useTranslations();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const { stepWizardDispatch, stepList } = useStepWizard();

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const { søknadState, søknadDispatch } = useSoknad();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.sykepenger, søknadState.søknad?.ferie]);

  const FerieTypeTekster = useMemo(
    () => ({
      [FerieType.PERIODE]: t(FerieTypeToMessageKey(FerieType.PERIODE)),
      [FerieType.DAGER]: t(FerieTypeToMessageKey(FerieType.DAGER)),
    }),
    [t],
  );

  function clearErrors() {
    setErrors(undefined);
  }

  function findError(path: string): string | undefined {
    return errors?.find((error) => error.path === path)?.message;
  }
  return (
    <SoknadFormWrapperNew
      onNext={async () => {
        const errors = await validate(getStartDatoSchema(t), søknadState.søknad);
        if (errors) {
          setErrors(errors);
          setFocusOnErrorSummary();
          return;
        }

        completeAndGoToNextStep(stepWizardDispatch);
      }}
      onBack={() => {
        onBackClick();
      }}
      errors={errors}
    >
      <Heading size="large" level="2">
        {t('søknad.startDato.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort spacing>{t('søknad.startDato.guide.text1')}</BodyShort>
      </LucaGuidePanel>
      <RadioGroup
        legend={t('søknad.startDato.sykepenger.legend')}
        description={t('søknad.startDato.sykepenger.description')}
        name={'sykepenger'}
        id={'sykepenger'}
        value={søknadState?.søknad?.sykepenger || ''}
        onChange={(value) => {
          clearErrors();
          updateSøknadData(søknadDispatch, { sykepenger: value, ferie: undefined });
        }}
        error={findError('sykepenger')}
      >
        <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
        <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
      </RadioGroup>
      {søknadState?.søknad?.sykepenger === JaEllerNei.JA && (
        <ColorPanel color={'grey'}>
          <RadioGroup
            legend={t('søknad.startDato.skalHaFerie.label')}
            description={t('søknad.startDato.skalHaFerie.description')}
            name={'ferie.skalHaFerie'}
            id={'ferie.skalHaFerie'}
            value={søknadState?.søknad?.ferie?.skalHaFerie || ''}
            onChange={(value) => {
              clearErrors();
              updateSøknadData(søknadDispatch, {
                ferie: { skalHaFerie: value },
              });
            }}
            error={findError('ferie.skalHaFerie')}
          >
            <Radio value={JaEllerNei.JA}>{JaEllerNei.JA}</Radio>
            <Radio value={JaEllerNei.NEI}>{JaEllerNei.NEI}</Radio>
          </RadioGroup>
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.JA && (
            <RadioGroup
              legend={t('søknad.startDato.ferieType.label')}
              name={'ferie.ferieType'}
              id={'ferie.ferieType'}
              value={søknadState?.søknad?.ferie?.ferieType || ''}
              onChange={(value) => {
                clearErrors();
                updateSøknadData(søknadDispatch, {
                  ferie: {
                    skalHaFerie: søknadState?.søknad?.ferie?.skalHaFerie,
                    ferieType: value,
                  },
                });
              }}
              error={findError('ferie.ferieType')}
            >
              <Radio value={FerieType.PERIODE}>
                <BodyShort>{FerieTypeTekster.PERIODE}</BodyShort>
              </Radio>
              <Radio value={FerieType.DAGER}>
                <BodyShort>{FerieTypeTekster.DAGER}</BodyShort>
              </Radio>
            </RadioGroup>
          )}
          {søknadState?.søknad?.ferie?.ferieType === FerieType.PERIODE && (
            <div className={classes?.periodeContainer}>
              <Label>{t('søknad.startDato.periode.label')}</Label>
              <div className={classes?.datoContainer}>
                <FraDato
                  clearErrors={clearErrors}
                  errorMessage={findError('ferie.fraDato')}
                  defaultValues={søknadState}
                />
                <TilDato
                  clearErrors={clearErrors}
                  errorMessage={findError('ferie.tilDato')}
                  defaultValues={søknadState}
                />
              </div>
            </div>
          )}
          {søknadState?.søknad?.ferie?.ferieType === FerieType.DAGER && (
            <div className={classes?.antallDagerContainer}>
              <TextField
                className={classes?.antallDagerTekst}
                name={'ferie.antallDager'}
                id={'ferie.antallDager'}
                value={søknadState?.søknad?.ferie?.antallDager || ''}
                label={t('søknad.startDato.antallDager.label')}
                description={t('søknad.startDato.antallDager.description')}
                onChange={(value) => {
                  clearErrors();
                  updateSøknadData(søknadDispatch, {
                    ferie: {
                      skalHaFerie: søknadState?.søknad?.ferie?.skalHaFerie,
                      ferieType: søknadState?.søknad?.ferie?.ferieType,
                      antallDager: value.target.value,
                    },
                  });
                }}
                error={findError('ferie.antallDager')}
              />
            </div>
          )}
          {søknadState?.søknad?.ferie?.skalHaFerie === JaEllerNei.NEI && (
            <Alert variant={'info'}>{t('søknad.startDato.alert.text')}</Alert>
          )}
        </ColorPanel>
      )}
    </SoknadFormWrapperNew>
  );
};

export default StartDato;
