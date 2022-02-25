import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTexts } from '../../hooks/useTexts';
import { BodyShort, Button, Heading, Loader, PageHeader } from '@navikt/ds-react';
import * as tekster from './tekster';
import { Step, StepWizard } from '../../components/StepWizard';
import { getStepSchemas } from './schema';
import { useForm, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  setStepList,
  completeAndGoToNextStep,
  useStepWizard,
  resetStepWizard,
} from '../../context/stepWizardContextV2';
import SoknadForm from '../../types/SoknadForm';
import SoknadStandard from '../../types/SoknadStandard';
import { FormErrorSummary } from '../../components/schema/FormErrorSummary';
import {
  useSoknadContext,
  hentSoknadState,
  SøknadType,
  slettLagretSoknadState,
} from '../../context/soknadContext';
import { Kontaktinfo } from './Kontaktinfo';
import { Veiledning } from './Veiledning';
import { hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { Behandlere } from './Behandlere';
import { TilknytningTilNorge } from './TilknytningTilNorge';
import { Yrkesskade } from './Yrkesskade';
import { AndreUtbetalinger } from './AndreUtbetalinger';
import { Barnetillegg } from './Barnetillegg';
import { ModalContext } from '../../context/modalContext';

enum StepNames {
  VEILEDNING = 'VEILEDNING',
  KONTAKTINFO = 'KONTAKTINFO',
  FASTLEGE = 'FASTLEGE',
  TILKNYTNING_TIL_NORGE = 'TILKNYTNING_TIL_NORGE',
  YRKESSKADE = 'YRKESSKADE',
  ANDRE_UTBETALINGER = 'ANDRE_UTBETALINGER',
  BARNETILLEGG = 'BARNETILLEGG',
}
const initFieldVals: FieldValues = {
  rettogplikt: false,
};
export const StandardPage = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { oppslagState, oppslagDispatch } = useSokerOppslag();
  const { handleNotificationModal } = useContext(ModalContext);
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
  } = useForm({
    resolver: yupResolver(currentSchema),
    defaultValues: useMemo(() => ({ ...initFieldVals, ...søknadState?.søknad }), [søknadState]),
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
    console.log('step changed', currentStep);
    reset({ ...søknadState.søknad });
  }, [currentStep, reset]);
  const myHandleSubmit = async (data: SoknadForm<SoknadStandard>) => {
    completeAndGoToNextStep(stepWizardDispatch);
    reset({ ...søknadState.søknad });
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
  return (
    <>
      <PageHeader align="center">{getText('pagetitle')}</PageHeader>
      <StepWizard hideLabels={true}>
        <form onSubmit={handleSubmit(myHandleSubmit)} autoComplete="off">
          <Heading size="small" level="2">
            {getText(`steps.${currentStep?.name}.title`)}
          </Heading>
          <FormErrorSummary errors={errors} />
          <Step order={1} name={StepNames.VEILEDNING} label={'Veiledning'}>
            <Veiledning getText={getText} errors={errors} control={control} />
          </Step>
          <Step order={2} name={StepNames.KONTAKTINFO} label={'Kontaktinformasjon'}>
            <Kontaktinfo getText={getText} errors={errors} control={control} />
          </Step>
          <Step order={3} name={StepNames.FASTLEGE} label={'Fastlege'}>
            <Behandlere getText={getText} errors={errors} control={control} />
          </Step>
          <Step order={4} name={StepNames.TILKNYTNING_TIL_NORGE} label={'Tilknytning til Norge'}>
            <TilknytningTilNorge getText={getText} errors={errors} control={control} />
          </Step>
          <Step order={5} name={StepNames.YRKESSKADE} label={'Yrkesskade'}>
            <Yrkesskade getText={getText} errors={errors} control={control} />
          </Step>
          <Step order={6} name={StepNames.ANDRE_UTBETALINGER} label={'Andre utbetalinger'}>
            <AndreUtbetalinger getText={getText} errors={errors} control={control} watch={watch} />
          </Step>
          <Step order={7} name={StepNames.BARNETILLEGG} label={'Barnetilleggg'}>
            <Barnetillegg
              getText={getText}
              errors={errors}
              control={control}
              barneListe={oppslagState?.barn}
            />
          </Step>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {!isLoading && (
              <BodyShort>{getText(`${currentStep?.name}.buttontext`, 'buttontext')}</BodyShort>
            )}
            {isLoading && <Loader />}
          </Button>
          <Button variant="tertiary" type="button" onClick={() => onDeleteSøknad()}>
            {!isLoading ? 'Slett påbegynt søknad' : ''}
            {isLoading && <Loader />}
          </Button>
        </form>
      </StepWizard>
    </>
  );
};

export default StandardPage;
