import React, { useEffect, useMemo, useState } from 'react';
import { useTexts } from '../../hooks/useTexts';
import { BodyShort, Button, GuidePanel, Heading, Loader, PageHeader } from '@navikt/ds-react';
import * as tekster from './tekster';
import { Step, StepWizard } from '../../components/StepWizard';
import { getStepSchemas } from './schema';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  setStepList,
  completeAndGoToNextStep,
  useStepWizard,
  resetStepWizard,
  goToPreviousStep,
} from '../../context/stepWizardContextV2';
import SoknadStandard from '../../types/SoknadStandard';
import { FormErrorSummary } from '../../components/schema/FormErrorSummary';
import {
  useSoknadContext,
  hentSoknadState,
  SøknadType,
  slettLagretSoknadState,
  setSøknadData,
} from '../../context/soknadContext';
import { Veiledning } from './Veiledning';
import { hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { Behandlere } from './Behandlere';
import { Medlemskap } from './Medlemskap';
import { Yrkesskade } from './Yrkesskade';
import { AndreUtbetalinger } from './AndreUtbetalinger';
import { Barnetillegg } from './Barnetillegg';
import * as classes from './standard.module.css';
import Student from './Student';
import Oppsummering from './Oppsummering';
export enum StepNames {
  VEILEDNING = 'VEILEDNING',
  KONTAKTINFO = 'KONTAKTINFO',
  FASTLEGE = 'FASTLEGE',
  MEDLEMSKAP = 'MEDLEMSKAP',
  YRKESSKADE = 'YRKESSKADE',
  STUDENT = 'STUDENT',
  ANDRE_UTBETALINGER = 'ANDRE_UTBETALINGER',
  BARNETILLEGG = 'BARNETILLEGG',
  OPPSUMMERING = 'OPPSUMMERING',
}
const initFieldVals: SoknadStandard = {};
export const StandardPage = (): JSX.Element => {
  const [isLoading] = useState<boolean>(false);
  const [showVeiledning, setShowVeiledning] = useState<boolean>(true);
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { oppslagState, oppslagDispatch, søkerFulltNavn, fastlege } = useSokerOppslag();
  const { currentStep, currentStepIndex, stepWizardDispatch } = useStepWizard();
  const { getText } = useTexts(tekster);
  const StepSchemas = getStepSchemas(getText);
  const currentSchema = useMemo(() => {
    return StepSchemas[currentStepIndex];
  }, [currentStepIndex, StepSchemas]);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SoknadStandard>({
    resolver: yupResolver(currentSchema),
    defaultValues: { ...initFieldVals },
  });
  useEffect(() => {
    hentSokerOppslag(oppslagDispatch);
  }, []);
  useEffect(() => {
    const getSoknadState = async () => {
      const cachedState = await hentSoknadState(søknadDispatch, SøknadType.HOVED);
      if (cachedState?.lagretStepList) {
        setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      }
    };
    getSoknadState();
  }, []);
  // Reset form to hydrate with data from søknadstate
  useEffect(() => {
    reset({ ...søknadState.søknad });
  }, [currentStep, reset]);
  const showGuidePanel = useMemo(
    () => !!getText(`steps.${currentStep?.name?.toLowerCase()}.guide`),
    [currentStep, getText]
  );
  const myHandleSubmit: SubmitHandler<SoknadStandard> = async (data) => {
    console.log(data);
    setSøknadData(søknadDispatch, data);
    completeAndGoToNextStep(stepWizardDispatch);
  };
  const onDeleteSøknad = async () => {
    if (søknadState.type) {
      const deleteRes = await slettLagretSoknadState(søknadDispatch, søknadState.type);
      if (deleteRes) {
        resetStepWizard(stepWizardDispatch);
      } else {
        console.error('noe gikk galt med sletting av lagret søknad');
      }
    }
  };
  if (showVeiledning)
    return (
      <form
        onSubmit={handleSubmit(myHandleSubmit)}
        className={classes?.soknadForm}
        autoComplete="off"
      >
        <Veiledning
          getText={getText}
          errors={errors}
          control={control}
          søkerFulltNavn={søkerFulltNavn}
        />
        <Button variant="primary" type="submit" onClick={() => setShowVeiledning(false)}>
          <BodyShort>{getText(`steps.veiledning.buttonText`, 'buttontext')}</BodyShort>
        </Button>
      </form>
    );
  return (
    <>
      <PageHeader align="center">{getText('pagetitle')}</PageHeader>
      <StepWizard hideLabels={true}>
        <form
          onSubmit={handleSubmit(myHandleSubmit)}
          className={classes?.soknadForm}
          autoComplete="off"
        >
          {showGuidePanel && (
            <GuidePanel>
              <BodyShort>{getText(`steps.${currentStep?.name?.toLowerCase()}.guide`)}</BodyShort>
            </GuidePanel>
          )}
          <Heading size="large" level="2">
            {getText(`steps.${currentStep?.name.toLowerCase()}.title`)}
          </Heading>
          <FormErrorSummary errors={errors} />
          <Step order={1} name={StepNames.YRKESSKADE} label={'Yrkesskade'}>
            <Yrkesskade
              getText={getText}
              errors={errors}
              control={control}
              watch={watch}
              setValue={setValue}
            />
          </Step>
          <Step order={2} name={StepNames.MEDLEMSKAP} label={'Tilknytning til Norge'}>
            <Medlemskap
              getText={getText}
              errors={errors}
              control={control}
              watch={watch}
              setValue={setValue}
            />
          </Step>
          <Step order={3} name={StepNames.FASTLEGE} label={'Fastlege'}>
            <Behandlere getText={getText} fastlege={fastlege} control={control} />
          </Step>
          <Step order={4} name={StepNames.STUDENT} label={'Student'}>
            <Student getText={getText} errors={errors} control={control} setValue={setValue} />
          </Step>
          <Step order={5} name={StepNames.ANDRE_UTBETALINGER} label={'Andre utbetalinger'}>
            <AndreUtbetalinger
              getText={getText}
              errors={errors}
              control={control}
              setValue={setValue}
            />
          </Step>
          <Step order={6} name={StepNames.BARNETILLEGG} label={'Barnetilleggg'}>
            <Barnetillegg
              getText={getText}
              errors={errors}
              control={control}
              barneListe={oppslagState?.søker?.barn}
            />
          </Step>
          <Step order={7} name={StepNames.OPPSUMMERING} label={'Oppsummering'}>
            <Oppsummering getText={getText} errors={errors} control={control} />
          </Step>
          <div className={classes?.buttonWrapper}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => goToPreviousStep(stepWizardDispatch)}
            >
              {getText('backButtontext')}
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {!isLoading && (
                <BodyShort>
                  {getText(`${currentStep?.name.toLowerCase()}.buttontext`, 'buttontext')}
                </BodyShort>
              )}
              {isLoading && <Loader />}
            </Button>
          </div>
          <Button variant="tertiary" type="button" onClick={() => onDeleteSøknad()}>
            Avbryt
          </Button>
        </form>
      </StepWizard>
    </>
  );
};

export default StandardPage;
