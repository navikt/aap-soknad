import React from "react";
import {render } from "react-dom";
import App from "./App";
import "@navikt/ds-css";
import { setupLogger } from './utils/logger';

console.log('use mock:', process.env.USE_MOCK);
if (process.env.USE_MOCK === 'true') {
  console.log('yes, use mock')
  const { worker } = require("./mocks/browser");
  worker.start();
}

setupLogger();


const app = document.getElementById("app");
render(<div className="app-container">
  <App />
</div>, app);
