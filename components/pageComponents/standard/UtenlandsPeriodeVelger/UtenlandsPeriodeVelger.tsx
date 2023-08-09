import React, { useEffect, useState } from 'react';
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
import { v4 as uuidv4 } from 'uuid';

const { eeaMember } = require('is-european');

export enum ArbeidEllerBodd {
  ARBEID = 'ARBEID',
  BODD = 'BODD',
}

export interface UtenlandsPeriodeProps {
  utenlandsPeriode?: UtenlandsPeriode;
  closeModal: () => void;
  onSave: (utenlandsperiode: UtenlandsPeriode) => void;
  isOpen: boolean;
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
  isOpen,
  closeModal,
  onSave,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const [utenlandsPeriodeState, setUtenlandsPeriodeState] = useState<UtenlandsPeriode>();
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (utenlandsPeriode) {
      setUtenlandsPeriodeState({ ...utenlandsPeriode });
    } else {
      setUtenlandsPeriodeState({ id: uuidv4() });
    }
  }, [utenlandsPeriode, isOpen]);

  function clearErrors() {
    setErrors(undefined);
  }

  function findError(path: string): string | undefined {
    return errors?.find((error) => error.path === path)?.message;
  }

  const antallÅrTilbake = arbeidEllerBodd === ArbeidEllerBodd.ARBEID ? 5 : 60;

  const landKode = utenlandsPeriode?.land?.split(':')?.[0];
  const showUtenlandsId =
    landKode === 'GB' ||
    landKode === 'CH' ||
    landKode === 'IM' ||
    landKode === 'JE' ||
    eeaMember(landKode);

  return (
    <Modal open={isOpen} onClose={closeModal}>
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
              getUtenlandsPeriodeSchema(formatMessage, arbeidEllerBodd),
              utenlandsPeriodeState
            );

            if (errors) {
              setErrors(errors);
              return;
            }

            if (utenlandsPeriodeState) {
              onSave(utenlandsPeriodeState);
            }

            closeModal();
          }}
        >
          <CountrySelector
            className={classes.countrySelector}
            name={'land'}
            value={utenlandsPeriodeState?.land}
            label={formatMessage({
              id: `søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`,
            })}
            onChange={(e) =>
              setUtenlandsPeriodeState((prevState) => ({
                ...prevState,
                land: e.target.value,
              }))
            }
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
                  id="fraDato"
                  selectedDate={utenlandsPeriodeState?.fraDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(date) =>
                    setUtenlandsPeriodeState((prevState) => ({
                      ...prevState,
                      fraDato: date,
                    }))
                  }
                  error={findError('fraDato')}
                />
                <div>{utenlandsPeriodeState?.fraDato?.toString()}</div>
              </Cell>
              <Cell xs={12} lg={5}>
                <MonthPickerWrapper
                  id="tilDato"
                  selectedDate={utenlandsPeriodeState?.tilDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(date) =>
                    setUtenlandsPeriodeState((prevState) => ({
                      ...prevState,
                      tilDato: date,
                    }))
                  }
                  error={findError('tilDato')}
                />
                <div>{utenlandsPeriodeState?.tilDato?.toString()}</div>
              </Cell>
            </Grid>
          </div>
          {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
            <RadioGroup
              name={'iArbeid'}
              legend={formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.modal.iArbeid.label',
              })}
              onChange={(value) =>
                setUtenlandsPeriodeState((prevState) => ({
                  ...prevState,
                  iArbeid: value,
                }))
              }
              value={utenlandsPeriodeState?.iArbeid}
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
              label={formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label',
              })}
              value={utenlandsPeriodeState?.utenlandsId || ''}
              onChange={(e) =>
                setUtenlandsPeriodeState((prevState) => ({
                  ...prevState,
                  utenlandsId: e.target.value,
                }))
              }
              error={findError('utenlandsId')}
            />
          )}
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                closeModal();
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
