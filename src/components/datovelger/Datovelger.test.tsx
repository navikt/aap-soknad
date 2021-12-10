import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

import DatoVelger from "../datovelger";

describe("Datovelger", () => {
  test("kan velge dato ved å klikke", () => {
    const dato = new Date();
    const dag = dato.getDate();
    const forventetVisningsverdi = format(dato, 'dd.MM.yyyy');
    const mndAar = format(dato, "LLLL yyyy", { locale: enUS });
    render(
      <DatoVelger onChange={() => {}} name={"fraDato"} label={"Fra dato"} />
    );
    const input = screen.getByRole("textbox", { name: /Fra dato/ });
    expect(input).toBeVisible();
    userEvent.click(input);
    expect(screen.getByText(mndAar)).toBeVisible();
    userEvent.click(screen.getByText(dag));
    expect(input).toHaveDisplayValue(forventetVisningsverdi);
  });

  test.skip("kan skrive inn dato", async () =>{
    const dato = new Date();
    const forventetVisningsverdi = format(dato, 'dd.MM.yyyy');
    render(
      <DatoVelger onChange={() => {}} name={"fraDato"} label={"Fra dato"} />
    );
    const input = screen.getByRole("textbox", { name: /Fra dato/ });
    expect(input).toBeVisible();
    userEvent.click(input);
    await userEvent.type(input, forventetVisningsverdi, {delay: 100});
    expect(input).toHaveDisplayValue(forventetVisningsverdi);
  })
});
