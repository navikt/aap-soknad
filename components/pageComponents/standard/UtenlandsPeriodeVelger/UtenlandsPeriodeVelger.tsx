import React, { useMemo, useState } from 'react';
import * as yup from 'yup';
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
  RadioGroup,
  TextField,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import CountrySelector from 'components/input/CountrySelector';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { UtenlandsPeriode } from 'types/Soknad';
import { MonthPickerWrapper } from 'components/input/MonthPickerWrapper/MonthPickerWrapper';
import { subYears } from 'date-fns';
import { IntlFormatters, useIntl } from 'react-intl';
import { SøknadValidationError } from 'components/schema/FormErrorSummaryNew';
import { validate } from 'lib/utils/validationUtils';

const { eeaMember } = require('is-european');

export enum ArbeidEllerBodd {
  ARBEID = 'ARBEID',
  BODD = 'BODD',
}

interface UtenlandsPeriodeProps {
  utenlandsPeriode?: UtenlandsPeriode;
  onSave: () => void;
  update: (data: UtenlandsPeriode) => void;
  onCancel: () => void;
  onClose: () => void;
  open: boolean;
  arbeidEllerBodd: ArbeidEllerBodd;
}

export const getUtenlandsPeriodeSchema = (
  formatMessage: IntlFormatters['formatMessage'],
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
  update,
  onCancel,
  onClose,
  open,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const { formatMessage } = useIntl();

  const schema = getUtenlandsPeriodeSchema(formatMessage, arbeidEllerBodd);
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  function clearErrors() {
    setErrors(undefined);
  }

  function findError(path: string): string | undefined {
    return errors?.find((error) => error.path === path)?.message;
  }

  const antallÅrTilbake = arbeidEllerBodd === ArbeidEllerBodd.ARBEID ? 5 : 60;

  // const valgtLand = watch('land');
  const showUtenlandsId = useMemo(() => {
    const landKode = utenlandsPeriode?.land?.split(':')?.[0];
    return (
      landKode === 'GB' ||
      landKode === 'CH' ||
      landKode === 'IM' ||
      landKode === 'JE' ||
      eeaMember(landKode)
    );
  }, [utenlandsPeriode?.land]);

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
          onSubmit={async (e) => {
            e.preventDefault();
            const errors = await validate(
              getUtenlandsPeriodeSchema(formatMessage),
              utenlandsPeriode
            );
            if (errors) {
              setErrors(errors);
              return;
            } else {
              onSave();
            }
          }}
        >
          <CountrySelector
            name={'land'}
            value={utenlandsPeriode?.land}
            onChange={(e) => {
              clearErrors();
              update({
                ...utenlandsPeriode,
                land: e.target.value,
              } as UtenlandsPeriode);
            }}
            className={classes.countrySelector}
            label={formatMessage({
              id: `søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`,
            })}
            error={findError('land')}
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
                  name="fraDato"
                  selectedDate={utenlandsPeriode?.fraDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(selectedMonth: Date) => {
                    update({
                      ...utenlandsPeriode,
                      fraDato: selectedMonth,
                    } as UtenlandsPeriode);
                  }}
                  error={findError('fraDato')}
                />
              </Cell>
              <Cell xs={12} lg={5}>
                <MonthPickerWrapper
                  name="tilDato"
                  selectedDate={utenlandsPeriode?.fraDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(selectedMonth: Date) => {
                    update({
                      ...utenlandsPeriode,
                      tilDato: selectedMonth,
                    } as UtenlandsPeriode);
                  }}
                  error={findError('tilDato')}
                />
              </Cell>
            </Grid>
          </div>
          {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
            <RadioGroup
              name={'iArbeid'}
              id={'iArbeid'}
              value={utenlandsPeriode?.iArbeid}
              onChange={(value) => {
                update({
                  ...utenlandsPeriode,
                  iArbeid: value,
                } as UtenlandsPeriode);
              }}
              legend={formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.modal.iArbeid.label',
              })}
              error={findError('iArbeid')}
            >
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroup>
          )}
          {showUtenlandsId && (
            <TextField
              className={classes.pidInput}
              name={'utenlandsId'}
              value={utenlandsPeriode?.utenlandsId}
              onChange={(event) => {
                update({
                  ...utenlandsPeriode,
                  utenlandsId: event.target.value,
                } as UtenlandsPeriode);
              }}
              label={formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label',
              })}
            />
          )}
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                // clearModal();
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
