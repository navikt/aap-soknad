import { isAfter, parse } from "date-fns";
import { nb } from "date-fns/locale";
const format = "dd.MM.yyyy";

export const vFirstDateIsAfterSecondDate = (
  first: string | Date,
  second: string | Date
) => {
  const firstDate =
    typeof first === "string"
      ? parse(`${first}`, format, new Date(), { locale: nb })
      : first;
  const secondDate =
    typeof second === "string"
      ? parse(`${second}`, format, new Date(), { locale: nb })
      : second;
  return isAfter(firstDate, secondDate) || "Til dato må være etter Fra dato";
};
