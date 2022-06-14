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

export const AddBarnModal = ({
  getText,
  showModal,
  onDeleteClick,
  onCloseClick,
  onSaveClick,
  barn,
}: Props) => {
  const schema = yup.object().shape({});
  const { control, handleSubmit, setValue, reset, watch } = useForm<FieldValues>({
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

  console.log('barn', barn);

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
          />

          <TextFieldWrapper
            control={control}
            label={getText('form.barnetillegg.add.etternavn.label')}
            name={'navn.etternavn'}
          />

          <div className={classes.leggTilBarnFnrInput}>
            <TextFieldWrapper
              control={control}
              label={getText('form.barnetillegg.add.fnr.label')}
              name={'fnr'}
            />
          </div>

          <RadioGroupWrapper
            control={control}
            legend={'Hvilken relasjon har du til barnet?'}
            name={'relasjon'}
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
            <Button type={'submit'}>Lagre</Button>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                onCloseClick();
              }}
            >
              Avbryt
            </Button>
            {barn && (
              <Button
                type="button"
                variant={'danger'}
                onClick={() => {
                  onDeleteClick();
                }}
              >
                Slett
              </Button>
            )}
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
