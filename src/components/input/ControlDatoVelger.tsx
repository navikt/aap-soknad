import {Controller} from "react-hook-form";
import DatoVelger from "../datovelger";
import React from "react";


export interface DatoVelgerProps {
  name: string;
  label: string;
  control: any;
  error: string;
  required?: string;
  validate?: () => any;
}

const ControlDatoVelger = ({name, label, control, error, required, validate}: DatoVelgerProps) =>
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
        label={label}
        value={value}
        onChange={onChange}
        error={error}
      />
    )}
  />;

export default ControlDatoVelger;
