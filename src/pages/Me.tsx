import React, { useState } from 'react';
import { Heading, Ingress, Button, Loader } from '@navikt/ds-react';
import { useErrorHandler } from 'react-error-boundary';
import { captureException } from '@sentry/react';

const Utland = (): JSX.Element => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const handleError = useErrorHandler();
  const onSubmit = async () => {
    setIsWaiting(true);
    await fetch('/aap/soknad-api/me');
  };
  const handleThing = () => {
    handleSecondThing();
  };

  const handleSecondThing = () => {
    doSideffect();
  };

  const doSideffect = () => {
    try {
      const testVar = true;
      testVar.map((e: any) => e);
    } catch (e) {
      console.log(e);
      handleError(e);
    }
  };
  const handleSentryThing = () => {
    try {
      const testVar = 77;
      testVar.map((e: any) => e);
    } catch (err) {
      captureException(err);
    }
  };
  return (
    <>
      <Heading size="xlarge" level="1" spacing={true}>
        Meg
      </Heading>
      <Ingress spacing={true}>Api test.</Ingress>
      <Button variant="primary" type="submit" onClick={() => handleThing()}>
        Frontend error
      </Button>
      <Button variant="primary" type="submit" onClick={() => handleSentryThing()}>
        Sentry error
      </Button>
      <Button variant="primary" type="submit" onClick={() => onSubmit()}>
        Test
        {isWaiting ? <Loader /> : null}
      </Button>
    </>
  );
};

export default Utland;
