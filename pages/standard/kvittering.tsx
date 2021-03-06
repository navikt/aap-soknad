import { PageHeader } from '@navikt/ds-react';
import React from 'react';
import { useSokerOppslag } from '../../src/context/sokerOppslagContext';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';
import Kvittering from '../../src/pages/standard/Kvittering/Kvittering';
import * as classes from '../../src/pages/standard/standard.module.css';

const KvitteringPage = () => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søker } = useSokerOppslag();

  return (
    <>
      <PageHeader align="center" className={classes?.pageHeader}>
        {formatMessage('søknad.pagetitle')}
      </PageHeader>
      <Kvittering søker={søker} />
    </>
  );
};

export default KvitteringPage;
