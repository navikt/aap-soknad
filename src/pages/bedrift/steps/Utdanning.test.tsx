import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { axe, toHaveNoViolations } from "jest-axe";

import { Utdanning } from "./Utdanning";
import * as bedriftstekster from "../../../texts/nb.json";

import useTexts from "../../../hooks/useTexts";
import { yupResolver } from "@hookform/resolvers/yup";
import { getBedriftSchema } from "../../../schemas/bedrift";

expect.extend(toHaveNoViolations);
describe("Utdanning", () => {
  const texts = bedriftstekster.bedrift;
  const Component = () => {
    const { getText } = useTexts("bedrift");
    const schema = getBedriftSchema(getText);
    const { register, control, formState: { errors } } = useForm({resolver: yupResolver(schema[3])});
    return (
      <>
        <Utdanning
          getText={getText}
          register={register}
          control={control}
          errors={errors}
        />
      </>
    );
  };

  it("skal starte uten oppføringer", () => {
    render(<Component />);
    expect(screen.getByText(texts.steps.utdanning.guideText)).toBeVisible();
    expect(
      screen.queryByLabelText(texts.form.utdanning.institusjonsnavn)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.form.utdanning.leggTil })
    ).toBeVisible();
  });

  it("må kunne legge til rader", () => {
    render(<Component />);
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
      screen.getByLabelText(texts.form.utdanning.institusjonsnavn)
    ).toBeInTheDocument();
    userEvent.click(leggTilKnapp);
    expect(
      screen.getAllByLabelText(texts.form.utdanning.institusjonsnavn)
    ).toHaveLength(2);
  });

  it("må kunne slette rader", () => {
    render(<Component />);
    const skolenavn = "Nes Vidregående skole";
    const leggTilKnapp = screen.getByRole("button", {
      name: texts.form.utdanning.leggTil,
    });

    userEvent.click(leggTilKnapp);
    userEvent.type(
      screen.getByLabelText(texts.form.utdanning.institusjonsnavn),
      skolenavn
    );
    userEvent.type(screen.getByLabelText(texts.form.utdanning.fraAar), "2010");
    userEvent.type(screen.getByLabelText(texts.form.utdanning.tilAar), "2013");

    userEvent.click(leggTilKnapp);

    expect(
      screen.getAllByLabelText(texts.form.utdanning.institusjonsnavn)
    ).toHaveLength(2);

    userEvent.click(
      screen.getAllByRole("button", { name: texts.form.utdanning.slettRad })[1]
    );
    expect(screen.getByDisplayValue(skolenavn)).toBeVisible();
  });

  it("skal ikke ha brudd på krav til universell utforming", async () => {
    const { container } = render(<Component />);
    const res = await axe(container);
    expect(res).toHaveNoViolations();
  });
});
