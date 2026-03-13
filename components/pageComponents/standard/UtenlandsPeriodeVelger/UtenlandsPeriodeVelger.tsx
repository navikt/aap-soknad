'use client';
import React, { Dispatch, useState } from 'react';
import * as yup from 'yup';
import * as classes from './UtenlandsPeriode.module.css';
import {
  BodyLong,
  BodyShort,
  Button,
  ErrorSummary,
  Heading,
  HGrid,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import CountrySelector from 'components/input/countryselector/CountrySelector';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { UtenlandsPeriode } from 'types/Soknad';
import { MonthPickerWrapper } from 'components/input/MonthPickerWrapper/MonthPickerWrapper';
import { subYears } from 'date-fns';
import { useTranslations } from 'next-intl';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { validate } from 'lib/utils/validationUtils';
import { getStartOfMonthInLocalTime, getEndOfMonthInLocalTime } from 'utils/date';

const { eeaMember } = require('is-european');

export enum ArbeidEllerBodd {
  ARBEID = 'ARBEID',
  BODD = 'BODD',
}

export interface UtenlandsPeriodeProps {
  utenlandsPeriode: UtenlandsPeriode;
  setUtenlandsPeriode: Dispatch<UtenlandsPeriode>;
  closeModal: () => void;
  onSave: (utenlandsperiode: UtenlandsPeriode) => void;
  isOpen: boolean;
  arbeidEllerBodd: ArbeidEllerBodd;
}

export const getUtenlandsPeriodeSchema = (
  t: (id: string, values?: Record<string, any>) => string,
  arbeidEllerBodd = ArbeidEllerBodd.BODD,
) => {
  return yup.object().shape({
    land: yup
      .string()
      .required(
        t('søknad.medlemskap.utenlandsperiode.modal.land.validation.required'),
      )
      .notOneOf(
        ['none'],
        t('søknad.medlemskap.utenlandsperiode.modal.land.validation.required'),
      ),
    fraDato: yup
      .date()
      .required(
        t('søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.validation.required'),
      )
      .nullable(),
    tilDato: yup
      .date()
      .required(
        t('søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.required'),
      )
      .min(
        yup.ref('fraDato'),
        t('søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.fraDatoEtterTilDato'),
      )
      .nullable(),
    iArbeid: yup.string().when('arbeidEllerBodd', ([], schema) => {
      if (arbeidEllerBodd === ArbeidEllerBodd.BODD) {
        return yup
          .string()
          .required(
            t('søknad.medlemskap.utenlandsperiode.modal.iArbeid.validation.required'),
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
  onSave,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const t = useTranslations();

  const antallÅrTilbake = arbeidEllerBodd === ArbeidEllerBodd.ARBEID ? 5 : 60;
  const landKode = utenlandsPeriode?.land?.split(':')?.[0];
  const showUtenlandsId = ['GB', 'CH', 'IM', 'JE'].includes(landKode || '') || eeaMember(landKode);

  const clearErrors = () => setErrors(undefined);

  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        clearErrors();
        closeModal();
      }}
      aria-label={t(`søknad.medlemskap.utenlandsperiode.modal.title.${arbeidEllerBodd}`)}
    >
      <Modal.Header>
        <Heading size={'medium'} level={'3'} spacing>
          {t(`søknad.medlemskap.utenlandsperiode.modal.title.${arbeidEllerBodd}`)}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes.utenlandsPeriodeVelger}>
        <BodyLong spacing={!(arbeidEllerBodd === 'BODD')}>
          {t(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`)}
        </BodyLong>
        {arbeidEllerBodd === 'BODD' && (
          <BodyLong spacing>
            {t(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}_2`)}
          </BodyLong>
        )}
        {isOpen && (
          <form
            className={classes.modalForm}
            onSubmit={async (e) => {
              e.preventDefault();
              const validationSchema = getUtenlandsPeriodeSchema(t, arbeidEllerBodd);
              const validationErrors = await validate(validationSchema, utenlandsPeriode);

              if (validationErrors) {
                setErrors(validationErrors);
              } else {
                onSave(utenlandsPeriode);
                clearErrors();
                closeModal();
              }
            }}
          >
            <ErrorSummary
              heading={t('errorSummary.title')}
              aria-hidden={!errors?.length}
              className={errors?.length ? '' : classes?.visuallyHidden}
            >
              {errors?.length
                ? errors.map((error) => {
                    return (
                      <ErrorSummary.Item key={error.path} href={`#${error.path}`}>
                        {error.message}
                      </ErrorSummary.Item>
                    );
                  })
                : 'hidden'}
            </ErrorSummary>
            <CountrySelector
              className={classes.countrySelector}
              name={'land'}
              value={utenlandsPeriode?.land || ''}
              label={t(`søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`)}
              onChange={(e) => {
                clearErrors();
                setUtenlandsPeriode({ ...utenlandsPeriode, land: e.target.value });
              }}
              error={findError('land')}
            />
            <div>
              <Label>
                {t(`søknad.medlemskap.utenlandsperiode.modal.periode.label.${arbeidEllerBodd}`)}
              </Label>
              <HGrid columns={{ xs: 1, md: 2 }} gap="4">
                <MonthPickerWrapper
                  id="fraDato"
                  selectedDate={utenlandsPeriode.fraDato}
                  label={t('søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label')}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(dato) => {
                    clearErrors();
                    setUtenlandsPeriode({
                      ...utenlandsPeriode,
                      fraDato: dato,
                      fraDatoLocalDate: getStartOfMonthInLocalTime(dato),
                    });
                  }}
                  error={findError('fraDato')}
                />
                <MonthPickerWrapper
                  id="tilDato"
                  selectedDate={utenlandsPeriode?.tilDato}
                  label={t('søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label')}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  dropdownCaption={true}
                  onChange={(dato) => {
                    clearErrors();
                    setUtenlandsPeriode({
                      ...utenlandsPeriode,
                      tilDato: dato,
                      tilDatoLocalDate: getEndOfMonthInLocalTime(dato),
                    });
                  }}
                  error={findError('tilDato')}
                />
              </HGrid>
            </div>
            {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
              <RadioGroup
                name={'iArbeid'}
                legend={t('søknad.medlemskap.utenlandsperiode.modal.iArbeid.label')}
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
                label={t('søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label')}
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
                  clearErrors();
                  closeModal();
                }}
              >
                {t('søknad.medlemskap.utenlandsperiode.modal.buttons.avbryt')}
              </Button>

              <Button>
                {t('søknad.medlemskap.utenlandsperiode.modal.buttons.lagre')}
              </Button>
            </ModalButtonWrapper>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;
