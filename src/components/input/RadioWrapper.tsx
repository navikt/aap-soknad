import { Radio, RadioGroup } from '@navikt/ds-react';

type InputRadioType = {
  register: any;
  value: string | boolean;
  noekkel: string;
  getText: Function;
  onChange?: Function;
};

const InputRadio = ({
  register,
  value,
  noekkel,
  getText,
  onChange,
}: InputRadioType): JSX.Element => (
  <Radio {...register(noekkel)} value={value} onChange={onChange}>
    {getText(`form.${noekkel}.${value}`)}
  </Radio>
);

type RadioGruppeType = {
  groupKey: string;
  getText: Function;
  error: Object;
  children: JSX.Element[];
};

const RadioGruppe = ({ groupKey, getText, error, children }: RadioGruppeType): JSX.Element => {
  const labelTekst = getText(`form.${groupKey}.label`);

  return (
    <RadioGroup legend={labelTekst} name={groupKey} error={error}>
      {children}
    </RadioGroup>
  );
};

export { RadioGruppe, InputRadio };
