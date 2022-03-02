import React, { useState } from 'react';
import './utland/Utland.less';
import { Heading, Ingress, Button, Loader } from '@navikt/ds-react';
import { useErrorHandler } from 'react-error-boundary';

const Utland = (): JSX.Element => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const handleError = useErrorHandler();
  const onSubmit = async () => {
    setIsWaiting(true);
    await fetch('/aap/soknad-api/me');
  };
  const handleThing = () => {
    try {
      const testVar = true;
      testVar.map((e: any) => e);
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <>
      <Heading size="2xlarge" level="1" spacing={true}>
        Meg
      </Heading>
      <Ingress spacing={true}>Api test.</Ingress>
      <Button variant="primary" type="submit" onClick={() => handleThing()}>
        Frontend error
      </Button>
      <Button variant="primary" type="submit" onClick={() => onSubmit()}>
        Test
        {isWaiting ? <Loader /> : null}
      </Button>
    </>
  );
};

export default Utland;
