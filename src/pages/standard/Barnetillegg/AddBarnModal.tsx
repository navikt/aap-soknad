import {
  Alert,
  BodyShort,
  Button,
  Cell,
  Grid,
  Heading,
  Ingress,
  Modal,
  Radio,
  ReadMore,
} from '@navikt/ds-react';
import * as classes from './Barnetillegg.module.css';
import { JaEllerNei } from '../../../types/Generic';
import React, { useEffect } from 'react';
import { GetText } from '../../../hooks/useTexts';
import Soknad from '../../../types/Soknad';
import TextFieldWrapper from '../../../components/input/TextFieldWrapper';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper/RadioGroupWrapper';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  onDeleteClick: () => void;
  showModal: boolean;
  barn?: any;
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
  const { control, handleSubmit, setValue, reset } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(barn ? barn : {}),
    },
  });
  useEffect(() => {
    reset({ ...barn });
  }, [barn, reset]);
  const clearModal = () => {
    setValue('navn.fornavn', '');
    setValue('navn.etternavn', '');
    setValue('fnr', '');
    setValue('harInntekt', null);
  };
  return (
    <Modal open={showModal} onClose={() => onCloseClick()}>
      <Modal.Content className={classes?.leggTilBarnModalContent}>
        <Heading size={'medium'} level={'2'}>
          {getText('form.barnetillegg.add.title')}
        </Heading>
        <Ingress>{getText('steps.barnetillegg.leggTil.description')}</Ingress>
        <form
          onSubmit={handleSubmit((data) => {
            onSaveClick(data);
            clearModal();
          })}
        >
          <Grid>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={getText('form.barnetillegg.add.fornavn.label')}
                name={'navn.fornavn'}
              />
            </Cell>
          </Grid>
          <Grid>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={getText('form.barnetillegg.add.etternavn.label')}
                name={'navn.etternavn'}
              />
            </Cell>
          </Grid>
          <Grid>
            <Cell xs={6}>
              <TextFieldWrapper
                control={control}
                label={getText('form.barnetillegg.add.fnr.label')}
                name={'fnr'}
              />
            </Cell>
          </Grid>
          <RadioGroupWrapper
            control={control}
            description={'Med inntekt mener vi arbeidsinntekt, kapitalinntekt og barnepensjon.'}
            legend={getText('form.barnetillegg.legend')}
            name={'harInntekt'}
          >
            <ReadMore header="Hvorfor spør vi om dette?">
              Hvis barnet har en årlig inntekt over 1G (1G = XXXkr), får du vanligvis ikke
              barnetillegg for barnet.
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>{JaEllerNei.JA}</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>{JaEllerNei.NEI}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
          <Alert variant={'info'}>
            {getText('form.barnetillegg.add.alertTitle')}
            <ul>
              <li>{getText('form.barnetillegg.add.alertBullet')}</li>
            </ul>
            {getText('form.barnetillegg.add.alertInfo')}
          </Alert>
          <Grid>
            <Cell xs={3}>
              <Button
                type="button"
                variant={'secondary'}
                onClick={() => {
                  clearModal();
                  onCloseClick();
                }}
              >
                Avbryt
              </Button>
            </Cell>
            <Cell xs={3}>
              <Button type={'submit'}>Lagre</Button>
            </Cell>
            <Cell xs={3}>
              <Button
                type="button"
                variant={'danger'}
                onClick={() => {
                  clearModal();
                  onDeleteClick();
                }}
              >
                Slett
              </Button>
            </Cell>
          </Grid>
        </form>
      </Modal.Content>
    </Modal>
  );
};
