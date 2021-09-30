import React from "react";
import "./App.less";
// @ts-ignore
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Utland from "./pages/Utland";

const App = (): JSX.Element => {
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route path="/utland">
            <Utland />
          </Route>
          <Route path="*">
            <span>Not Found</span>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
