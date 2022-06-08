import { PageHeader } from '@navikt/ds-react';
import { Step, StepWizard } from '../../components/StepWizard';
import React, { useEffect, useState } from 'react';
import {
  StepIntroduction,
  StepKvittering,
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary,
} from './Steps';
import { fetchPOST } from '../../api/fetch';
import { formatDate } from '../../utils/date';
import useTexts from '../../hooks/useTexts';
import {
  hentSoknadState,
  lagreSoknadState,
  SøknadType,
  useSoknadContext,
} from '../../context/soknadContext';
import {
  useStepWizard,
  completeAndGoToNextStep,
  goToPreviousStep,
  setStepList,
} from '../../context/stepWizardContextV2';
import * as tekster from './tekster';

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
  const { stepList, stepWizardDispatch } = useStepWizard();
  const [isVeiledning, setIsVeiledning] = useState<boolean>(true);

  const { getText } = useTexts(tekster);
  useEffect(() => {
    const getSoknadState = async () => {
      const cachedState = await hentSoknadState(søknadDispatch, SøknadType.UTLAND);
      if (cachedState?.lagretStepList) {
        setIsVeiledning(false);
        setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      } else {
        setStepList([...defaultStepList], stepWizardDispatch);
      }
    };
    getSoknadState();
  }, []);
  useEffect(() => {
    if (søknadState?.søknad) {
      lagreSoknadState({ ...søknadState }, [...stepList]);
    }
  }, [søknadState]);
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
  const onDeleteSøknad = async () => {
    // if (søknadState.type) {
    //   const deleteRes = await slettLagretSoknadState(søknadDispatch, søknadState.type);
    //   if (deleteRes) {
    //     resetStepWizard(stepWizardDispatch);
    //   } else {
    //     console.error('noe gikk galt med sletting av lagret søknad');
    //   }
    // }
  };
  const onPreviousStep = () => {
    goToPreviousStep(stepWizardDispatch);
  };

  if (isVeiledning)
    return <StepIntroduction getText={getText} onSubmit={() => setIsVeiledning(false)} />;
  return (
    <>
      <header>
        <PageHeader align="center">{'Søknad om Arbeidsavklaringspenger (AAP) utland'}</PageHeader>
      </header>
      <StepWizard hideLabels={false}>
        <Step order={2} name={StepNames.DESTINATION} label="Destinasjon">
          <StepSelectCountry
            getText={getText}
            søknad={søknadState?.søknad}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
          />
        </Step>
        <Step order={3} name={StepNames.TRAVEL_PERIOD} label="Periode">
          <StepSelectTravelPeriod
            getText={getText}
            søknad={søknadState?.søknad}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
          />
        </Step>
        <Step order={4} name={StepNames.SUMMARY} label="Oppsummering">
          <StepSummary
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            onSubmitSoknad={myHandleSubmit}
            data={søknadState?.søknad}
          />
        </Step>
        <Step order={5} name={StepNames.RECEIPT} label="Kvittering">
          <StepKvittering getText={getText} />
        </Step>
      </StepWizard>
    </>
  );
};

export default Utland;
