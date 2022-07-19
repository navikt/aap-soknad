import { GuidePanel } from '@navikt/ds-react';
import React from 'react';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';

const Kvittering = () => {
  const { formatMessage } = useFeatureToggleIntl();
  return <GuidePanel>{formatMessage('utland.kvittering.guide.text')}</GuidePanel>;
};

export default Kvittering;
