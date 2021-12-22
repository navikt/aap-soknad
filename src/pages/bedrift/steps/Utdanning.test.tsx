import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { Utdanning } from "./Utdanning";
import * as bedriftstekster from "../../../texts/nb.json";
import useTexts from "../../../hooks/useTexts";

describe("Utdanning", () => {
  const texts = bedriftstekster.bedrift;
  beforeEach(() => {
    const Component = () => {
      const { control } = useForm();
      const { getText } = useTexts("bedrift");
      return (
        <>
          <Utdanning
            getText={getText}
            register={jest.fn()}
            control={control}
            errors={{}}
          />
        </>
      );
    };
    render(<Component />);
  });

  it("skal starte uten oppføringer", () => {
    expect(screen.getByText(texts.steps.utdanning.guideText)).toBeVisible();
    expect(
      screen.queryByLabelText(texts.form.utdanning.institusjonsnavn)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.form.utdanning.leggTil })
    ).toBeVisible();
  });

  it("må kunne legge til rader", () => {
    expect(screen.getByText(texts.steps.utdanning.guideText)).toBeVisible();
    expect(
      screen.queryByLabelText(texts.form.utdanning.institusjonsnavn)
    ).not.toBeInTheDocument();
    const leggTilKnapp = screen.getByRole("button", {
      name: texts.form.utdanning.leggTil,
    });
    expect(leggTilKnapp).toBeVisible();
    userEvent.click(leggTilKnapp);
    expect(
      screen.queryByLabelText(texts.form.utdanning.institusjonsnavn)
    ).toBeInTheDocument();
    userEvent.click(leggTilKnapp);
    expect(
      screen.getAllByLabelText(texts.form.utdanning.institusjonsnavn)
    ).toHaveLength(2);
  });

  it("må kunne slette rader", () => {
    const leggTilKnapp = screen.getByRole("button", {
      name: texts.form.utdanning.leggTil,
    });

    expect(leggTilKnapp).toBeVisible();
    userEvent.click(leggTilKnapp);
    expect(
      screen.getByLabelText(texts.form.utdanning.institusjonsnavn)
    ).toBeVisible();
    const slettKnapp = screen.getByRole('button', { name: texts.form.utdanning.slettRad});
    expect(slettKnapp).toBeVisible();
    userEvent.click(slettKnapp);
    expect(
      screen.queryByLabelText(texts.form.utdanning.institusjonsnavn)
    ).not.toBeInTheDocument();
  });
});
