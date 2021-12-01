import { Control, Controller } from "react-hook-form";
import { Radio, Select } from "@navikt/ds-react";
import React from "react";

interface RadioProps {
  name: string;
  label: string;
  control: Control;
}

const ControlRadio = ({ name, label, control }: RadioProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, value, onChange } }) => (
      <Radio name={name} value={value} onChange={onChange}>
        {label}
      </Radio>
    )}
  />
);

export { ControlRadio };
