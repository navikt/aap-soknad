import { yupResolver } from '@hookform/resolvers/yup';
import { FieldValues, useForm } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import * as yup from 'yup';
import * as classes from './AddBehandlerModal.module.css';
import { useEffect } from 'react';
import { Button, Heading, Modal } from '@navikt/ds-react';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';

interface Props {
  søknad?: Soknad;
  onCloseClick: () => void;
  onSaveClick: (data: any) => void;
  showModal: boolean;
  behandler?: any;
}

interface FormFields {
  firstname: string;
  lastname: string;
  legekontor: string;
  gateadresse: string;
  postnummer: string;
  poststed: string;
  telefon: string;
}

export const AddBehandlerModal = ({ showModal, onCloseClick, onSaveClick, behandler }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const schema = yup.object().shape({
    firstname: yup
      .string()
      .required(formatMessage('søknad.helseopplysninger.modal.fornavn.validation.required'))
      .nullable(),
    lastname: yup
      .string()
      .required(formatMessage('søknad.helseopplysninger.modal.etternavn.validation.required'))
      .nullable(),
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(behandler ? behandler : {}),
    },
  });

  useEffect(() => {
    reset({ ...behandler });
  }, [behandler, reset]);

  return (
    <Modal
      open={showModal}
      onClose={() => {
        reset();
        onCloseClick();
      }}
    >
      <Modal.Content className={classes?.addBehandlerModalContent}>
        <Heading className={classes?.modalHeading} size={'small'} level={'3'}>
          {formatMessage('søknad.helseopplysninger.modal.title')}
        </Heading>
        <form
          onSubmit={handleSubmit((data) => {
            const newData = { ...data };
            onSaveClick(newData);
            reset();
            onCloseClick();
          })}
          className={classes?.modalForm}
        >
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.fornavn.label')}
            name={'firstname'}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.etternavn.label')}
            name={'lastname'}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.legekontor.label')}
            name={'legekontor'}
          />
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.gateadresse.label')}
            name={'gateadresse'}
          />
          <div className={classes?.addresseFlexContainer}>
            <TextFieldWrapper
              className={classes?.addresseFlexItem}
              control={control}
              label={formatMessage('søknad.helseopplysninger.modal.postnummer.label')}
              name={'postnummer'}
            />
            <TextFieldWrapper
              className={classes?.addresseFlexItem}
              control={control}
              label={formatMessage('søknad.helseopplysninger.modal.poststed.label')}
              name={'poststed'}
            />
          </div>
          <TextFieldWrapper
            control={control}
            label={formatMessage('søknad.helseopplysninger.modal.telefonnummer.label')}
            name={'telefon'}
          />
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                reset();
                onCloseClick();
              }}
            >
              {formatMessage('søknad.helseopplysninger.modal.buttons.avbryt')}
            </Button>
            <Button type={'submit'}>
              {formatMessage('søknad.helseopplysninger.modal.buttons.lagre')}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
