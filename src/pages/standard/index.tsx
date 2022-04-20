import React, { useEffect, useMemo, useState } from 'react';
import { useTexts } from '../../hooks/useTexts';
import { PageHeader } from '@navikt/ds-react';
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
import Soknad from '../../types/Soknad';
import { FormErrorSummary } from '../../components/schema/FormErrorSummary';
import {
  useSoknadContext,
  hentSoknadState,
  SøknadType,
  slettLagretSoknadState,
  setSøknadData,
  addBarnIfMissing,
} from '../../context/soknadContext';
import { Veiledning } from './Veiledning/Veiledning';
import { hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { Behandlere } from './Behandlere/Behandlere';
import { Medlemskap } from './Medlemskap/Medlemskap';
import { Yrkesskade } from './Yrkesskade/Yrkesskade';
import { AndreUtbetalinger } from './AndreUtbetalinger/AndreUtbetalinger';
import { Barnetillegg } from './Barnetillegg/Barnetillegg';
import Oppsummering from './Oppsummering/Oppsummering';
import Tilleggsopplysninger from './Tilleggsopplysninger';
import Vedlegg from '../Vedlegg/Vedlegg';
import StartDato from './StartDato/StartDato';
import Student from './Student';
import Kvittering from './Kvittering/Kvittering';
import { fetchPOST } from '../../api/fetch';
export enum StepNames {
  VEILEDNING = 'VEILEDNING',
  KONTAKTINFO = 'KONTAKTINFO',
  STARTDATO = 'STARTDATO',
  FASTLEGE = 'FASTLEGE',
  MEDLEMSKAP = 'MEDLEMSKAP',
  YRKESSKADE = 'YRKESSKADE',
  STUDENT = 'STUDENT',
  ANDRE_UTBETALINGER = 'ANDRE_UTBETALINGER',
  BARNETILLEGG = 'BARNETILLEGG',
  VEDLEGG = 'VEDLEGG',
  TILLEGGSOPPLYSNINGER = 'TILLEGGSOPPLYSNINGER',
  OPPSUMMERING = 'OPPSUMMERING',
  KVITTERING = 'KVITTERING',
}
const initFieldVals: Soknad = {};
export const StandardPage = (): JSX.Element => {
  const [setIsLoading] = useState<boolean>(false);
  const [oppslagLoading, setOppslagLoading] = useState<boolean>(true);
  const [showVeiledning, setShowVeiledning] = useState<boolean>(true);
  const [showKvittering, setShowKvittering] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { oppslagDispatch, søker, fastlege } = useSokerOppslag();
  const { currentStep, currentStepIndex, stepWizardDispatch } = useStepWizard();
  const { getText } = useTexts(tekster);
  const StepSchemas = getStepSchemas(getText);
  const currentSchema = useMemo(() => {
    return StepSchemas[currentStepIndex];
  }, [currentStepIndex, StepSchemas]);
  const pageTitle = useMemo(
    () => getText(`steps.${currentStep?.name.toLowerCase()}.title`),
    [getText, currentStep]
  );
  const buttonText = useMemo(() => {
    const path = `steps.${currentStep?.name.toLowerCase()}.buttontext`;
    return getText(path, 'buttontext');
  }, [getText, currentStep]);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Soknad>({
    resolver: yupResolver(currentSchema),
    defaultValues: { ...initFieldVals },
  });
  useEffect(() => {
    const getSoknadStateAndOppslag = async () => {
      // Wait to test cache
      // const cachedState = await hentSoknadState(søknadDispatch, SøknadType.HOVED);
      // if (cachedState?.lagretStepList) {
      //   setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      // }
      const oppslag = await hentSokerOppslag(oppslagDispatch);
      setOppslagLoading(false);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    };
    getSoknadStateAndOppslag();
  }, []);
  // Reset form to hydrate with data from søknadstate
  useEffect(() => {
    reset({ ...søknadState.søknad });
  }, [currentStep, reset]);
  const myHandleSubmit: SubmitHandler<Soknad> = async (data) => {
    setSøknadData(søknadDispatch, data);
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      // const postResponse = await postSøknad(søknadState?.søknad);
      // if (postResponse?.ok) {
      //   setShowKvittering(true);
      // } else {
      //   // show post error
      // }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowKvittering(true);
      }, 2000);
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };
  const postSøknad = async (data?: SoknadForm<Soknad>) =>
    fetchPOST('/aap/soknad-api/innsending/standard', {
      ...data,
    });
  const onPreviousStep = () => {
    if (currentStep?.name === StepNames.STARTDATO) {
      setShowVeiledning(true);
    } else {
      goToPreviousStep(stepWizardDispatch);
    }
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
  if (showKvittering)
    return (
      <>
        <PageHeader align="center">{getText('pagetitle')}</PageHeader>
        <Kvittering getText={getText} søker={søker} />
      </>
    );
  if (showVeiledning)
    return (
      <Veiledning
        onSubmit={() => setShowVeiledning(false)}
        getText={getText}
        søker={søker}
        loading={oppslagLoading}
      />
    );
  return (
    <>
      <PageHeader align="center">{getText('pagetitle')}</PageHeader>
      <StepWizard hideLabels={true}>
        {/*<form*/}
        {/*  onSubmit={handleSubmit(myHandleSubmit)}*/}
        {/*  className={classes?.soknadForm}*/}
        {/*  autoComplete="off"*/}
        {/*>*/}
        <FormErrorSummary errors={errors} />
        <Step order={1} name={StepNames.STARTDATO} label={'Søknadsdato'}>
          <StartDato
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={2} name={StepNames.MEDLEMSKAP} label={'Tilknytning til Norge'}>
          <Medlemskap
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={3} name={StepNames.YRKESSKADE} label={'Yrkesskade'}>
          <Yrkesskade
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={4} name={StepNames.ANDRE_UTBETALINGER} label={'Andre utbetalinger'}>
          <AndreUtbetalinger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={5} name={StepNames.FASTLEGE} label={'Fastlege'}>
          <Behandlere
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
            fastlege={fastlege}
          />
        </Step>
        <Step order={6} name={StepNames.BARNETILLEGG} label={'Barnetilleggg'}>
          <Barnetillegg getText={getText} errors={errors} control={control} />
        </Step>
        <Step order={7} name={StepNames.STUDENT} label={'Student'}>
          <Student getText={getText} errors={errors} control={control} setValue={setValue} />
        </Step>
        <Step order={8} name={StepNames.TILLEGGSOPPLYSNINGER} label={'Tilleggsopplysninger'}>
          <Tilleggsopplysninger
            getText={getText}
            errors={errors}
            control={control}
            setValue={setValue}
          />
        </Step>
        <Step order={9} name={StepNames.VEDLEGG} label={'Vedlegg'}>
          <Vedlegg getText={getText} control={control} />
        </Step>
        <Step order={10} name={StepNames.OPPSUMMERING} label={'Oppsummering'}>
          <Oppsummering getText={getText} errors={errors} control={control} />
        </Step>
        {/*<div className={classes?.buttonWrapper}>*/}
        {/*  <Button*/}
        {/*    variant="secondary"*/}
        {/*    type="button"*/}
        {/*    onClick={() => {*/}
        {/*      if (currentStep?.name === StepNames.STARTDATO) {*/}
        {/*        setShowVeiledning(true);*/}
        {/*      } else {*/}
        {/*        goToPreviousStep(stepWizardDispatch);*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    {getText('backButtontext')}*/}
        {/*  </Button>*/}
        {/*  <Button variant="primary" type="submit" disabled={isLoading} loading={isLoading}>*/}
        {/*    {!isLoading && <BodyShort>{buttonText}</BodyShort>}*/}
        {/*  </Button>*/}
        {/*</div>*/}
        {/*<div className={classes?.cancelButtonWrapper}>*/}
        {/*  <Button variant="tertiary" type="button" onClick={() => onDeleteSøknad()}>*/}
        {/*    {getText('cancelButtonText')}*/}
        {/*  </Button>*/}
        {/*</div>*/}
        {/*</form>*/}
      </StepWizard>
    </>
  );
};

export default StandardPage;
