import React, { useState } from "react";
import "./Utland.less";
import {
  Heading,
  Ingress,
  Button,
  Loader,
} from "@navikt/ds-react";
import { logger } from "../utils/logger";
import { useQuery } from "react-query";
import { get } from "../api/fetch";
import { Me } from "../interfaces/me";

const Utland = (): JSX.Element => {
  const fetchMe = async() => {
    const res = await get<Me>('/aap/api/me')
    console.log(res);
    return res;
  }
  const { isLoading, error, data } = useQuery("fetchMe", fetchMe)

  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const onSubmit = async () => {
    setIsWaiting(true);
    const response = await fetch('/aap/api/me');
    const json = response.json();
    logger.info({
      message: 'api/me called',
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
      <Button variant="primary" type="submit" onClick={() => onSubmit()} >
        Test
        {isLoading ? <Loader /> : null}
        {error ? error : null}
        {data ? data.fornavn : null}
      </Button>
    </>
  );
};

export default Utland;
