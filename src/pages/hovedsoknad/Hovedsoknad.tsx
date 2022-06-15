import React, { useState } from 'react';

import { Alert, Button, GuidePanel, Loader, PageHeader } from '@navikt/ds-react';
import { fetchPOST } from '../../api/fetch';
import { useTexts } from '../../hooks/useTexts';

import * as tekster from './tekster';

const Hovedsoknad = (): JSX.Element => {
  const [innsendingFeil, setInnsendingFeil] = useState<boolean>(false);
  const [senderMelding, setSenderMelding] = useState<boolean>(false);
  const [visKvittering, setVisKvittering] = useState<boolean>(false);

  const sendSøknad = async () => {
    setSenderMelding(true);
    const res = await fetchPOST('/aap/soknad-api/innsending/soknad', {});
    setSenderMelding(false);
    if (!res.ok) {
      setInnsendingFeil(true);
    }
    if (res.ok) {
      setVisKvittering(true);
    }
  };

  const { getText } = useTexts(tekster);

  return (
    <>
      <PageHeader>{getText('pageTitle')}</PageHeader>
      {!visKvittering && (
        <>
          <GuidePanel poster>{getText('steps.introduction.guideText')}</GuidePanel>
          <Button variant="primary" type="submit" onClick={sendSøknad} disabled={senderMelding}>
            Søk AAP
            {senderMelding && <Loader />}
          </Button>
        </>
      )}
      {visKvittering && <GuidePanel>{getText('steps.kvittering')}</GuidePanel>}
      {innsendingFeil && <Alert variant={'error'}>{getText('innsending.feil')}</Alert>}
    </>
  );
};

export { Hovedsoknad };
