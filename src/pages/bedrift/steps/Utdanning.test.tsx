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
    const skolenavn = 'Nes Vidregående skole';
    const leggTilKnapp = screen.getByRole("button", {
      name: texts.form.utdanning.leggTil,
    });

    userEvent.click(leggTilKnapp);
    userEvent.type(screen.getByLabelText(texts.form.utdanning.institusjonsnavn), skolenavn);
    userEvent.type(screen.getByLabelText(texts.form.utdanning.fraAar), '2010');
    userEvent.type(screen.getByLabelText(texts.form.utdanning.tilAar), '2013');

    userEvent.click(leggTilKnapp);

    expect(screen.getAllByLabelText(texts.form.utdanning.institusjonsnavn)).toHaveLength(2);

    userEvent.click(screen.getAllByRole('button', { name: texts.form.utdanning.slettRad})[1]);
    expect(screen.getByDisplayValue(skolenavn)).toBeVisible();
  });
});
