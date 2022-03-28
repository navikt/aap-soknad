import React from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './UtenlandsPeriode.module.css';
import DatoVelgerWrapper from '../../../components/input/DatoVelgerWrapper';
import { BodyShort, Button, Heading, Ingress, Modal, Radio } from '@navikt/ds-react';
import { JaEllerNei } from '../../../types/Generic';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import CountrySelector from '../../../components/input/CountrySelector';

interface UtenlandsPeriodeProps {
  getText: GetText;
  onSave: (data: any) => void;
  onCancel: () => void;
  onClose: () => void;
  open: boolean;
  heading: string;
  ingress: string;
}
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
    setValue,
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
        <CountrySelector
          name={'land.value'}
          label={getText('form.utenlandsperiode.land.label')}
          control={control}
          error={errors?.land?.value?.message}
        />
        <DatoVelgerWrapper
          name="fraDato.value"
          label={getText('form.utenlandsperiode.fraDato.label')}
          control={control}
          error={errors.fraDato?.value?.message}
        />
        <DatoVelgerWrapper
          name="tilDato.value"
          label={getText('form.utenlandsperiode.tilDato.label')}
          control={control}
          error={errors.tilDato?.value?.message}
        />
        <RadioGroupWrapper
          name={'iArbeid.value'}
          legend={getText('form.utenlandsperiode.iArbeid.legend')}
          control={control}
          error={errors?.iArbeid?.value?.message}
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
            const isValid = await trigger(['land.value', 'fraDato.value', 'tilDato.value']);
            if (isValid) {
              setValue('land.label', getText('form.utenlandsperiode.land.label'));
              setValue('fraDato.label', getText('form.utenlandsperiode.fraDato.label'));
              setValue('tilDato.label', getText('form.utenlandsperiode.tilDato.label'));
              setValue('iArbeid.label', getText('form.utenlandsperiode.iArbeid.legend'));
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
