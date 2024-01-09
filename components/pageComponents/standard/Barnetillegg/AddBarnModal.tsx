import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
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
import { IntlFormatters, useIntl } from 'react-intl';
import { mapValidationErrorToSøknadValidationError } from 'lib/utils/validationUtils';
import { useFormErrors } from 'hooks/FormErrorHook';
import { v4 as uuid4 } from 'uuid';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  appendManuelleBarn: (barn: ManuelleBarn) => void;
  updateManuelleBarn: (barn: ManuelleBarn) => void;
  showModal: boolean;
  barn: CreateOrUpdateManuelleBarn;
  setBarn: Dispatch<CreateOrUpdateManuelleBarn>;
}

export enum Relasjon {
  FORELDER = 'FORELDER',
  FOSTERFORELDER = 'FOSTERFORELDER',
}

export interface CreateOrUpdateManuelleBarn {
  internId?: string;
  navn?: Navn;
  fødseldato?: Date;
  relasjon?: Relasjon;
}

const ALDER_BARN_ÅR = 18;

export const getAddBarnSchema = (formatMessage: IntlFormatters['formatMessage']) => {
  return yup.object().shape({
    internId: yup.string().optional(),
    navn: yup.object().shape({
      fornavn: yup.string().required(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.validation.required',
        }),
      ),
      etternavn: yup.string().required(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.validation.required',
        }),
      ),
    }),
    fødseldato: yup
      .date()
      .required(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.required',
        }),
      )
      .min(
        sub(new Date(), { years: ALDER_BARN_ÅR }),
        formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.min' }),
      )
      .max(
        add(new Date(), { days: 1 }),
        formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.max' }),
      )
      .typeError(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.typeError',
        }),
      ),
    relasjon: yup
      .string()
      .required(
        formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.relasjon.validation.required' }),
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
  const { formatMessage } = useIntl();
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
    >
      <Modal.Header>
        <Heading size={'medium'} level={'2'}>
          {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.title' })}
        </Heading>
      </Modal.Header>
      <Modal.Body className={classes?.leggTilBarnModalContent}>
        <BodyLong>
          {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.description' })}
        </BodyLong>
        {showModal && (
          <form
            className={classes.modalForm}
            onSubmit={async (formEvent) => {
              formEvent.preventDefault();

              try {
                const result = await getAddBarnSchema(formatMessage).validate(barn, {
                  abortEarly: false,
                });

                if (result?.internId !== undefined) {
                  updateManuelleBarn({ ...result, internId: result.internId });
                } else {
                  appendManuelleBarn({ ...result, internId: uuid4() });
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
              label={formatMessage({
                id: 'søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.label',
              })}
              name={'navn.fornavn'}
              onChange={(event) => {
                clearErrors();
                setBarn({ ...barn, navn: { ...barn.navn, fornavn: event.target.value } });
              }}
              error={findError('navn.fornavn')}
              value={barn.navn?.fornavn || ''}
            />

            <TextField
              label={formatMessage({
                id: 'søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.label',
              })}
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
              label={formatMessage({
                id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.label',
              })}
              name={'fødselsdato'}
              id={'fødselsdato'}
              error={findError('fødseldato')}
              defaultValue={parseFødselsdatoToString()}
              onBlur={(event) => {
                clearErrors();
                setBarn({ ...barn, fødseldato: parseFødselsdato(event) });
              }}
            />

            <RadioGroup
              legend={formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.relasjon.label' })}
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
                  {formatMessage({ id: `answerOptions.relasjon.${Relasjon.FORELDER}` })}
                </BodyShort>
              </Radio>
              <Radio value={Relasjon.FOSTERFORELDER}>
                <BodyShort>
                  {formatMessage({ id: `answerOptions.relasjon.${Relasjon.FOSTERFORELDER}` })}
                </BodyShort>
              </Radio>
            </RadioGroup>

            {barn.relasjon === Relasjon.FORELDER && (
              <Alert variant={'info'}>
                {formatMessage({ id: 'søknad.barnetillegg.alert.leggeVedTekst' })}
                <ul>
                  <li>
                    {formatMessage({ id: 'søknad.barnetillegg.alert.bulletPointVedleggForelder' })}
                  </li>
                </ul>
                {formatMessage({ id: 'søknad.barnetillegg.alert.lasteOppVedleggTekst' })}
              </Alert>
            )}
            {barn.relasjon === Relasjon.FOSTERFORELDER && (
              <Alert variant={'info'}>
                {formatMessage({ id: 'søknad.barnetillegg.alert.leggeVedTekst' })}
                <ul>
                  <li>
                    {formatMessage({
                      id: 'søknad.barnetillegg.alert.bulletPointVedleggFosterforelder',
                    })}
                  </li>
                </ul>
                {formatMessage({ id: 'søknad.barnetillegg.alert.lasteOppVedleggTekst' })}
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
                {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.buttons.avbryt' })}
              </Button>
              <Button type={'submit'}>
                {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.buttons.lagre' })}
              </Button>
            </ModalButtonWrapper>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
};
