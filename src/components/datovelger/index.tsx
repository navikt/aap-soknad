import React from "react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { parse } from "date-fns";
import { nb } from "date-fns/locale";
import "react-day-picker/lib/style.css";
import "./datovelger.less";
import { TextField } from "@navikt/ds-react";
import { formatDate } from "../../utils/date"

const parseDate = (str: string, format: string, locale: string) => {
  try {
    return parse(str, format, new Date(), { locale: nb });
  } catch (err) {
    console.error("parseDate error", err);
  }
};
const wrapFormatDate = (date: Date, dateFormat: string, locale: string) =>
  formatDate(date, dateFormat);

interface DatovelgerProps {
  onChange: (nyDato: Date) => void;
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  value?: string;
}

const datovelger = ({
  onChange,
  error,
  name,
  label,
  id,
  value,
}: DatovelgerProps) => (
  <div className="datovelger navds-form-field">
    <DayPickerInput
      format="dd.MM.yyyy"
      placeholder=""
      value={value}
      dayPickerProps={{ locale: "nb" }}
      parseDate={parseDate}
      formatDate={wrapFormatDate}
      onDayChange={onChange}
      inputProps={{ name, id }}
      component={(props: any) => (
        <TextField label={label} id={id} name={name} error={error} {...props} />
      )}
    />
  </div>
);

export default datovelger;
