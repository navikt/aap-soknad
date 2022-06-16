import { PageHeader } from '@navikt/ds-react';
import { Step, StepWizard } from '../../components/StepWizard';
import React, { useEffect, useState } from 'react';
import { useFeatureToggleIntl } from '../../hooks/useFeatureToggleIntl';
import {
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary,
} from './Steps';
import { fetchPOST } from '../../api/fetch';
import { formatDate } from '../../utils/date';
import {
  hentSoknadState,
  lagreSoknadState,
  setSøknadType,
  SøknadType,
  useSoknadContext,
} from '../../context/soknadContext';
import {
  completeAndGoToNextStep,
  goToPreviousStep,
  setStepList,
  useStepWizard,
} from '../../context/stepWizardContextV2';

import SoknadUtland from '../../types/SoknadUtland';

enum StepNames {
  DESTINATION = 'DESTINATION',
  TRAVEL_PERIOD = 'TRAVEL_PERIOD',
  SUMMARY = 'SUMMARY',
  RECEIPT = 'RECEIPT',
}
const defaultStepList = [
  { name: StepNames.DESTINATION, active: true },
  { name: StepNames.TRAVEL_PERIOD },
  { name: StepNames.SUMMARY },
  { name: StepNames.RECEIPT },
];

const Utland = (): JSX.Element => {
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const [isVeiledning, setIsVeiledning] = useState<boolean>(true);
  const { formatMessage } = useFeatureToggleIntl();
  useEffect(() => {
    setSøknadType(søknadDispatch, SøknadType.UTLAND);
  }, []);
  useEffect(() => {
    const getSoknadState = async () => {
      const cachedState = await hentSoknadState(søknadDispatch, SøknadType.UTLAND);
      if (cachedState?.lagretStepList && cachedState?.lagretStepList?.length > 0) {
        setIsVeiledning(false);
        setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      } else {
        setStepList([...defaultStepList], stepWizardDispatch);
      }
    };
    getSoknadState();
  }, []);
  useEffect(() => {
    if (søknadState?.søknad && Object.keys(søknadState?.søknad)?.length > 0) {
      lagreSoknadState({ ...søknadState }, [...stepList]);
    }
  }, [currentStep, stepList]);
  const myHandleSubmit = async () => {
    const postResponse = await postSøknad(søknadState?.søknad);
    if (!postResponse.ok) {
      console.error('noe gikk galt med sletting av lagret søknad', postResponse.error);
    }
    completeAndGoToNextStep(stepWizardDispatch);
  };
  const postSøknad = async (data?: SoknadUtland) =>
    fetchPOST('/aap/soknad-api/innsending/utland', {
      land: data?.country,
      periode: {
        fom: formatDate(data?.fromDate, 'yyyy-MM-dd'),
        tom: formatDate(data?.toDate, 'yyyy-MM-dd'),
      },
    });
  const onPreviousStep = () => {
    goToPreviousStep(stepWizardDispatch);
  };

  if (isVeiledning) return <StepIntroduction onSubmit={() => setIsVeiledning(false)} />;
  return (
    <>
      <header>
        <PageHeader align="center">{formatMessage('utland.title')}</PageHeader>
      </header>
      <StepWizard hideLabels={false}>
        <Step order={2} name={StepNames.DESTINATION}>
          <StepSelectCountry onBackClick={onPreviousStep} />
        </Step>
        <Step order={3} name={StepNames.TRAVEL_PERIOD}>
          <StepSelectTravelPeriod onBackClick={onPreviousStep} />
        </Step>
        <Step order={4} name={StepNames.SUMMARY}>
          <StepSummary
            onBackClick={onPreviousStep}
            onSubmitSoknad={myHandleSubmit}
            data={søknadState?.søknad}
          />
        </Step>
        <Step order={5} name={StepNames.RECEIPT}>
          <StepKvittering />
        </Step>
      </StepWizard>
    </>
  );
};

export default Utland;
