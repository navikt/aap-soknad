import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './UtenlandsPeriode.module.css';
import {
  BodyLong,
  BodyShort,
  Button,
  Cell,
  Grid,
  Heading,
  Label,
  Modal,
  Radio,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import CountrySelector from 'components/input/CountrySelector';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { UtenlandsPeriode } from 'types/Soknad';
import { MonthPickerWrapper } from 'components/input/MonthPickerWrapper/MonthPickerWrapper';
import { subYears } from 'date-fns';
import { useIntl } from 'react-intl';

const { eeaMember } = require('is-european');

export enum ArbeidEllerBodd {
  ARBEID = 'ARBEID',
  BODD = 'BODD',
}

interface UtenlandsPeriodeProps {
  utenlandsPeriode?: UtenlandsPeriode;
  onSave: (data: any) => void;
  onCancel: () => void;
  onClose: () => void;
  open: boolean;
  arbeidEllerBodd: ArbeidEllerBodd;
}

export const getUtenlandsPeriodeSchema = (
  formatMessage: any,
  arbeidEllerBodd = ArbeidEllerBodd.BODD
) => {
  return yup.object().shape({
    land: yup
      .string()
      .required(
        formatMessage({ id: 'søknad.medlemskap.utenlandsperiode.modal.land.validation.required' })
      )
      .notOneOf(
        ['none'],
        formatMessage({ id: 'søknad.medlemskap.utenlandsperiode.modal.land.validation.required' })
      ),
    fraDato: yup
      .date()
      .required(
        formatMessage({
          id: 'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.validation.required',
        })
      )
      .nullable(),
    tilDato: yup
      .date()
      .required(
        formatMessage({
          id: 'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.required',
        })
      )
      .min(
        yup.ref('fraDato'),
        formatMessage({
          id: 'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.fraDatoEtterTilDato',
        })
      )
      .nullable(),
    iArbeid: yup.string().when('arbeidEllerBodd', ([], schema) => {
      if (arbeidEllerBodd === ArbeidEllerBodd.BODD) {
        return yup
          .string()
          .required(
            formatMessage({
              id: 'søknad.medlemskap.utenlandsperiode.modal.iArbeid.validation.required',
            })
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable();
      }
      return schema;
    }),
    utenlandsId: yup.string().optional(),
  });
};

const UtenlandsPeriodeVelger = ({
  utenlandsPeriode,
  onSave,
  onCancel,
  onClose,
  open,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const { formatMessage } = useIntl();

  const schema = getUtenlandsPeriodeSchema(formatMessage, arbeidEllerBodd);

  const {
    control,
    watch,
    formState: { errors },
    reset,
    handleSubmit,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(utenlandsPeriode
        ? {
            ...utenlandsPeriode,
            land: utenlandsPeriode.land,
            fraDato: utenlandsPeriode.fraDato,
            tilDato: utenlandsPeriode.tilDato,
            arbeidEllerBodd: arbeidEllerBodd,
          }
        : {}),
    },
  });

  useEffect(() => {
    reset({
      ...utenlandsPeriode,
      fraDato: utenlandsPeriode?.fraDato,
      tilDato: utenlandsPeriode?.tilDato,
    });
  }, [utenlandsPeriode, arbeidEllerBodd, open, reset]);

  const antallÅrTilbake = arbeidEllerBodd === ArbeidEllerBodd.ARBEID ? 5 : 60;

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
    setValue('fraDato', null);
    setValue('tilDato', null);
    setValue('iArbeid', '');
    setValue('utenlandsId', '');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Content className={classes.utenlandsPeriodeVelger}>
        <Heading size={'medium'} level={'2'} spacing>
          {formatMessage({
            id: `søknad.medlemskap.utenlandsperiode.modal.title.${arbeidEllerBodd}`,
          })}
        </Heading>
        <BodyLong spacing={!(arbeidEllerBodd === 'BODD')}>
          {formatMessage({
            id: `søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`,
          })}
        </BodyLong>
        {arbeidEllerBodd === 'BODD' && (
          <BodyLong spacing>
            {formatMessage({
              id: `søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}_2`,
            })}
          </BodyLong>
        )}
        <form
          className={classes.modalForm}
          onSubmit={handleSubmit((data) => {
            onSave(data);
            clearModal();
          })}
        >
          <CountrySelector
            className={classes.countrySelector}
            name={'land'}
            label={formatMessage({
              id: `søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`,
            })}
            control={control}
          />
          <div>
            <Label>
              {formatMessage({
                id: `søknad.medlemskap.utenlandsperiode.modal.periode.label.${arbeidEllerBodd}`,
              })}
            </Label>
            <Grid>
              <Cell xs={12} lg={5}>
                <MonthPickerWrapper
                  control={control}
                  name="fraDato"
                  selectedDate={utenlandsPeriode?.fraDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                />
              </Cell>
              <Cell xs={12} lg={5}>
                <MonthPickerWrapper
                  control={control}
                  name="tilDato"
                  selectedDate={utenlandsPeriode?.tilDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                />
              </Cell>
            </Grid>
          </div>
          {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
            <RadioGroupWrapper
              name={'iArbeid'}
              legend={formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.modal.iArbeid.label',
              })}
              control={control}
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
              className={classes.pidInput}
              name={'utenlandsId'}
              label={formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label',
              })}
              control={control}
            />
          )}
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearModal();
                onCancel();
              }}
            >
              {formatMessage({ id: 'søknad.medlemskap.utenlandsperiode.modal.buttons.avbryt' })}
            </Button>

            <Button>
              {formatMessage({ id: 'søknad.medlemskap.utenlandsperiode.modal.buttons.lagre' })}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;
