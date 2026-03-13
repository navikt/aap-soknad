'use client';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  Modal,
  Radio,
  RadioGroup,
  TextField,
} from '@navikt/ds-react';
import React, { Dispatch } from 'react';
import { ManuelleBarn, Navn, Soknad } from 'types/Soknad';

import * as yup from 'yup';
import { ValidationError } from 'yup';
import * as classes from './Barnetillegg.module.css';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';

import { add, format, isValid, parse, sub } from 'date-fns';
import { useTranslations } from 'next-intl';
import { mapValidationErrorToSøknadValidationError } from 'lib/utils/validationUtils';
import { useFormErrors } from 'hooks/FormErrorHook';
import { erGyldigFødselsnummer } from 'lib/utils/fnr';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  appendManuelleBarn: (barn: ManuelleBarn) => void;
  updateManuelleBarn: (barn: ManuelleBarn) => void;
  showModal: boolean;
  barn: CreateOrUpdateManuelleBarn;
  setBarn: Dispatch<CreateOrUpdateManuelleBarn>;
}

export { Relasjon } from './barnetillegg.schema';
import { Relasjon } from './barnetillegg.schema';

export interface CreateOrUpdateManuelleBarn {
  internId?: string;
  navn?: Navn;
  fødseldato?: Date;
  relasjon?: Relasjon;
  fnr?: string;
  ukjentFnr?: boolean;
}

const ALDER_BARN_ÅR = 18;

export const getAddBarnSchema = (t: (id: string, values?: Record<string, any>) => string) => {
  return yup.object().shape({
    internId: yup.string().optional(),
    navn: yup.object().shape({
      fornavn: yup.string().required(
        t('søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.validation.required'),
      ),
      etternavn: yup.string().required(
        t('søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.validation.required'),
      ),
    }),
    fødseldato: yup
      .date()
      .required(
        t('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.required'),
      )
      .min(
        sub(new Date(), { years: ALDER_BARN_ÅR }),
        t('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.min'),
      )
      .max(
        add(new Date(), { days: 1 }),
        t('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.max'),
      )
      .typeError(
        t('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.typeError'),
      ),
    fnr: yup.string().when('ukjentFnr', {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) =>
        schema
          .required(
            t('søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.validation.required'),
          )
          .matches(
            /\d{11}/,
            t('søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.validation.matches'),
          )
          .test(
            'valid-format',
            t('søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.validation.valid'),
            erGyldigFødselsnummer,
          ),
    }),
    ukjentFnr: yup.boolean().notRequired(),
    relasjon: yup
      .string()
      .required(
        t('søknad.barnetillegg.leggTilBarn.modal.relasjon.validation.required'),
      )
      .oneOf([Relasjon.FORELDER, Relasjon.FOSTERFORELDER]),
  });
};

export const AddBarnModal = ({
  showModal,
  onCloseClick,
  appendManuelleBarn,
  updateManuelleBarn,
  barn,
  setBarn,
}: Props) => {
  const t = useTranslations();
  const { setErrors, findError, clearErrors } = useFormErrors();

  const parseFødselsdato = (event: React.FocusEvent<HTMLInputElement>) =>
    parse(event.target.value, 'dd.MM.yyyy', new Date());

  const parseFødselsdatoToString = () => {
    if (!barn.fødseldato) {
      return '';
    }
    if (isValid(barn.fødseldato)) {
      return format(barn.fødseldato, 'dd.MM.yyyy');
    }
    // når dato leses fra mellomlagring er det en string
    const fødselsdato = new Date(barn.fødseldato);
    return isValid(fødselsdato) ? format(new Date(barn.fødseldato), 'dd.MM.yyyy') : '';
  };

  return (
    <Modal
      open={showModal}
      onClose={() => {
        clearErrors();
        onCloseClick();
      }}
      aria-label={t('søknad.barnetillegg.leggTilBarn.modal.title')}
    >
      <Modal.Header>
        <Heading size={'medium'} level={'2'}>
          {t('søknad.barnetillegg.leggTilBarn.modal.title')}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes?.leggTilBarnModalContent}>
        <BodyLong>
          {t('søknad.barnetillegg.leggTilBarn.modal.description')}
        </BodyLong>
        {showModal && (
          <form
            className={classes.modalForm}
            onSubmit={async (formEvent) => {
              formEvent.preventDefault();

              try {
                const result = await getAddBarnSchema(t).validate(barn, {
                  abortEarly: false,
                });

                if (result?.internId !== undefined) {
                  updateManuelleBarn({
                    ...result,
                    internId: result.internId,
                    fnr: result.fnr ?? undefined,
                  });
                } else {
                  appendManuelleBarn({
                    ...result,
                    internId: crypto.randomUUID(),
                    fnr: result.fnr ?? undefined,
                  });
                }
                clearErrors();
                onCloseClick();
              } catch (e) {
                if (e instanceof ValidationError) {
                  const errors = e.inner.map(mapValidationErrorToSøknadValidationError);
                  setErrors(errors);
                }
              }
            }}
          >
            <TextField
              label={t('søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.label')}
              name={'navn.fornavn'}
              onChange={(event) => {
                clearErrors();
                setBarn({ ...barn, navn: { ...barn.navn, fornavn: event.target.value } });
              }}
              error={findError('navn.fornavn')}
              value={barn.navn?.fornavn || ''}
            />

            <TextField
              label={t('søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.label')}
              name={'navn.etternavn'}
              onChange={(event) => {
                clearErrors();
                setBarn({ ...barn, navn: { ...barn.navn, etternavn: event.target.value } });
              }}
              error={findError('navn.etternavn')}
              value={barn.navn?.etternavn || ''}
            />

            <TextField
              className={classes.foedselsdatoInput}
              label={t('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.label')}
              name={'fødselsdato'}
              id={'fødselsdato'}
              error={findError('fødseldato')}
              defaultValue={parseFødselsdatoToString()}
              onBlur={(event) => {
                clearErrors();
                setBarn({ ...barn, fødseldato: parseFødselsdato(event) });
              }}
            />

            <div>
              {!barn.ukjentFnr && (
                <TextField
                  label={t('søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.label')}
                  name={'fnr'}
                  id="fnr"
                  value={barn?.fnr}
                  onChange={(event) => {
                    clearErrors();
                    setBarn({ ...barn, fnr: event.target.value });
                  }}
                  error={findError('fnr')}
                  disabled={barn.ukjentFnr}
                />
              )}

              <Checkbox
                id="ukjentFnr"
                name="ukjentFnr"
                checked={barn?.ukjentFnr}
                onClick={(event) => {
                  clearErrors();
                  setBarn({
                    ...barn,
                    fnr: undefined,
                    ukjentFnr: (event.target as HTMLInputElement).checked,
                  });
                }}
              >
                {t('søknad.barnetillegg.leggTilBarn.modal.ukjentFnr.label')}
              </Checkbox>
            </div>

            {barn.ukjentFnr && (
              <Alert variant="info">
                {t('søknad.barnetillegg.leggTilBarn.modal.ukjentFnr.warning')}
              </Alert>
            )}

            <RadioGroup
              legend={t('søknad.barnetillegg.leggTilBarn.modal.relasjon.label')}
              name={'relasjon'}
              onChange={(value) => {
                clearErrors();
                setBarn({ ...barn, relasjon: value });
              }}
              value={barn.relasjon || ''}
              error={findError('relasjon')}
            >
              <Radio value={Relasjon.FORELDER}>
                <BodyShort>
                  {t(`answerOptions.relasjon.${Relasjon.FORELDER}`)}
                </BodyShort>
              </Radio>
              <Radio value={Relasjon.FOSTERFORELDER}>
                <BodyShort>
                  {t(`answerOptions.relasjon.${Relasjon.FOSTERFORELDER}`)}
                </BodyShort>
              </Radio>
            </RadioGroup>

            {barn.relasjon === Relasjon.FORELDER && (
              <Alert variant={'info'}>
                {t('søknad.barnetillegg.alert.leggeVedTekst')}
                <ul>
                  <li>
                    {t('søknad.barnetillegg.alert.bulletPointVedleggForelder')}
                  </li>
                </ul>
                {t('søknad.barnetillegg.alert.lasteOppVedleggTekst')}
              </Alert>
            )}
            {barn.relasjon === Relasjon.FOSTERFORELDER && (
              <Alert variant={'info'}>
                {t('søknad.barnetillegg.alert.leggeVedTekst')}
                <ul>
                  <li>
                    {t('søknad.barnetillegg.alert.bulletPointVedleggFosterforelder')}
                  </li>
                </ul>
                {t('søknad.barnetillegg.alert.lasteOppVedleggTekst')}
              </Alert>
            )}
            <ModalButtonWrapper>
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  clearErrors();
                  onCloseClick();
                }}
              >
                {t('søknad.barnetillegg.leggTilBarn.modal.buttons.avbryt')}
              </Button>
              <Button type={'submit'}>
                {t('søknad.barnetillegg.leggTilBarn.modal.buttons.lagre')}
              </Button>
            </ModalButtonWrapper>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
};
