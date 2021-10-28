import {Controller} from "react-hook-form";
import {utland as Texts} from "../../texts/nb.json";
import DatoVelger from "../datovelger";
import React from "react";


export interface ConfirmationPanelProps {
  name: string;
  control: any;
  error: string;
  required?: string;
  validate?: () => any;
}

const ControlDatoVelger = ({name, control, error, required, validate}: ConfirmationPanelProps) =>
  <Controller
    name={name}
    control={control}
    rules={{
      ...(required ? {required} : {}),
      ...(validate ? {validate} : {})
    }}
    render={({ field: { name, value, onChange } }) => (
      <DatoVelger
        id={name}
        name={name}
        label={Texts?.form?.fromDate?.label}
        value={value}
        onChange={onChange}
        error={error}
      />
    )}
  />;

export default ControlDatoVelger;
