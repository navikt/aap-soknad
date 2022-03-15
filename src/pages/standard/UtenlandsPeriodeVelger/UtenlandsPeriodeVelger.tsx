import React from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './UtenlandsPeriode.module.css';
import SelectWrapper from '../../../components/input/SelectWrapper';
import DatoVelgerWrapper from '../../../components/input/DatoVelgerWrapper';
import { BodyShort, Button, Heading, Ingress, Modal, Radio } from '@navikt/ds-react';
import { JaEllerNei } from '../../../types/Generic';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';

interface UtenlandsPeriodeProps {
  getText: GetText;
  onSave: (data: any) => void;
  onCancel: () => void;
  onClose: () => void;
  options: string[][];
  open: boolean;
  heading: string;
  ingress: string;
}
export type UtenlandsPeriode = {
  land: string;
  tilDato: Date;
  fraDato: Date;
  iArbeid: boolean;
};
const initFieldVals: FieldValues = {
  land: '',
  fraDato: undefined,
  tilDato: undefined,
  iArbeid: false,
};
const UtenlandsPeriodeVelger = ({
  getText,
  onSave,
  onCancel,
  onClose,
  options,
  open,
  heading,
  ingress,
}: UtenlandsPeriodeProps) => {
  const schema = yup.object().shape({
    land: yup
      .string()
      .required(getText('form.utenlandsperiode.land.required'))
      .notOneOf(['none'], getText('form.utenlandsperiode.land.required')),
    fraDato: yup.date().required(getText('form.utenlandsperiode.fraDato.required')),
    tilDato: yup
      .date()
      .required(getText('form.utenlandsperiode.tilDato.required'))
      .when(
        'fromDate',
        (fromDate, yup) =>
          fromDate && yup.min(fromDate, getText('form.utenlandsperiode.tilDato.etterFraDato'))
      ),
  });
  const {
    control,
    formState: { errors },
    getValues,
    _getFieldState,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ...initFieldVals },
  });
  return (
    <Modal open={open} onClose={onClose} className={classes.utenlandsPeriodeVelger}>
      <Modal.Content>
        <Heading size={'small'} level={'2'}>
          {heading}
        </Heading>
        <Ingress>{ingress}</Ingress>
        <SelectWrapper
          name={'land'}
          label={getText('form.utenlandsperiode.land.label')}
          control={control}
          error={errors?.land?.message}
        >
          {[
            <option key="none" value="none">
              Velg land
            </option>,
            ...options.map(([key, val]) => (
              <option key={key} value={`${key}:${val}`}>
                {val}
              </option>
            )),
          ]}
        </SelectWrapper>
        <DatoVelgerWrapper
          name="fraDato"
          label={getText('form.utenlandsperiode.fraDato.label')}
          control={control}
          error={errors.fraDato?.message}
        />
        <DatoVelgerWrapper
          name="tilDato"
          label={getText('form.utenlandsperiode.tilDato.label')}
          control={control}
          error={errors.tilDato?.message}
        />
        <RadioGroupWrapper
          name={'iArbeid'}
          legend={getText('form.utenlandsperiode.iArbeid.legend')}
          control={control}
          error={errors?.iArbeid?.message}
        >
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroupWrapper>
        <Button
          type="button"
          onClick={async () => {
            const isValid = await trigger(['land', 'fraDato', 'tilDato']);
            if (isValid) {
              const data = { ...getValues() };
              console.log('data', data);
              console.log('land', _getFieldState('land'));
              onSave(data);
            }
          }}
        >
          Lagre
        </Button>
        <Button type="button" variant={'secondary'} onClick={() => onCancel()}>
          Avbryt
        </Button>
      </Modal.Content>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;
