import React from "react";
import "./App.less";
// @ts-ignore
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Heading } from "@navikt/ds-react";
import { ModalProvider } from "./context/modalContext";

// Pages
import Utland from "./pages/utland/Utland";
import Me from "./pages/Me";

const App = (): JSX.Element => {
  return (
    <div className="app">
      <ModalProvider>
        <Router>
          <Switch>
            <Route path="/aap/me">
              <Me />
            </Route>
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
      </ModalProvider>
    </div>
  );
};

export default App;
