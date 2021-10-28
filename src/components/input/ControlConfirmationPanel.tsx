import {Controller} from "react-hook-form";
import {ConfirmationPanel} from "@navikt/ds-react";
import {utland as Texts} from "../../texts/nb.json";
import React from "react";

export interface ConfirmationPanelProps {
  control: any;
  error: string;
}
const ControlConfirmationPanel = ({control, error}: ConfirmationPanelProps) =>
  (<Controller
    name="confirmationPanel"
    control={control}
    rules={{
      required: "Kryss av for å bekrefte",
    }}
    render={({field: {name, value, onChange}}) => (
      <ConfirmationPanel
        id={name}
        name={name}
        label={Texts?.form?.confirmationPanel?.label}
        checked={value}
        onChange={onChange}
        error={error}
      />
    )}
  />);

export default ControlConfirmationPanel;
