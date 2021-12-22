import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import * as bedriftstekster from "../../../texts/nb.json";
import useTexts from "../../../hooks/useTexts";
import { Praksis } from "./Praksis";
import userEvent from "@testing-library/user-event";

describe("Praksis", () => {
  const texts = bedriftstekster.bedrift;
  beforeEach(() => {
    const Component = () => {
      const { control } = useForm();
      const { getText } = useTexts("bedrift");

      return (
        <>
          <Praksis
            getText={getText}
            control={control}
            register={jest.fn()}
            errors={{}}
          />
        </>
      );
    };
    render(<Component />);
  });

  it("skal starte uten oppføringer", () => {
    expect(screen.getByText(texts.steps.praksis.guideText)).toBeVisible();
    expect(
      screen.queryByLabelText(texts.form.praksis.navn)
    ).not.toBeInTheDocument();
  });

  it("må kunne legge til oppføringer", () => {
    const leggTilKnapp = screen.getByRole("button", {
      name: texts.form.praksis.leggTil,
    });
    expect(leggTilKnapp).toBeVisible();
    userEvent.click(leggTilKnapp);
    userEvent.click(leggTilKnapp);
    expect(screen.getAllByLabelText(texts.form.praksis.navn)).toHaveLength(2);
  });

  it("må kunne slette rader", () => {
    userEvent.click(screen.getByRole('button', { name: texts.form.praksis.leggTil}));
    expect(screen.getByLabelText(texts.form.praksis.navn)).toBeVisible();
    const slettKnapp = screen.getByRole('button', {name: texts.form.praksis.slettRad});
    expect(slettKnapp).toBeVisible();
    userEvent.click(slettKnapp);
    expect(screen.queryByLabelText(texts.form.praksis.navn)).not.toBeInTheDocument();
  });
});
