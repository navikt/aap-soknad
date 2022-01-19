import {Controller} from "react-hook-form";
import DatoVelger from "../datovelger";
import React from "react";


export interface DatoVelgerProps {
  name: string;
  label: string;
  control: any;
  error?: string;
  required?: string;
  validate?: () => any;
}

const ControlDatoVelger = ({name, label, control, error}: DatoVelgerProps) =>
  <Controller
    name={name}
    control={control}
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
