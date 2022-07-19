import { Button, GuidePanel } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import React from 'react';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';
import * as classes from '../../src/pages/standard/Veiledning/Veiledning.module.css';

const Utland = () => {
  const router = useRouter();
  const { formatMessage } = useFeatureToggleIntl();

  return (
    <>
      <GuidePanel poster>{formatMessage('utland.veiledning.guide.text')}</GuidePanel>
      <div className={classes?.buttonWrapper}>
        <Button variant="primary" type="button" onClick={() => router.push('destinasjon')}>
          {'Fortsett til søknaden'}
        </Button>
        <Button variant="tertiary" type="button" onClick={() => console.log('TODO')}>
          {'Slett påbegynt søknad'}
        </Button>
      </div>
    </>
  );
};

export default Utland;
