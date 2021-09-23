import React from "react";
import "./App.less";
import { Heading } from "@navikt/ds-react"

const App = (): JSX.Element => {
  return <div className="app">
    <Heading size={"2xlarge"} level={"1"} spacing={true}>AAP App</Heading>
  </div>;
};

export default App;
