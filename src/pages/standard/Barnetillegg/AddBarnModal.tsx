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
import { GetText } from '../../../hooks/useTexts';
import Soknad, { Barn } from '../../../types/Soknad';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as classes from './Barnetillegg.module.css';
import { ModalButtonWrapper } from '../../../components/ButtonWrapper/ModalButtonWrapper';

interface Props {
  getText: GetText;
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

const validateHarInntekt = (barnepensjon: JaEllerNei) => barnepensjon === JaEllerNei.NEI;

export const AddBarnModal = ({
  getText,
  showModal,
  onDeleteClick,
  onCloseClick,
  onSaveClick,
  barn,
}: Props) => {
  const schema = yup.object().shape({
    [NAVN]: yup.object().shape({
      fornavn: yup.string().required('Du må fylle inn barnets fornavn og mellomnavn.'),
      etternavn: yup.string().required('Du må fylle inn barnets etternavn.'),
    }),
    fnr: yup
      .string()
      .required('Du må fylle inn barnets fødselsnummer / D-nummer.')
      .length(11, 'Fødeslsnummer / D-nummer må være 11 siffer.'),
    relasjon: yup
      .string()
      .required('Du må svare på hvilken relasjon du har til barnet.')
      .oneOf([Relasjon.FORELDER, Relasjon.FOSTERFORELDER])
      .nullable(),
    barnepensjon: yup
      .string()
      .required('Du må svare på om barnet mottar barnepensjon.')
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
      .nullable(),
    harInntekt: yup.string().when('barnepensjon', {
      is: validateHarInntekt,
      then: (yupSchema) =>
        yupSchema
          .required('Du må svare på om barnet har en årlig inntekt over 1G.')
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
          {getText('form.barnetillegg.add.title')}
        </Heading>
        <Ingress>{getText('steps.barnetillegg.leggTil.description')}</Ingress>
        <form
          onSubmit={handleSubmit((data) => {
            onSaveClick(data);
          })}
        >
          <TextFieldWrapper
            control={control}
            label={getText('form.barnetillegg.add.fornavn.label')}
            name={'navn.fornavn'}
            error={errors?.[NAVN]?.fornavn?.message}
          />

          <TextFieldWrapper
            control={control}
            label={getText('form.barnetillegg.add.etternavn.label')}
            name={'navn.etternavn'}
            error={errors?.[NAVN]?.etternavn?.message}
          />

          <div className={classes.leggTilBarnFnrInput}>
            <TextFieldWrapper
              control={control}
              label={getText('form.barnetillegg.add.fnr.label')}
              name={'fnr'}
              error={errors?.fnr?.message}
            />
          </div>

          <RadioGroupWrapper
            control={control}
            legend={'Hvilken relasjon har du til barnet?'}
            name={'relasjon'}
            error={errors?.relasjon?.message}
          >
            <Radio value={Relasjon.FORELDER}>
              <BodyShort>Forelder</BodyShort>
            </Radio>
            <Radio value={Relasjon.FOSTERFORELDER}>
              <BodyShort>Fosterforelder</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          <RadioGroupWrapper
            control={control}
            legend={'Mottar barnet barnepensjon?'}
            name={'barnepensjon'}
            error={errors?.barnepensjon?.message}
          >
            <ReadMore header="Hvorfor spør vi om dette?">
              Hvis barnet mottar barnepensjon, får du ikke barnetillegg for barnet.
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>{JaEllerNei.JA}</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>{JaEllerNei.NEI}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          {barnepensjon === JaEllerNei.NEI && (
            <RadioGroupWrapper
              control={control}
              legend={getText('form.barnetillegg.legend')}
              name={'harInntekt'}
              error={errors?.harInntekt?.message}
            >
              <ReadMore header="Hvorfor spør vi om dette?">
                Hvis barnet har en årlig inntekt over 1G (1G = 111 477kr), får du vanligvis ikke
                barnetillegg for barnet.
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>{JaEllerNei.JA}</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>{JaEllerNei.NEI}</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          )}

          {relasjon === Relasjon.FORELDER && (
            <Alert variant={'info'}>
              {getText('form.barnetillegg.add.alertTitle')}
              <ul>
                <li>{getText('form.barnetillegg.add.alertBullet')}</li>
              </ul>
              {getText('form.barnetillegg.add.alertInfo')}
            </Alert>
          )}
          {relasjon === Relasjon.FOSTERFORELDER && (
            <Alert variant={'info'}>
              {getText('form.barnetillegg.add.alertTitle')}
              <ul>
                <li>{getText('form.barnetillegg.add.alertBullettFosterforelder')}</li>
              </ul>
              {getText('form.barnetillegg.add.alertInfo')}
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
                Slett
              </Button>
            ) : (
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onCloseClick();
                }}
              >
                Avbryt
              </Button>
            )}
            <Button type={'submit'}>Lagre</Button>
            {barn && (
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  onCloseClick();
                }}
              >
                Avbryt
              </Button>
            )}
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
