import { Utdanning } from "./Utdanning";
import { render, screen } from "@testing-library/react";
import * as bedriftstekster from "../../../texts/nb.json";

describe("Utdanning", () => {
  const texts = bedriftstekster.bedrift;
  const mockGetText = jest.fn().mockImplementation((v: string): string => {
    switch (v) {
      case "steps.utdanning.guideText":
        return texts.steps.utdanning.guideText;
      case "form.utdanning.institusjonsnavn":
        return texts.form.utdanning.institusjonsnavn;
      case "form.utdanning.leggTil":
        return texts.form.utdanning.leggTil;
      default:
        return v;
    }
  });
  beforeAll(() => {
    render(
      <Utdanning getText={mockGetText} register={jest.fn()} errors={{}} />
    );
  });

  it("skal starte uten oppføringer", () => {
    screen.debug(undefined, 30000);
    expect(screen.getByText(texts.steps.utdanning.guideText)).toBeVisible();
    expect(
      screen.queryByLabelText(texts.form.utdanning.institusjonsnavn)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.form.utdanning.leggTil })
    ).toBeVisible();
  });
});
