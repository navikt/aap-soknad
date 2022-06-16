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
import { JaEllerNei } from '../../../types/Generic';
import React, { useEffect } from 'react';
import Soknad, { Barn } from '../../../types/Soknad';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as classes from './Barnetillegg.module.css';
import { ModalButtonWrapper } from '../../../components/ButtonWrapper/ModalButtonWrapper';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  onDeleteClick: () => void;
  showModal: boolean;
  barn?: Barn;
}

export enum Relasjon {
  FORELDER = 'FORELDER',
  FOSTERFORELDER = 'FOSTERFORELDER',
}

const NAVN = 'navn';

export const validateHarInntekt = (barnepensjon: JaEllerNei) => barnepensjon === JaEllerNei.NEI;

export const AddBarnModal = ({
  showModal,
  onDeleteClick,
  onCloseClick,
  onSaveClick,
  barn,
}: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
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
    fnr: yup
      .string()
      .required(
        formatMessage('søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.validation.required')
      )
      .length(
        11,
        formatMessage(
          'søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.validation.numberCharacters'
        )
      ),
    relasjon: yup
      .string()
      .required(formatMessage('søknad.barnetillegg.leggTilBarn.modal.relasjon.validation.required'))
      .oneOf([Relasjon.FORELDER, Relasjon.FOSTERFORELDER])
      .nullable(),
    barnepensjon: yup
      .string()
      .required(
        formatMessage('søknad.barnetillegg.leggTilBarn.modal.barnepensjon.validation.required')
      )
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
    harInntekt: yup.string().when('barnepensjon', {
      is: validateHarInntekt,
      then: (yupSchema) =>
        yupSchema
          .required(
            formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.validation.required')
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
    }),
  });
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(barn ? barn : {}),
    },
  });

  const barnepensjon = watch('barnepensjon');
  const relasjon = watch('relasjon');

  useEffect(() => {
    if (barnepensjon === JaEllerNei.JA) setValue('harInntekt', undefined);
  }, [barnepensjon]);

  useEffect(() => {
    reset({ ...barn });
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
          onSubmit={handleSubmit((data) => {
            onSaveClick(data);
          })}
        >
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.barnetillegg.leggTilBarn.modal.navn.fornavn.label')}
            name={'navn.fornavn'}
            error={errors?.[NAVN]?.fornavn?.message}
          />

          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.barnetillegg.leggTilBarn.modal.navn.etternavn.label')}
            name={'navn.etternavn'}
            error={errors?.[NAVN]?.etternavn?.message}
          />

          <div className={classes.leggTilBarnFnrInput}>
            <TextFieldWrapper
              control={control}
              label={formatMessage('søknad.barnetillegg.leggTilBarn.modal.fødselsnummer.label')}
              name={'fnr'}
              error={errors?.fnr?.message}
            />
          </div>

          <RadioGroupWrapper
            control={control}
            legend={formatMessage('søknad.barnetillegg.leggTilBarn.modal.relasjon.label')}
            name={'relasjon'}
            error={errors?.relasjon?.message}
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
            legend={formatMessage('søknad.barnetillegg.leggTilBarn.modal.barnepensjon.label')}
            name={'barnepensjon'}
            error={errors?.barnepensjon?.message}
          >
            <ReadMore
              header={formatMessage(
                'søknad.barnetillegg.leggTilBarn.modal.barnepensjon.readMore.title'
              )}
            >
              {formatMessage('søknad.barnetillegg.leggTilBarn.modal.barnepensjon.readMore.text')}
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.JA}`)}</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.NEI}`)}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          {barnepensjon === JaEllerNei.NEI && (
            <RadioGroupWrapper
              control={control}
              legend={formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.label')}
              name={'harInntekt'}
              error={errors?.harInntekt?.message}
            >
              <ReadMore
                header={formatMessage(
                  'søknad.barnetillegg.leggTilBarn.modal.harInntekt.readMore.title'
                )}
              >
                {formatMessage('søknad.barnetillegg.leggTilBarn.modal.harInntekt.readMore.text')}
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.JA}`)}</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>{formatMessage(`answerOptions.jaEllerNei.${JaEllerNei.NEI}`)}</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          )}

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
            {barn ? (
              <Button
                type="button"
                variant={'danger'}
                onClick={() => {
                  onDeleteClick();
                }}
              >
                {formatMessage('søknad.barnetillegg.leggTilBarn.modal.buttons.slett')}
              </Button>
            ) : (
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onCloseClick();
                }}
              >
                {formatMessage('søknad.barnetillegg.leggTilBarn.modal.buttons.avbryt')}
              </Button>
            )}
            <Button type={'submit'}>
              {formatMessage('søknad.barnetillegg.leggTilBarn.modal.buttons.lagre')}
            </Button>
            {barn && (
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onCloseClick();
                }}
              >
                {formatMessage('søknad.barnetillegg.leggTilBarn.modal.buttons.avbryt')}
              </Button>
            )}
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
