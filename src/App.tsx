import React from "react";
import "./App.less";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Heading } from "@navikt/ds-react";
import { ModalProvider } from "./context/modalContext";
import { SoknadContextProvider } from "./context/soknadContext";

// Pages
import Utland from "./pages/utland/Utland";
import Me from "./pages/Me";
import { Bedrift } from "./pages/bedrift/Bedrift";

const App = (): JSX.Element => {
  return (
    <div className="app">
      <SoknadContextProvider>
        <ModalProvider>
          <BrowserRouter>
            <Routes>
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
                    <span>Not Found</span>
                  </>
                }
              />
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </SoknadContextProvider>
    </div>
  );
};

export default App;
