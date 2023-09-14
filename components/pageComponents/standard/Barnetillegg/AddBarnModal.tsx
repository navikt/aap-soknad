import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Ingress,
  Modal,
  Radio,
  RadioGroup,
  ReadMore,
  TextField,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import React, { Dispatch } from 'react';
import { ManuelleBarn, Soknad } from 'types/Soknad';

import * as yup from 'yup';
import * as classes from './Barnetillegg.module.css';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { GRUNNBELØP } from './Barnetillegg';

import { add, format, isValid, parse, sub } from 'date-fns';
import { IntlFormatters, useIntl } from 'react-intl';
import { validate } from '../../../../lib/utils/validationUtils';
import { useFormErrors } from '../../../../hooks/useFormErrors';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  showModal: boolean;
  barn: ManuelleBarn;
  setBarn: Dispatch<ManuelleBarn>;
}

export enum Relasjon {
  FORELDER = 'FORELDER',
  FOSTERFORELDER = 'FOSTERFORELDER',
}

const ALDER_BARN_ÅR = 18;

export const getAddBarnSchema = (formatMessage: IntlFormatters['formatMessage']) => {
  return yup.object().shape({
    navn: yup.object().shape({
      fornavn: yup.string().required(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.validation.required',
        })
      ),
      etternavn: yup.string().required(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.validation.required',
        })
      ),
    }),
    fødseldato: yup
      .date()
      .required(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.required',
        })
      )
      .min(
        sub(new Date(), { years: ALDER_BARN_ÅR }),
        formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.min' })
      )
      .max(
        add(new Date(), { days: 1 }),
        formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.max' })
      )
      .typeError(
        formatMessage({
          id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.typeError',
        })
      ),
    relasjon: yup
      .string()
      .required(
        formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.relasjon.validation.required' })
      )
      .oneOf([Relasjon.FORELDER, Relasjon.FOSTERFORELDER])
      .nullable(),
    harInntekt: yup
      .string()
      .nullable()
      .required(
        formatMessage(
          { id: 'søknad.barnetillegg.leggTilBarn.modal.harInntekt.validation.required' },
          {
            grunnbeløp: GRUNNBELØP,
          }
        )
      )
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });
};

export const AddBarnModal = ({ showModal, onCloseClick, onSaveClick, barn, setBarn }: Props) => {
  const { formatMessage } = useIntl();
  const { setErrors, findError, clearErrors } = useFormErrors();

  const parseFødselsdato = (event: React.FocusEvent<HTMLInputElement>) =>
    parse(event.target.value, 'dd.MM.yyyy', new Date());

  const parseFødselsdatoToString = () =>
    barn.fødseldato && isValid(barn.fødseldato) ? format(barn.fødseldato, 'dd.MM.yyyy') : '';

  return (
    <Modal
      open={showModal}
      onClose={() => {
        onCloseClick();
      }}
    >
      <Modal.Content className={classes.leggTilBarnModalContent}>
        <Heading size={'medium'} level={'2'}>
          {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.title' })}
        </Heading>
        <Ingress>
          {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.description' })}
        </Ingress>
        <form
          className={classes.modalForm}
          onSubmit={async (formEvent) => {
            formEvent.preventDefault();
            const errors = await validate(getAddBarnSchema(formatMessage), barn);
            if (errors) {
              setErrors(errors);
            } else {
              onSaveClick(barn);
              onCloseClick();
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
            label={formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.modal.fødselsdato.label' })}
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
          <RadioGroup
            legend={formatMessage(
              { id: 'søknad.barnetillegg.leggTilBarn.modal.harInntekt.label' },
              {
                grunnbeløp: GRUNNBELØP,
              }
            )}
            name={'harInntekt'}
            onChange={(value) => {
              clearErrors();
              setBarn({ ...barn, harInntekt: value });
            }}
            value={barn.harInntekt || ''}
            error={findError('harInntekt')}
          >
            <ReadMore
              header={formatMessage({
                id: 'søknad.barnetillegg.leggTilBarn.modal.harInntekt.readMore.title',
              })}
            >
              {formatMessage(
                { id: 'søknad.barnetillegg.leggTilBarn.modal.harInntekt.readMore.text' },
                {
                  grunnbeløp: GRUNNBELØP,
                }
              )}
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>
                {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.JA}` })}
              </BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>
                {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.NEI}` })}
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
      </Modal.Content>
    </Modal>
  );
};
