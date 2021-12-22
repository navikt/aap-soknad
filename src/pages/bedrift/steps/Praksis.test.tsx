import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import * as bedriftstekster from "../../../texts/nb.json";
import useTexts from "../../../hooks/useTexts";
import { Praksis } from "./Praksis";
import userEvent from "@testing-library/user-event";
import { endOfMonth, format, startOfMonth } from "date-fns";

let dato = new Date();
let foersteIMnd = format(startOfMonth(dato), "EEE MMM dd yyyy");
let sisteIMnd = format(endOfMonth(dato), "EEE MMM dd yyyy");

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
    const firmanavn = "Lokal snekker AS";
    const leggTilKnapp = screen.getByRole("button", {
      name: texts.form.praksis.leggTil,
    });

    userEvent.click(leggTilKnapp);

    userEvent.type(screen.getByLabelText(texts.form.praksis.navn), firmanavn);
    userEvent.click(screen.getByLabelText(texts.form.praksis.fraDato));
    userEvent.click(screen.getByLabelText(foersteIMnd));
    userEvent.click(screen.getByLabelText(sisteIMnd));

    userEvent.click(leggTilKnapp);

    userEvent.click(
      screen.getAllByRole("button", { name: texts.form.praksis.slettRad })[1]
    );
    expect(screen.getByDisplayValue(firmanavn)).toBeVisible();
  });
});
