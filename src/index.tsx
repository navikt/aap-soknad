import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { setupLogger } from './utils/logger';

setupLogger();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
