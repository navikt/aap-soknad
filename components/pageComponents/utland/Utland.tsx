import PageHeader from 'components/PageHeader';
import { Step, StepWizard } from 'components/StepWizard';
import React, { useEffect, useState } from 'react';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import {
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary,
} from './Steps';
import { fetchPOST } from 'api/fetch';
import { formatDate } from 'utils/date';
import { hentSoknadState } from 'context/soknadContextCommon';
import { useSoknadContextUtland } from 'context/soknadContextUtland';
import {
  completeAndGoToNextStep,
  goToPreviousStep,
  setStepList,
  useStepWizard,
} from 'context/stepWizardContextV2';

import SoknadUtland from 'types/SoknadUtland';
import { SøknadType } from 'types/SoknadContext';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { updateSøknadData } from 'context/soknadContextCommon';

export enum StepNames {
  DESTINATION = 'DESTINATION',
  TRAVEL_PERIOD = 'TRAVEL_PERIOD',
  SUMMARY = 'SUMMARY',
  RECEIPT = 'RECEIPT',
}
export const defaultStepList = [
  { name: StepNames.DESTINATION, active: true },
  { name: StepNames.TRAVEL_PERIOD },
  { name: StepNames.SUMMARY },
  { name: StepNames.RECEIPT },
];

const Utland = (): JSX.Element => {
  const { søknadState, søknadDispatch } = useSoknadContextUtland();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const [isVeiledning, setIsVeiledning] = useState<boolean>(true);
  const debouncedLagre = useDebounceLagreSoknad();
  const { formatMessage } = useFeatureToggleIntl();
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
      debouncedLagre(søknadState, stepList, {});
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
      land: data?.land,
      periode: {
        fom: formatDate(data?.fraDato, 'yyyy-MM-dd'),
        tom: formatDate(data?.tilDato, 'yyyy-MM-dd'),
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
          <StepSelectCountry
            onBackClick={onPreviousStep}
            onNext={(data: any) => {
              updateSøknadData(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={3} name={StepNames.TRAVEL_PERIOD}>
          <StepSelectTravelPeriod
            onBackClick={onPreviousStep}
            onNext={(data: any) => {
              updateSøknadData(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
            }}
          />
        </Step>
        <Step order={4} name={StepNames.SUMMARY}>
          <StepSummary
            onBackClick={onPreviousStep}
            onSubmitSoknad={myHandleSubmit}
            data={søknadState?.søknad}
            onNext={(data: any) => {
              updateSøknadData(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              myHandleSubmit();
            }}
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
