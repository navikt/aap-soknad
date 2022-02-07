import React from "react";
import "./App.less";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {Button, Heading} from "@navikt/ds-react";
import { ModalProvider } from "./context/modalContext";
import { SoknadContextProvider } from "./context/soknadContext";
import { StepWizardContextProvider} from "./context/stepWizardContext";

// Pages
import Me from "./pages/Me";
import { Bedrift } from "./pages/bedrift/Bedrift";
import Utland from "./pages/utland/Utland";
import {Hovedsoknad} from "./pages/hovedsoknad/Hovedsoknad";

const App = (): JSX.Element => {
  return (
    <div className="app">
      <SoknadContextProvider>
        <ModalProvider>
          <StepWizardContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/aap" element={<Hovedsoknad />} />
                <Route path="/aap/me" element={<Me />} />
                <Route path="/aap/utland" element={<Utland />} />
                <Route path="/aap/bedrift" element={<Bedrift />} />
                <Route
                  path="*"
                  element={
                    <>
                      <Heading size={"2xlarge"} level={"1"} spacing={true}>
                        AAP App
                      </Heading>
                      <Button onClick={() => console.log('USE_MOCK', process.env.AAP_SOKNAD_USE_MOCK)} >USE MOCK</Button>
                      <span>Not Found</span>
                    </>
                  }
                />
              </Routes>
            </BrowserRouter>
          </StepWizardContextProvider>
        </ModalProvider>
      </SoknadContextProvider>
    </div>
  );
};

export default App;
