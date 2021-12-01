import React from "react";
import "./App.less";
// @ts-ignore
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Heading } from "@navikt/ds-react";
import { ModalProvider } from "./context/modalContext";

// Pages
import Utland from "./pages/utland/Utland";
import Me from "./pages/Me";
import { Bedrift } from "./pages/bedrift/Bedrift";

const App = (): JSX.Element => {
  return (
    <div className="app">
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
    </div>
  );
};

export default App;
