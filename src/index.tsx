import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { setupLogger } from './utils/logger';

if (process.env.REACT_APP_USE_MOCK === 'true') {
  const { worker } = require("./mocks/browser");
  worker.start();
}

setupLogger();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
