import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { setupLogger } from './utils/logger';

if (process.env.NODE_ENV === 'development') {
  require('./mock/setupMock');
}

setupLogger();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
