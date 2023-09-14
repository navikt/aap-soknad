import React, { Dispatch, useState } from 'react';
import * as yup from 'yup';
import * as classes from './UtenlandsPeriode.module.css';
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HGrid,
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

export interface UtenlandsPeriodeProps {
  utenlandsPeriode: UtenlandsPeriode;
  setUtenlandsPeriode: Dispatch<UtenlandsPeriode>;
  closeModal: () => void;
  onBeforeClose: () => void;
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
  setUtenlandsPeriode,
  isOpen,
  closeModal,
  onBeforeClose,
  onSave,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const { formatMessage } = useIntl();

  const antallÅrTilbake = arbeidEllerBodd === ArbeidEllerBodd.ARBEID ? 5 : 60;
  const landKode = utenlandsPeriode?.land?.split(':')?.[0];
  const showUtenlandsId = ['GB', 'CH', 'IM', 'JE'].includes(landKode || '') || eeaMember(landKode);

  const clearErrors = () => setErrors(undefined);

  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;

  return (
    <Modal open={isOpen} onBeforeClose={onBeforeClose} onClose={closeModal}>
      <Modal.Header>
        <Heading size={'medium'} level={'3'} spacing>
          {formatMessage({
            id: `søknad.medlemskap.utenlandsperiode.modal.title.${arbeidEllerBodd}`,
          })}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes.utenlandsPeriodeVelger}>
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
        {isOpen && (
          <form
            className={classes.modalForm}
            onSubmit={async (e) => {
              e.preventDefault();
              const validationSchema = getUtenlandsPeriodeSchema(formatMessage, arbeidEllerBodd);
              const validationErrors = await validate(validationSchema, utenlandsPeriode);

              if (validationErrors) {
                setErrors(validationErrors);
              } else {
                onSave(utenlandsPeriode);
                onBeforeClose();
                closeModal();
              }
            }}
          >
            <CountrySelector
              className={classes.countrySelector}
              name={'land'}
              value={utenlandsPeriode?.land || ''}
              label={formatMessage({
                id: `søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`,
              })}
              onChange={(e) => {
                clearErrors();
                setUtenlandsPeriode({ ...utenlandsPeriode, land: e.target.value });
              }}
              error={findError('land')}
            />
            <div>
              <Label>
                {formatMessage({
                  id: `søknad.medlemskap.utenlandsperiode.modal.periode.label.${arbeidEllerBodd}`,
                })}
              </Label>
              <HGrid columns={2}>
                <MonthPickerWrapper
                  id="fraDato"
                  selectedDate={utenlandsPeriode.fraDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(dato) => {
                    clearErrors();
                    setUtenlandsPeriode({ ...utenlandsPeriode, fraDato: dato });
                  }}
                  error={findError('fraDato')}
                />
                <MonthPickerWrapper
                  id="tilDato"
                  selectedDate={utenlandsPeriode?.tilDato}
                  label={formatMessage({
                    id: 'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label',
                  })}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(dato) => {
                    clearErrors();
                    setUtenlandsPeriode({ ...utenlandsPeriode, tilDato: dato });
                  }}
                  error={findError('tilDato')}
                />
              </HGrid>
            </div>
            {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
              <RadioGroup
                name={'iArbeid'}
                legend={formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.modal.iArbeid.label',
                })}
                onChange={(value) => {
                  clearErrors();
                  setUtenlandsPeriode({ ...utenlandsPeriode, iArbeid: value });
                }}
                value={utenlandsPeriode?.iArbeid || ''}
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
                value={utenlandsPeriode?.utenlandsId || ''}
                onChange={(e) => {
                  clearErrors();
                  setUtenlandsPeriode({ ...utenlandsPeriode, utenlandsId: e.target.value });
                }}
                error={findError('utenlandsId')}
              />
            )}
            <ModalButtonWrapper>
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onBeforeClose();
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
        )}
      </Modal.Body>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;
