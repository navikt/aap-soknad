import React, { useState } from "react";
import "./Utland.less";
import {
  Heading,
  Ingress,
  Button,
  Loader,
} from "@navikt/ds-react";
import { logger } from "../utils/logger";

const Utland = (): JSX.Element => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const onSubmitProxyApi = async () => {
    setIsWaiting(true);
    const response = await fetch('/aap/api/me');
    const json = await response.json();
    logger.info({
      message: 'api/me called',
      payload: json
    });
  };
  const onSubmitApiTest = async () => {
    setIsWaiting(true);
    const response = await fetch('/aap/apitest');
    const json = await response.json();
    logger.info({
      message: '/apitest called',
      payload: json
    });
  };

  return (
    <>
      <Heading size="2xlarge" level="1" spacing={true}>
        Meg
      </Heading>
      <Ingress spacing={true}>
        Api test.
      </Ingress>
      <Button variant="primary" type="submit" onClick={() => onSubmitProxyApi()} >
        ProxyApi Test
        {isWaiting ? <Loader /> : null}
      </Button>
      <Button variant="primary" type="submit" onClick={() => onSubmitApiTest()} >
        ApiTest
        {isWaiting ? <Loader /> : null}
      </Button>
    </>
  );
};

export default Utland;
