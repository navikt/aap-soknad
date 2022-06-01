import React, { useMemo } from 'react';
const { eeaMember } = require('is-european');
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './UtenlandsPeriode.module.css';
import DatoVelgerWrapper from '../../../components/input/DatoVelgerWrapper';
import {
  Label,
  BodyShort,
  Button,
  Heading,
  Ingress,
  Modal,
  Radio,
  Cell,
  Grid,
} from '@navikt/ds-react';
import { JaEllerNei } from '../../../types/Generic';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import CountrySelector from '../../../components/input/CountrySelector';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';

interface UtenlandsPeriodeProps {
  getText: GetText;
  onSave: (data: any) => void;
  onCancel: () => void;
  onClose: () => void;
  open: boolean;
  hideIArbeid?: boolean;
  heading: string;
  ingress?: string;
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
  hideIArbeid,
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
      .min(yup.ref('fraDato'), getText('form.utenlandsperiode.tilDato.fraDatoEtterTilDato')),
  });
  const {
    control,
    watch,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ...initFieldVals },
  });
  const valgtLand = watch('land');
  const showUtenlandsId = useMemo(() => {
    const landKode = valgtLand?.split(':')?.[0];
    return (
      landKode === 'GB' ||
      landKode === 'CH' ||
      landKode === 'IM' ||
      landKode === 'JE' ||
      eeaMember(landKode)
    );
  }, [valgtLand]);
  const clearModal = () => {
    setValue('land', '');
    setValue('fraDato', undefined);
    setValue('tilDato', undefined);
    setValue('iArbeid', false);
    setValue('utenlandsId', '');
  };
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Content className={classes.utenlandsPeriodeVelger}>
        <Heading size={'medium'} level={'2'}>
          {heading}
        </Heading>
        {ingress && <Ingress>{ingress}</Ingress>}
        <form
          onSubmit={handleSubmit((data) => {
            onSave(data);
            clearModal();
          })}
        >
          <CountrySelector
            name={'land'}
            label={
              hideIArbeid
                ? getText('form.utenlandsperiode.land.labelArbeid')
                : getText('form.utenlandsperiode.land.label')
            }
            control={control}
            error={errors?.land?.message}
          />
          <div>
            <Label>
              {hideIArbeid
                ? getText('form.utenlandsperiode.datoLabelArbeid')
                : getText('form.utenlandsperiode.datoLabel')}
            </Label>
            <Grid>
              <Cell xs={5}>
                <DatoVelgerWrapper
                  name="fraDato"
                  label={getText('form.utenlandsperiode.fraDato.label')}
                  control={control}
                  error={errors.fraDato?.message}
                />
              </Cell>
              <Cell xs={5}>
                <DatoVelgerWrapper
                  name="tilDato"
                  label={getText('form.utenlandsperiode.tilDato.label')}
                  control={control}
                  error={errors.tilDato?.message}
                />
              </Cell>
            </Grid>
          </div>
          {!hideIArbeid && (
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
          )}
          {showUtenlandsId && (
            <TextFieldWrapper
              name={'utenlandsId'}
              label={getText('form.utenlandsperiode.utenlandsId.label')}
              control={control}
            />
          )}
          <Grid>
            <Cell xs={2}>
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  clearModal();
                  onCancel();
                }}
              >
                {getText('form.utenlandsperiode.avbryt')}
              </Button>
            </Cell>
            <Cell xs={5}>
              <Button>{getText('form.utenlandsperiode.lagre')}</Button>
            </Cell>
          </Grid>
        </form>
      </Modal.Content>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;
