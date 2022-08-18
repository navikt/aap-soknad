import PageHeader from 'components/PageHeader';
import React from 'react';
import { useSokerOppslag } from 'context/sokerOppslagContext';
import { SoknadContextProviderStandard } from 'context/soknadContextStandard';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import Kvittering from 'components/pageComponents/standard/Kvittering/Kvittering';
import * as classes from 'components/pageComponents/standard/standard.module.css';

const KvitteringPage = () => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søker } = useSokerOppslag();

  return (
    <SoknadContextProviderStandard>
      <PageHeader align="center" className={classes?.pageHeader}>
        {formatMessage('søknad.pagetitle')}
      </PageHeader>
      <Kvittering søker={søker} />
    </SoknadContextProviderStandard>
  );
};

export default KvitteringPage;
