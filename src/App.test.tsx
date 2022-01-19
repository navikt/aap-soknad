import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("kan tegne appen", () => {
  render(<App />);
  expect(screen.getByText(/Søk om AAP/)).toBeVisible();
});
