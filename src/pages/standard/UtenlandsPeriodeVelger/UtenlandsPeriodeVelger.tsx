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
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

export enum ArbeidEllerBodd {
  ARBEID = 'ARBEID',
  BODD = 'BODD',
}
interface UtenlandsPeriodeProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  onClose: () => void;
  open: boolean;
  arbeidEllerBodd: ArbeidEllerBodd;
}
const initFieldVals: FieldValues = {
  land: '',
  fraDato: undefined,
  tilDato: undefined,
  iArbeid: false,
};
const UtenlandsPeriodeVelger = ({
  onSave,
  onCancel,
  onClose,
  open,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const { formatMessage } = useFeatureToggleIntl();
  const schema = yup.object().shape({
    land: yup
      .string()
      .required(formatMessage('søknad.medlemskap.utenlandsperiode.modal.land.validation.required'))
      .notOneOf(
        ['none'],
        formatMessage('søknad.medlemskap.utenlandsperiode.modal.land.validation.required')
      ),
    fraDato: yup
      .date()
      .required(
        formatMessage(
          'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.validation.required'
        )
      ),
    tilDato: yup
      .date()
      .required(
        formatMessage(
          'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.required'
        )
      )
      .min(
        yup.ref('fraDato'),
        formatMessage(
          'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.fraDatoEtterTilDato'
        )
      ),
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
          {formatMessage('søknad.medlemskap.utenlandsperiode.modal.title')}
        </Heading>
        <Ingress>
          {formatMessage(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`)}
        </Ingress>
        <form
          onSubmit={handleSubmit((data) => {
            onSave(data);
            clearModal();
          })}
        >
          <CountrySelector
            name={'land'}
            label={formatMessage(
              `søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`
            )}
            control={control}
            error={errors?.land?.message}
          />
          <div>
            <Label>
              {formatMessage(
                `søknad.medlemskap.utenlandsperiode.modal.periode.label.${arbeidEllerBodd}`
              )}
            </Label>
            <Grid>
              <Cell xs={5}>
                <DatoVelgerWrapper
                  name="fraDato"
                  label={formatMessage(
                    'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label'
                  )}
                  control={control}
                  error={errors.fraDato?.message}
                />
              </Cell>
              <Cell xs={5}>
                <DatoVelgerWrapper
                  name="tilDato"
                  label={formatMessage(
                    'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label'
                  )}
                  control={control}
                  error={errors.tilDato?.message}
                />
              </Cell>
            </Grid>
          </div>
          {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
            <RadioGroupWrapper
              name={'iArbeid'}
              legend={formatMessage('søknad.medlemskap.utenlandsperiode.modal.iArbeid.label')}
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
              label={formatMessage('søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label')}
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
                {formatMessage('søknad.medlemskap.utenlandsperiode.modal.buttons.avbryt')}
              </Button>
            </Cell>
            <Cell xs={5}>
              <Button>
                {formatMessage('søknad.medlemskap.utenlandsperiode.modal.buttons.lagre')}
              </Button>
            </Cell>
          </Grid>
        </form>
      </Modal.Content>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;
