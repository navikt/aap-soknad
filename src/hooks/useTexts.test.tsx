import useTexts from "./useTexts";
import { render, screen } from "@testing-library/react";
import testTexts from "../texts/nb.json";

describe("useTexts", () => {
  it("gir tekst tilbake", () => {
    const Component = () => {
      const { getText } = useTexts('hovedsøknad');
      return (
        <div>{getText("pageTitle")}</div>
      )
    }
    render(<Component />);
    expect(screen.getByText(testTexts.hovedsøknad.pageTitle)).toBeVisible();
  });

  it("ingen treff på tekst gir nøkkel tilbake", () => {
    const Component = () => {
      const { getText } = useTexts('hovedsøknad');
      return (
        <div>{getText("nøkkel.som.ikke.finnes")}</div>
      )
    }
    render(<Component />);
    expect(screen.getByText("nøkkel.som.ikke.finnes")).toBeVisible();
  })
})
