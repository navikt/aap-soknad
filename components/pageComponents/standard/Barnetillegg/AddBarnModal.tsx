import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Ingress,
  Modal,
  Radio,
  ReadMore,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import React, { useEffect } from 'react';
import { Soknad, ManuelleBarn } from 'types/Soknad';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as classes from './Barnetillegg.module.css';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { GRUNNBELØP } from './Barnetillegg';

import { add, sub, subYears } from 'date-fns';
import { formatDate } from 'utils/date';
import { DatePickerWrapper } from '../../../input/DatePickerWrapper/DatePickerWrapper';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  showModal: boolean;
  barn?: ManuelleBarn;
}

export enum Relasjon {
  FORELDER = 'FORELDER',
  FOSTERFORELDER = 'FOSTERFORELDER',
}

const NAVN = 'navn';

const ALDER_BARN_ÅR = 18;

export const getAddBarnSchema = (formatMessage: (id: string, options?: {}) => string) => {
  return yup.object().shape({
    [NAVN]: yup.object().shape({
      fornavn: yup
        .string()
        .required(
          formatMessage('søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.validation.required')
        ),
      etternavn: yup
        .string()
        .required(
          formatMessage('søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.validation.required')
        ),
    }),
    fødseldato: yup
      .date()
      .required(
        formatMessage('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.required')
      )
      .min(
        sub(new Date(), { years: ALDER_BARN_ÅR }),
        formatMessage('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.min')
      )
      .max(
        add(new Date(), { days: 1 }),
        formatMessage('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.validation.max')
      ),
    relasjon: yup
      .string()
      .required(formatMessage('søknad.barnetillegg.leggTilBarn.modal.relasjon.validation.required'))
      .oneOf([Relasjon.FORELDER, Relasjon.FOSTERFORELDER])
      .nullable(),
    harInntekt: yup
      .string()
      .nullable()
      .required(
        formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.validation.required', {
          grunnbeløp: GRUNNBELØP,
        })
      )
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
  });
};

export const AddBarnModal = ({ showModal, onCloseClick, onSaveClick, barn }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const { control, handleSubmit, setValue, reset, watch } = useForm<FieldValues>({
    resolver: yupResolver(getAddBarnSchema(formatMessage)),
    defaultValues: {
      ...(barn
        ? {
            ...barn,
            fødseldato: formatDate(barn.fødseldato, 'yyyy-MM-dd'),
          }
        : {}),
    },
  });

  const barnepensjon = watch('barnepensjon');
  const relasjon = watch('relasjon');

  useEffect(() => {
    if (barnepensjon === JaEllerNei.JA) setValue('harInntekt', undefined);
  }, [barnepensjon]);

  useEffect(() => {
    reset({ ...barn, fødseldato: formatDate(barn?.fødseldato, 'yyyy-MM-dd') });
  }, [barn, showModal, reset]);

  return (
    <Modal
      open={showModal}
      onClose={() => {
        onCloseClick();
      }}
    >
      <Modal.Content className={classes?.leggTilBarnModalContent}>
        <Heading size={'medium'} level={'2'}>
          {formatMessage('søknad.barnetillegg.leggTilBarn.modal.title')}
        </Heading>
        <Ingress>{formatMessage('søknad.barnetillegg.leggTilBarn.modal.description')}</Ingress>
        <form
          className={classes?.modalForm}
          onSubmit={handleSubmit((data) => {
            onSaveClick(data);
          })}
        >
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.label')}
            name={'navn.fornavn'}
          />

          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.label')}
            name={'navn.etternavn'}
          />

          <DatePickerWrapper
            control={control}
            label={formatMessage('søknad.barnetillegg.leggTilBarn.modal.fødselsdato.label')}
            selectedDate={barn?.fødseldato}
            name="fødseldato"
            fromDate={subYears(new Date(), ALDER_BARN_ÅR)}
            toDate={new Date()}
          />

          <RadioGroupWrapper
            control={control}
            legend={formatMessage('søknad.barnetillegg.leggTilBarn.modal.relasjon.label')}
            name={'relasjon'}
          >
            <Radio value={Relasjon.FORELDER}>
              <BodyShort>{formatMessage(`answerOptions.relasjon.${Relasjon.FORELDER}`)}</BodyShort>
            </Radio>
            <Radio value={Relasjon.FOSTERFORELDER}>
              <BodyShort>
                {formatMessage(`answerOptions.relasjon.${Relasjon.FOSTERFORELDER}`)}
              </BodyShort>
            </Radio>
          </RadioGroupWrapper>
          <RadioGroupWrapper
            control={control}
            legend={formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.label', {
              grunnbeløp: GRUNNBELØP,
            })}
            name={'harInntekt'}
          >
            <ReadMore
              header={formatMessage(
                'søknad.barnetillegg.leggTilBarn.modal.harInntekt.readMore.title'
              )}
            >
              {formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.readMore.text', {
                grunnbeløp: GRUNNBELØP,
              })}
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.JA}`)}</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.NEI}`)}</BodyShort>
            </Radio>
          </RadioGroupWrapper>

          {relasjon === Relasjon.FORELDER && (
            <Alert variant={'info'}>
              {formatMessage('søknad.barnetillegg.alert.leggeVedTekst')}
              <ul>
                <li>{formatMessage('søknad.barnetillegg.alert.bulletPointVedleggForelder')}</li>
              </ul>
              {formatMessage('søknad.barnetillegg.alert.lasteOppVedleggTekst')}
            </Alert>
          )}
          {relasjon === Relasjon.FOSTERFORELDER && (
            <Alert variant={'info'}>
              {formatMessage('søknad.barnetillegg.alert.leggeVedTekst')}
              <ul>
                <li>
                  {formatMessage('søknad.barnetillegg.alert.bulletPointVedleggFosterforelder')}
                </li>
              </ul>
              {formatMessage('søknad.barnetillegg.alert.lasteOppVedleggTekst')}
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
              {formatMessage('søknad.barnetillegg.leggTilBarn.modal.buttons.avbryt')}
            </Button>
            <Button type={'submit'}>
              {formatMessage('søknad.barnetillegg.leggTilBarn.modal.buttons.lagre')}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
