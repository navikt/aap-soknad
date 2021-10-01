import React from "react";
import "./App.less";
// @ts-ignore
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Heading } from "@navikt/ds-react";
import Utland from "./pages/Utland";

const App = (): JSX.Element => {
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route path="/aap/utland">
            <Utland />
          </Route>
          <Route path="*">
            <Heading size={"2xlarge"} level={"1"} spacing={true}>
              AAP App
            </Heading>
            <span>Not Found</span>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
