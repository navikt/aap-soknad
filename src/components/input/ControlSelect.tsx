import {utland as Texts} from "../../texts/nb.json";
import {Select} from "@navikt/ds-react";
import {Controller} from "react-hook-form";
import React from "react";

export interface ConfirmationPanelProps {
  name: string;
  control: any;
  error: string;
  required?: string;
  validate?: (value: any) => any;
  children?:
    | React.ReactChild
    | React.ReactChild[];
}

const ControlSelect = ({name, control, error, required, validate, children}: ConfirmationPanelProps) =>
  <Controller
    name={name}
    control={control}
    rules={{
      ...(required ? {required} : {}),
      ...(validate ? {validate} : {})
    }}
    render={({ field: { name, value, onChange } }) => (
      <Select
        name={name}
        label={Texts?.form?.country?.label}
        value={value}
        onChange={onChange}
        error={error}
      >
        <option key="none" value="none">Velg land</option>
        { children }
      </Select>
    )}
  />

export default ControlSelect;
